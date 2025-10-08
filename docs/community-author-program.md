# Community Author Program Blueprint

## Research Snapshots

- The live site at [syntax-blogs.prashant.sbs](https://syntax-blogs.prashant.sbs) presents curated long-form stories, topic hubs, newsletters, and multimedia routes built with the Next.js App Router and a Supabase-backed editorial stack.【F:README.md†L16-L68】
- Authenticated contributors already flow through a Supabase-driven onboarding journey (`/onboarding`) and reach an admin cockpit with analytics, content workflow tables, and moderation tooling.【F:src/app/onboarding/page.tsx†L1-L73】【F:README.md†L24-L70】
- Existing Supabase schema centers on `posts`, taxonomy, `profiles`, roles, and RLS-protected admin operations, providing a solid foundation for extending community publishing.【F:README.md†L72-L104】
- **Brand positioning:** Homepage hero messaging (“Welcome to the digital brew”) and CTA mix (“Read the latest blog”, “Watch on YouTube”) reinforce an inclusive, community-forward vibe that pairs well with inviting guest authors.
- **Information architecture:** Primary navigation (Home, Blogs, Podcasts, Changelogs), topic filters (Machine Learning, Data Science, Quantum Computing, etc.), and an existing newsletter subscription form create clear anchor points for new application CTAs and guidance content.

## Vision

Enable two complementary community entry points:
1. **Apply to become an author** – a guided intake that qualifies prospective creators before elevating their permissions.
2. **Submit a draft for editorial review** – a submission studio where approved community members can craft posts that route into the existing admin workflow for review, edits, and publication.

The flow should mirror mature editorial platforms (Dev.to, Hashnode, Medium Partner Program) where applications gather expertise evidence, and approved writers use a submission UI that enforces structured metadata, compliance acknowledgements, and automated reviews before staff approval.
Both experiences should echo Syntax & Sips’ inclusive “digital brew” tone while remaining grounded in the App Router architecture and Supabase security conventions already in production.

## Feature Pillars & Forms

### 1. “Become an Author” Landing Page (`/apply/author`)
- **Implementation prompt:**
  > *"Brew Your Voice Into Syntax & Sips" – craft a conversational landing page that welcomes prospective contributors, highlights why to contribute, what we publish, the author journey (Apply → Draft & Collaborate → Publish), perks/support, and ends with a CTA duo (“Apply to Become an Author”, “View Author Guidelines”). Keep beverage metaphors playful but sparing and align visuals with the existing neo-brutalist theme.*
- **Creative direction:**
  - **Headline:** “Brew Your Voice Into Syntax & Sips”.
  - **Subheadline:** “Share your AI, ML, dev, or gaming insights with a community that loves thoughtful tech conversations.”
  - Key sections: Why Contribute, What We Publish (mirror topic pillars such as Machine Learning, Data Science, Quantum Computing, Coding Tutorials, Reviews, Video Content, Gaming), Author Journey (Apply → Draft & Collaborate → Publish), Perks & Support, closing CTA block.
  - Primary CTA: “Apply to Become an Author” (opens the form modal or scrolls to the application section).
  - Secondary CTA: “View Author Guidelines” (links to contributor docs).
- **Application form fields:**
  - Contact: full name (auto-hydrate from profile), email (read-only from Supabase), optional pronouns.
  - Background: focus areas (multi-select mapped to taxonomy), experience level, current role, community participation.
  - Portfolio: published links, social handles, optional writing sample upload (Supabase Storage) with MIME validation.
  - Pitch: proposed topics/series, target audience, publishing cadence, availability.
  - Compliance: consent checkbox for terms/privacy, acknowledgement of editorial policies, optional newsletter opt-in.
- **Submission UX:** eligibility checklist, progress indicator, hCaptcha/reCAPTCHA, Supabase function to prevent duplicate active applications, autosave Draft state, confirmation screen with review SLA and guidelines link.

### 2. Community Submission Studio (`/creator/workspace`)
- **Implementation prompt:**
  > *Build a contributor workspace for approved authors featuring breadcrumb + status banner, structured metadata form, MDX editor with autosave, editorial checklist sidebar, revision history, and actions to save, submit, or withdraw drafts. Surface status-driven notifications and reuse existing markdown components for a consistent Syntax & Sips experience.*
- **Eligibility gating:** only visible to authenticated users with an `approved` contributor status flag (e.g., `profile_roles.contributor = true`).
- **Workspace layout:**
  - Breadcrumb + status banner (Draft, Submitted, In Review, Needs Revision, Approved, Scheduled, Published).
  - Metadata panel: title, slug suggestion (auto-generated + collision check), summary, reading time estimate, categories (multi-select), tags, canonical URL, optional series, featured image upload (dimension + size validation).
  - Body editor: MDX/markdown editor with preview, support for embeds and code blocks, autosave timestamp surfaced near actions.
  - Editorial checklist sidebar: word count, tone guidance, accessibility checklist, required assets with auto-highlight for missing fields.
  - Collaboration: notes to editors, optional co-author mention, supporting file attachments (Supabase Storage signed URLs).
  - Revision history: timeline of reviewer comments, contributor responses, and status changes.
  - Actions: Save Draft, Submit for Review, Withdraw Submission; disable invalid transitions based on workflow state machine.

### 3. Admin & Workflow Enhancements
- **Application review queue:** new admin table surface to triage `author_applications`, view profile context, add internal notes, approve/decline with templated responses.
- **Submission review pipeline:** integrate community drafts into existing posts table with statuses (`draft`, `in_review`, `needs_changes`, `scheduled`, `published`) and filters by submission origin.
- **Notifications:**
  - Email + in-app notifications when application status changes or feedback posted.
  - Slack/webhook optional for editorial team alerts.

## Data Model Extensions

| Table | Key Columns | Notes |
| --- | --- | --- |
| `author_applications` | `id`, `profile_id` (FK), `status` (`submitted`, `under_review`, `accepted`, `rejected`, `needs_more_info`), `submitted_at`, `reviewed_by`, `review_notes`, `application_payload` (JSONB) | Store form responses and review audit trail.
| `contributors` (or extend `profile_roles`) | `profile_id`, `status`, `approved_at`, `expires_at`, `level` (`guest`, `contributor`, `editor`), onboarding checklist state, signed agreement flag | Drive gating logic for workspace access.
| `draft_submissions` | `id`, `profile_id`, `post_id` (nullable until approved), `title`, `slug`, `summary`, `content`, `metadata` JSONB, `status`, `reading_time`, `submitted_at`, `reviewed_at`, `feedback` | Keeps submission history even if post rejected.
| `submission_comments` | `id`, `draft_id`, `author_id`, `body`, `visibility`, timestamps | Threaded reviewer feedback linked to drafts.
| `submission_events` | `id`, `entity_id`, `entity_type`, `event`, `payload`, `actor_id`, timestamps | Audit log for application and draft state changes.
| `submission_revisions` | `submission_id`, `version`, `content`, `editor_notes`, timestamps | Optional version control for back-and-forth edits.

- Leverage Supabase row level security to ensure applicants can only see their records and admins (role `editor`/`admin`) can review.
- Use triggers to auto-create `community_submissions` entries in `posts` upon approval, inheriting taxonomy relationships.

## API & Server Architecture

- **Route handlers:**
  - `POST /api/community/author-applications` – create/update application, validate payload server-side, send confirmation email.
  - `GET /api/community/author-applications/me` – fetch latest application for logged-in user.
  - `POST /api/community/submissions` – create or update draft.
  - `POST /api/community/submissions/{id}/submit` – transition to `in_review`, notify editors.
  - `POST /api/community/submissions/{id}/feedback` – admin-only to request changes.
  - `POST /api/community/submissions/{id}/approve` – admin-only to convert into `posts` record, assign slug, schedule.
  - `POST /api/community/submissions/{id}/withdraw` – contributor-only revert to Draft state with audit entry.
  - Edge function/webhook: push notifications and run automated linting (tone, plagiarism, toxicity) before human review.
- **Supabase Edge Functions:** optional automation for sending transactional emails, running AI-assisted linting (toxicity, plagiarism) before review.
- **Validation:** use Zod schemas shared across client/server to prevent tampering, enforce length limits, sanitize HTML embeds.

## Security & Compliance

- Enforce Supabase RLS policies with `auth.role()` checks, verifying `approved_author` or admin roles for submission endpoints.
- Require authenticated Supabase sessions for all writes; anonymous visitors can view the landing page but must sign in before applying.
- Rate-limit application and submission routes (middleware or Vercel Edge + Upstash Redis) to deter spam/bot abuse.
- Server-side slug generation + collision checks; never trust client-provided slugs.
- Sanitize markdown via trusted pipeline (e.g., `rehype-sanitize`) to prevent XSS when rendering community content.
- Require reCAPTCHA or hCaptcha on the application form; run dedupe checks before insert.
- Validate uploads (MIME, dimensions, size) and store in a restricted `author-submissions` Supabase Storage bucket with signed URL delivery.
- Log moderation actions (who approved, when) for auditing and store in `submission_events`.
- Add content scanning (OpenAI moderation, Perspective API) for flagged terms before publication.
- Provide authors with legal acknowledgement for AI-generated content disclosure to stay compliant with platform policies.
- Capture explicit consent for data handling and optional newsletter opt-in to satisfy privacy requirements.

## Integration with Existing System

1. **Navigation:** Add CTA blocks on the homepage hero and footer pointing to `/apply/author`; surface a "Submit a story" button in user dashboards that routes approved contributors to `/creator/workspace`.
2. **Onboarding linkage:** Extend `OnboardingFlow` to surface the author program step if a user opts into contributing, pre-filling application data where possible and linking back to `/apply/author`.【F:src/components/auth/OnboardingFlow.tsx†L1-L114】
3. **Shared collateral:** Host contributor guidelines in `src/docs/author-guidelines.mdx` (new) and reuse across the landing page, confirmation screens, and workspace sidebar.
4. **Admin workspace:** Introduce new tabs/cards inside `AdminDashboard` and `PostsTable` for "Community" pipelines, reusing existing table patterns, filters, and detail drawers.【F:README.md†L34-L68】 Add a dedicated `/admin/review-queue` view segmented by applications vs. drafts.
5. **Supabase roles:** When an application is approved, assign a `contributor` role via `profile_roles` (or insert into `contributors`) to unlock workspace routes. Declined applicants keep standard reader roles.
6. **Publishing path:** Approved submissions feed the same `posts` table so analytics, newsletters, and topic explorers automatically pick up new stories without extra wiring.
7. **Notifications:** Reuse the newsletter/email infrastructure for transactional messages (application received, decision, draft feedback, publication) triggered from edge functions.
8. **Analytics:** Track form conversion, draft progression, and publication outcomes through existing analytics utilities (`src/lib/analytics` if available) to measure program success.

## Workflow States

- **Applications:** `submitted → under_review → accepted/rejected → onboarding_complete`.
- **Drafts:** `draft → submitted → in_review → needs_revision → approved → scheduled → published`.
- Enforce transitions through Supabase RPCs or edge functions that validate permissions, capture audit entries (`submission_events`), and dispatch notifications.

## Forms & UX Requirements

- **Application form:** public route `/apply/author`, requires authentication, includes hCaptcha/reCAPTCHA, dedupe guardrail, and a confirmation view outlining the review timeline and linking to guidelines.
- **Draft submission form:** protected route `/creator/workspace` built with existing UI primitives; autosaves via debounced Supabase writes, validates uploads with signed URLs, and surfaces last autosave timestamp.
- **Status visibility:** applicants and contributors can view status from their dashboard cards, while editors access filtered queues and revision history threads.

## Implementation Roadmap

1. **Schema migration:** Create tables, enums, policies, triggers.
2. **API layer:** Implement route handlers with Supabase service role, integrate with existing logging and error utilities.
3. **Frontend pages:** Build `/apply/author` and `/creator/workspace` using existing UI primitives (form components, markdown editor). Ensure responsive design, accessibility, and brand-aligned copy.
4. **Admin extensions:** Add review queues, notifications, and analytics widgets.
5. **QA & Testing:**
   - Unit test validation schemas.
   - Playwright flows for application submission and admin approval.
   - Supabase policy tests to confirm RLS integrity.
6. **Launch comms:** Update documentation, FAQs, and include new CTAs in marketing pages.

## Sample Build Prompt

> *"Extend Syntax & Sips with a community author program. Add an authenticated `/apply/author` experience where logged-in readers review program benefits and submit an application capturing expertise, focus areas, writing samples, and policy acknowledgements (protected by hCaptcha and duplication checks). Persist applications in a Supabase `author_applications` table with RLS so applicants can view their status. Build a `/creator/workspace` studio gated to approved contributors that provides structured metadata inputs, MDX editor with autosave, editorial checklist, revision history, and actions to save drafts, submit for review, or withdraw. Wire both flows to Next.js route handlers (`/api/community/author-applications`, `/api/community/submissions`) with shared Zod validation and edge functions for notifications/moderation. Update the admin dashboard with a community review queue supporting approve/decline/feedback operations that update Supabase, emit audit events, and notify users. Reuse existing UI components, respect the neo-brutalist design system, and ensure security via rate limiting, content sanitization, and audit logging."*

## Competitive Notes

- **Dev.to & Hashnode:** open applications collect portfolio links, expertise tags, and writing goals before granting publishing rights.
- **Medium Partner Program:** employs status dashboards, submission quotas, and editorial review for curated publications.
- **Substack Guest Posts:** rely on invitation links and email verification; flagged for requiring editor approval before mass distribution.

Borrow the best of these patterns: transparent status tracking, structured metadata capture, and strong moderation checkpoints to keep Syntax & Sips trustworthy while inviting community voices.
