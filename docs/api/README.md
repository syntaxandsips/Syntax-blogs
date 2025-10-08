# Syntax & Sips API Reference

This document catalogues every Next.js route handler exposed under `/api`. All routes return JSON responses unless explicitly noted. Authenticated endpoints rely on Supabase sessions persisted via cookies; ensure requests include the browser session or service role key when using server-side clients.

- **Base URL (local):** `http://localhost:3000`
- **Base URL (production):** `https://www.syntax-blogs.prashant.sbs`
- **Authentication:** Supabase Auth via cookies (`sb-access-token`, `sb-refresh-token`). Admin endpoints additionally verify `profiles.is_admin`.
- **Rate limiting:** `src/lib/rate-limit.ts` provides in-memory throttling for high-risk flows (e.g., community submissions, author applications).

## Contents

1. [Public Content](#1-public-content)
2. [Newsletter Lifecycle](#2-newsletter-lifecycle)
3. [Search](#3-search)
4. [Authentication](#4-authentication)
5. [Profile & Media](#5-profile--media)
6. [Gamification](#6-gamification)
7. [Community Programs](#7-community-programs)
8. [Admin Console](#8-admin-console)

---

## 1. Public Content

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/posts` | List published posts ordered by `published_at`. | Not required |
| GET | `/api/posts/trending` | List top viewed posts. Accepts `limit` query (1-12). | Not required |
| POST | `/api/posts/{slug}/view` | Increment view count via Supabase RPC `increment_post_views`. | Not required |
| GET | `/api/posts/{slug}/comments` | Fetch approved comments for a published post. | Not required |
| POST | `/api/posts/{slug}/comments` | Submit a new comment (pending moderation). | Session optional (anonymous allowed) |

### GET /api/posts
- **Response:** `{ posts: BlogListPost[] }` (see `src/lib/posts.ts`).
- **Errors:** `500` on Supabase failure.

### GET /api/posts/trending
- **Query Parameters:** `limit` (optional, integer, default `6`).
- **Response:** `{ posts: BlogListPost[] }`.
- **Errors:** `500` on Supabase failure.

### POST /api/posts/{slug}/view
- **Body:** None.
- **Response:** `{ views: number }` after invoking `increment_post_views`.
- **Errors:** `404` if RPC returns no row, `500` on RPC error.

### GET /api/posts/{slug}/comments
- **Response:** `{ comments: Array<{ id, content, status, createdAt, author }> }` where `author` includes admin flag and primary role metadata.
- **Errors:** `404` if post does not exist, `500` on Supabase failure.

### POST /api/posts/{slug}/comments
- **Body:** `{ content: string }` (minimum 10 characters).
- **Response:** `201` with message confirming moderation queue entry.
- **Errors:** `404` when post not found, `422` for validation errors, `500` on insert failure.

---

## 2. Newsletter Lifecycle

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/newsletter` | Start subscription workflow; emails a confirmation link. | Not required |
| GET | `/api/newsletter/confirm` | Redirect-based confirmation using `token` and `email` query params. | Not required |
| GET | `/api/newsletter/unsubscribe` | Redirect-based unsubscribe using `email` query param. | Not required |

### POST /api/newsletter
- **Body:** `{ email: string }`.
- **Query Parameters:** `source` (optional) for attribution.
- **Response:** `{ message: string }` with copy adjusted for resubscribes.
- **Errors:** `422` invalid email, `500` on Supabase or Mailtrap failure.

### GET /api/newsletter/confirm
- **Query Parameters:** `token`, `email`.
- **Response:** HTTP redirect to `/newsletter-confirmed?status={success|expired|invalid|error}`.

### GET /api/newsletter/unsubscribe
- **Query Parameters:** `email`.
- **Response:** HTTP redirect to `/newsletter-unsubscribed?status={success|missing|invalid|error}`.

---

## 3. Search

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/search` | Full-text search across published posts. | Not required |

- **Query Parameters:** `q` (required, string).
- **Response:** `{ results: BlogListPost[] }` (limited to 20).
- **Errors:** `500` on Supabase failure.

---

## 4. Authentication

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/session` | Sync Supabase auth events from the client. | Requires Supabase session cookie |
| GET | `/api/auth/me` | Return the authenticated profile, roles, and onboarding journey. | Requires Supabase session cookie |

### POST /api/auth/session
- **Body:** `{ event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session?: Session }`.
- **Behavior:** Persists or clears Supabase session server-side using `supabase.auth.setSession` / `signOut`.
- **Errors:** `400` missing required fields, `500` if Supabase session operations fail.

### GET /api/auth/me
- **Response:** `{ profileId, userId, email, displayName, roles, onboarding, ... }` (`AuthenticatedProfileSummary`).
- **Errors:** `401` unauthenticated, `404` if profile not found, `500` on Supabase errors.

---

## 5. Profile & Media

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/profile/avatar` | Upload a new avatar image to Supabase Storage (bucket `profile-photos`). | Requires Supabase session cookie |

### POST /api/profile/avatar
- **Body:** `multipart/form-data` with `file` field (PNG, JPG, GIF, SVG, WebP up to 5 MB).
- **Response:** `{ avatarUrl: string }` and removes any previous avatar owned by the profile.
- **Errors:** `400` invalid payload or validation error, `401` unauthenticated, `500` storage failures.

---

## 6. Gamification

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/gamification/profile` | Return XP, badges, and streak data for the current or specified profile. | Requires Supabase session cookie; admin override to inspect others |
| GET | `/api/gamification/challenges` | List active challenges with optional per-user progress. | Optional (progress requires session) |
| GET | `/api/gamification/leaderboards` | Fetch leaderboard standings. Accepts `scope`, `category`, `limit`. | Not required |
| POST | `/api/gamification/actions` | Record a gamification action (points, badge triggers). | Requires Supabase session cookie |

### GET /api/gamification/profile
- **Query Parameters:** `profileId` (optional; admin required to view others).
- **Response:** Payload from `fetchGamificationProfile` containing totals, recent actions, badges, and streak metadata.

### GET /api/gamification/challenges
- **Response:** `{ challenges: Array<{ id, slug, rewardPoints, status, progress, ... }> }` with per-user progress when authenticated.

### GET /api/gamification/leaderboards
- **Query Parameters:**
  - `scope`: `global` | `seasonal` | `category` (default `global`).
  - `category`: optional slug when `scope=category`.
  - `limit`: integer, default `10`.
- **Response:** Leaderboard entries with profile display names, XP, and ranks.

### POST /api/gamification/actions
- **Body:** `{ profileId?, actionType?, metadata?, actionSource?, requestId? }` (defaults to the caller's profile and `custom.manual_adjustment`).
- **Response:** `{ result }` from `recordAction`, including awarded points/badges.
- **Errors:** `401` unauthenticated, `403` insufficient permissions, `404` profile not found, `500` processing errors.

---

## 7. Community Programs

Endpoints orchestrate contributor submissions and author applications. All require authenticated Supabase sessions.

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/community/submissions` | List submissions created by the authenticated contributor. | Requires Supabase session cookie |
| POST | `/api/community/submissions` | Create, autosave, or submit a draft. Validates via `communitySubmissionSchema`. | Requires Supabase session cookie |
| POST | `/api/community/submissions/{id}/submit` | Force submit a draft for review. | Requires Supabase session cookie |
| POST | `/api/community/submissions/{id}/withdraw` | Withdraw a submitted draft. | Requires Supabase session cookie |
| POST | `/api/community/submissions/{id}/feedback` | Request editorial feedback with optional notes. | Requires Supabase session cookie |
| POST | `/api/community/submissions/{id}/approve` | Approve submission (editorial staff). | Requires Supabase session cookie with staff privileges |
| POST | `/api/community/submissions/{id}/decline` | Decline submission with rationale. | Requires Supabase session cookie with staff privileges |
| GET | `/api/community/author-applications` | Return the latest author application for the session profile. | Requires Supabase session cookie |
| POST | `/api/community/author-applications` | Submit or update an author application (HCaptcha required). | Requires Supabase session cookie |

### Submission Payload (`POST /api/community/submissions`)
- Refer to [`communitySubmissionSchema`](../../src/lib/validation/community.ts) for full shape.
- Key fields: `title`, `summary`, `categories[]`, `tags[]`, `content`, `checklist`, `intent` (`autosave`, `save`, `submit`).
- Autosave intent stores `last_autosaved_at`; submit enforces editorial checklist completion.
- **Response:** `{ submission, message }`.
- **Rate limiting:** 12 writes/minute per profile/IP.

### Submission Transitions
- Transition routes share a payload of `{ notes?: string }` and rely on `submissionTransitionSchema` within each handler to enforce valid states.
- Responses return updated submission records or status messages; errors include `403` for permission issues, `409` for invalid state, `500` on Supabase failures.

### Author Applications (`POST /api/community/author-applications`)
- **Body:** Matches `authorApplicationSchema` including HCaptcha token.
- **Behavior:** Deduplicates active applications (`submitted`, `under_review`, `accepted`, `needs_more_info`).
- **Rate limiting:** 6 submissions/minute per profile/IP.
- **Response:** `{ application, message }` for new or updated submissions.

---

## 8. Admin Console

Admin routes require a Supabase session whose profile has `is_admin = true`. All routes return `401` or `403` if permissions are missing.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/admin/posts` | List all posts with full metadata for dashboard management. |
| POST | `/api/admin/posts` | Create a new post. |
| PATCH | `/api/admin/posts/{id}` | Update an existing post. |
| DELETE | `/api/admin/posts/{id}` | Remove a post. |
| GET | `/api/admin/users` | List profiles, roles, and admin flags. |
| PATCH | `/api/admin/users/{id}` | Update profile attributes (roles, admin flag). |
| DELETE | `/api/admin/users/{id}` | Remove a profile and corresponding Supabase auth user. |
| GET | `/api/admin/comments` | List comments with moderation metadata. |
| PATCH | `/api/admin/comments/{id}` | Update comment status or notes. |
| DELETE | `/api/admin/comments/{id}` | Permanently remove a comment. |
| GET | `/api/admin/community/queue` | Fetch submission queue with contributor info. |
| GET | `/api/admin/gamification/analytics` | Return XP totals, streak summaries, and badge stats. |
| GET | `/api/admin/gamification/challenges` | List challenges for management. |
| POST | `/api/admin/gamification/challenges` | Create or update a challenge (upsert by slug). |
| GET | `/api/admin/gamification/badges` | List configured badges. |
| POST | `/api/admin/gamification/badges` | Create or update a badge (upsert by slug). |
| POST | `/api/admin/media` | Generate signed upload URLs for Supabase Storage. |
| GET | `/api/admin/settings` | Retrieve site settings (branding, navigation). |
| PATCH | `/api/admin/settings` | Update site settings. |

### Admin Payloads
- **Posts:** JSON aligned with `AdminPost` (`@/utils/types`). Include `title`, `slug`, `content`, `status`, optional media URLs, category and tag IDs.
- **Users:** Accepts role adjustments and admin toggles (`@/utils/types` → `AdminUser` / `AdminUserRole`).
- **Comments:** Supports moderation transitions (`approved`, `rejected`, `pending`).
- **Gamification:** Challenge and badge routes align with schemas in `@/lib/gamification` modules.
- **Media:** `POST /api/admin/media` expects `{ fileName, contentType }` and responds with signed upload info.

### Error Handling
- All admin endpoints return structured errors: `{ error: string }` with appropriate HTTP status codes (`400` validation, `401/403` auth, `404` missing records, `409` state conflicts, `500` server errors).
- Logs include contextual messages; review Vercel/Supabase logs for stack traces when debugging production incidents.

---

## Webhooks & Background Jobs

- Supabase Edge Functions (e.g., `newsletter-subscribe`) complement these APIs for asynchronous tasks. Document additional webhooks alongside their function code when introduced.

---

## Versioning

- Changes to endpoints should be reflected here and in [`CHANGELOG.md`](../../CHANGELOG.md).
- For breaking changes, bump the major version and provide migration guidance.

