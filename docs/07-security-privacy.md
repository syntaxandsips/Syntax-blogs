# Security & Privacy Plan

## 1. Threat Model Summary
| Threat | Vector | Impact | Mitigation |
| --- | --- | --- | --- |
| Account takeover | Credential stuffing against Supabase Auth | Unauthorized content edits, payouts | Enforce MFA for staff/moderators, rate limit login attempts, monitor unusual IP/device patterns |
| Privilege escalation | Misconfigured RLS or API bypass | Exposure of private spaces, unauthorized sanctions | Comprehensive authz matrix tests, code reviews, feature flag gating, policy linting |
| Payment fraud | Compromised payment forms or webhook replay | Financial loss, compliance breach | PCI-compliant providers, webhook signature verification, fraud scoring, dispute workflow |
| Data exfiltration | Injection via content editors or search queries | Leakage of PII, content | Use parameterized queries, content sanitization, CSP headers, Supabase RLS |
| Abuse & harassment | Direct messages or comments used for harassment | Trust & safety incidents | Automod heuristics, reporting flow, sanctions, block/report features, rate limits |
| Availability attack | Bot traffic on search/feed endpoints | Degraded experience | CDN caching, rate limiting, circuit breakers, autoscaling |
| Compliance failure | Missing audit logs, retention mismanagement | Regulatory fines | Immutable audit logs, retention policies, periodic compliance reviews |

## 2. Authorization Matrix (Excerpt)
| Resource | Member | Contributor | Organizer | Moderator | Admin |
| --- | --- | --- | --- | --- | --- |
| View public spaces | ✓ | ✓ | ✓ | ✓ | ✓ |
| Join request private space | Request | Request | ✓ | ✓ | ✓ |
| Create articles/discussions | ✗ | ✓ (own spaces) | ✓ | ✓ | ✓ |
| Publish scheduled content | ✗ | With organizer approval | ✓ | ✓ | ✓ |
| Manage templates/flairs | ✗ | ✗ | ✓ | ✓ | ✓ |
| Moderate reports | ✗ | ✗ | Limited (own content) | ✓ | ✓ |
| Issue sanctions | ✗ | ✗ | ✗ | ✓ (space scope) | ✓ (global) |
| Configure automod rules | ✗ | ✗ | ✓ | ✓ | ✓ |
| Manage donations/payouts | View | View own | ✓ (space scope) | ✓ (space scope) | ✓ (global) |
| Access feature flags | ✗ | ✗ | ✗ | ✗ | ✓ |

Full matrix with endpoint mapping maintained alongside Supabase policy definitions. Automated tests validate allow/deny paths per `/tests/security`.

## 3. Input Validation & Sanitization
- Use Zod schemas for all API inputs, with centralized validation utilities.
- Sanitize rich text/HTML via vetted library (e.g., DOMPurify) server-side before storage.
- Implement rate limiting on mutation endpoints (Upstash Redis or Supabase Edge functions).
- Use content filters for banned domains/terms stored in `automod_rules`.

## 4. Privacy & PII Inventory
| Data Type | Location | Purpose | Protection |
| --- | --- | --- | --- |
| Email, name | `profiles`, Auth | Account management, notifications | Stored via Supabase; restrict direct access; mask in logs |
| Payment method tokens | `payment_methods` | Donations/payouts | Tokenized via provider; encrypted at rest; limited access roles |
| Government IDs (KYC) | `payout_accounts` | Compliance | Stored encrypted; access restricted to admins with auditing |
| Attendance data | `event_tickets`, `workshop_enrollments` | Event analytics | Retention 24 months; aggregated after expiry |
| Messaging content | `comments`, `direct_message_messages` | Community engagement | Encryption at rest; user deletion controls; abuse retention |
| Location/venue data | `events` | Event logistics | Access limited to space organizers/moderators |

Provide user-facing privacy controls (download/delete data) and document flows in ToS/privacy policy updates.

## 5. Incident Response & RACI
| Activity | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Detection & triage | SRE on-call | Head of Engineering | Product Manager, Security Lead | Executives, Support |
| Containment & eradication | Engineering feature owners | Head of Engineering | Security Lead, Supabase Support | Legal, Support |
| Recovery & validation | QA Lead | Head of Product | SRE, Feature Owners | Community Managers |
| Customer communication | Support Lead | Head of Product | Legal, PR | Impacted Users, Executives |
| Post-incident review | Security Lead | Head of Engineering | Product, SRE, Design | All stakeholders |

## 6. Compliance Checklist
- Document ToS, Privacy Policy, Community Guidelines, Contributor Covenant, DMCA workflow under `/docs/legal` (to be created).
- Maintain DPIA for payments and messaging features.
- Ensure data processing agreements with payment providers and conferencing vendors.
- Implement GDPR/CCPA data access & deletion workflows (self-serve + manual override).

## 7. Telemetry for Security
- Emit audit events for login attempts, role changes, flag toggles, payout status changes.
- Monitor anomaly detection metrics (failed logins, payment declines, report spikes).
- Trigger alerts for suspicious admin activity (multiple sanctions in short window).

## 8. Outstanding Security Questions
- Which third-party tool handles feature flagging? Impacts data residency and access controls.
- Finalize SSO strategy for enterprise customers (OIDC, SAML?).
- Confirm whether messaging requires E2EE or content scanning for compliance regions.
