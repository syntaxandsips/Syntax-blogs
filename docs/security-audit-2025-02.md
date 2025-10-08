# Security & Quality Audit – Syntax & Sips

_Date: 2025-02-14_

## Scope & Methodology
- Reviewed server-side API routes, Supabase client helpers, and shared libraries under `src/`.
- Focused on security (OWASP Top 10 alignment), business logic integrity, and abuse-prevention controls.
- Inspected supporting utilities (rate limiting, validation, mailing) and examined how they are composed inside request handlers.

## High-Level Observations
- Supabase service-role client is the default for many read/write paths, which centralizes privilege but raises the blast radius if any route is compromised.
- Input validation coverage is generally strong thanks to `zod` schemas, but several endpoints omit secondary controls (rate limiting, proof-of-possession tokens).
- Client components avoid direct service-role usage, reducing the chance of leaking privileged credentials.

## Findings

| # | Category | Severity | Component | Summary |
|---|----------|----------|-----------|---------|
| 1 | Security | **High** | `src/app/api/newsletter/unsubscribe/route.ts` | Newsletter unsubscribe endpoint accepts any `email` query parameter with no verification token, letting an attacker unsubscribe arbitrary users. |
| 2 | Security | Medium | `src/app/api/newsletter/route.ts` | Newsletter subscribe endpoint lacks rate limiting or bot protection, enabling email-bombing/spam campaigns through automated POSTs. |
| 3 | Security | Medium | `src/lib/posts.ts` (`searchPublishedPosts`) | User-provided search term is interpolated into a PostgREST `.or()` filter without escaping commas/parentheses, allowing crafted input to manipulate filters. |
| 4 | Security / Logic | Medium | `src/app/api/community/submissions/_shared.ts` and `src/app/api/community/author-applications/route.ts` | Rate limiting trusts `X-Forwarded-For`/`X-Real-IP` headers directly, so clients can spoof IPs to bypass abuse controls. |

## Detailed Issue Notes

### 1. Unauthenticated Newsletter Unsubscribe (High)
- **Location**: `src/app/api/newsletter/unsubscribe/route.ts` lines 14–33; `src/lib/newsletter.ts` lines 163–197.
- **Problem**: The GET handler only checks for the presence of an `email` query string, then calls `unsubscribeSubscriber` which immediately clears the subscription. No confirmation token, authentication, or HMAC is required.
- **Impact**: Anyone who knows or guesses a subscriber’s email can silently opt them out (e.g., via crafted `<img>` tags or a crawler), violating CAN-SPAM/GDPR consent expectations and eroding trust.
- **Recommendation**: Require a signed, single-use unsubscribe token (mirroring the confirmation flow) and switch to a POST with CSRF protection. Consider logging the IP/user agent for incident response.

### 2. Newsletter Subscription Abuse (Medium)
- **Location**: `src/app/api/newsletter/route.ts` lines 40–84.
- **Problem**: The endpoint sends transactional email for every valid request, but there is no rate limiting, captcha, or IP reputation check.
- **Impact**: Attackers can script thousands of requests to flood downstream email systems, consume quota, or use the platform for email bombing. This also increases the chance of provider blacklisting.
- **Recommendation**: Add rate limiting keyed by IP/email, integrate existing hCaptcha utilities, and throttle repeated resend attempts (store timestamp in `newsletter_subscribers.metadata`).

### 3. PostgREST Filter Injection in Search (Medium)
- **Location**: `src/lib/posts.ts` lines 340–377.
- **Problem**: `searchPublishedPosts` interpolates raw user input into the `.or()` filter string. While `%` and `_` are escaped, commas and parentheses are not, which PostgREST interprets as condition separators.
- **Impact**: A crafted query (e.g., `q=foo),status.eq.draft`) could append new filters. Combined with the service-role client, this risks disclosing draft content or returning unintended rows.
- **Recommendation**: Use PostgREST parameterized filters (multiple `.ilike` calls) or escape `,` and `)` with `\,` and `\)` per PostgREST rules. Alternatively, switch to `textSearch` with `plainto_tsquery`.

### 4. Spoofable Rate-Limit Keys (Medium)
- **Location**: `src/app/api/community/submissions/_shared.ts` lines 8–11; `src/app/api/community/author-applications/route.ts` lines 14–19 & 60–69.
- **Problem**: The helper derives the caller’s identity from `X-Real-IP` / `X-Forwarded-For` headers without verifying they were set by trusted infrastructure. Clients can supply arbitrary headers to obtain unique limit buckets.
- **Impact**: Attackers can bypass submission throttling, enabling brute-force or spam of community drafts and author applications despite the intended guardrails.
- **Recommendation**: Prefer `request.ip` (in Next.js middleware) or a trusted reverse-proxy header exposed via environment configuration. At minimum, strip untrusted headers or fall back to session/user IDs for the key.

## Additional Recommendations
- **Service-role blast radius**: Audit routes that rely on the service-role client (`createServiceRoleClient`). Where possible, enforce RLS with policy-based access and only use the service key for trusted administrative operations.
- **Logging & monitoring**: Many catch blocks log generic messages. Consider structured logging (user ID, route, correlation IDs) and integrate with centralized monitoring to spot abuse early.
- **GET side-effects**: Avoid state-changing GET routes (e.g., unsubscribe) to reduce CSRF surface area and align with REST semantics.

## Suggested Next Steps
1. Prioritize implementing the unsubscribe token workflow and deploy a regression test to cover unauthorized attempts.
2. Add rate limiting/bot mitigation to newsletter and other public endpoints; reuse the existing `rateLimit` helper once IP spoofing is addressed.
3. Harden search query construction to eliminate PostgREST injection primitives.
4. Document trust boundaries for inbound headers and configure infrastructure (or middleware) to normalize client IPs safely.

---
Prepared by: _Automated Security & QA Analyst_
