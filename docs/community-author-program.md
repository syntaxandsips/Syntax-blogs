# Community Author Program Blueprint

## Research Snapshots

- The live site at [syntax-blogs.prashant.sbs](https://syntax-blogs.prashant.sbs) presents curated long-form stories, topic hubs, newsletters, and multimedia routes built with the Next.js App Router and a Supabase-backed editorial stack.【F:README.md†L16-L68】
- Authenticated contributors already flow through a Supabase-driven onboarding journey (`/onboarding`) and reach an admin cockpit with analytics, content workflow tables, and moderation tooling.【F:src/app/onboarding/page.tsx†L1-L73】【F:README.md†L24-L70】
- Existing Supabase schema centers on `posts`, taxonomy, `profiles`, roles, and RLS-protected admin operations, providing a solid foundation for extending community publishing.【F:README.md†L72-L104】

## Vision

Enable two complementary community entry points:
1. **Apply to become an author** – a guided intake that qualifies prospective creators before elevating their permissions.
2. **Submit a draft for editorial review** – a submission studio where approved community members can craft posts that route into the existing admin workflow for review, edits, and publication.

The flow should mirror mature editorial platforms (Dev.to, Hashnode, Medium Partner Program) where applications gather expertise evidence, and approved writers use a submission UI that enforces structured metadata, compliance acknowledgements, and automated reviews before staff approval.

## Feature Pillars & Forms

### 1. Author Application (`/apply`)
- **Contextual hero** explaining the program, expectations, and benefits.
- **Eligibility checklist** (e.g., expertise area, writing cadence, community participation).
- **Application form fields:**
  - Contact: full name (auto-hydrate from profile), email (read-only from Supabase), preferred pronouns.
  - Background: areas of expertise (multi-select tags mapped to existing taxonomy), years of experience, current role, links to portfolio/socials.
  - Writing samples: URLs, short description, optional file upload (Supabase storage) for PDFs.
  - Motivation & pitch: free-text on proposed series, target audience, unique angle.
  - Availability & cadence commitments (radio/select).
  - Policy acknowledgements (checkboxes for community guidelines, exclusivity, use of AI assistance).
- **Submission UX:** progress indicator, autosave (Draft status), success screen guiding next steps (timeline, communication).

### 2. Community Submission Studio (`/submit`)
- **Eligibility gating:** only visible to users with `approved_author` role or `author_program_status = approved`.
- **Editor experience:**
  - Structured metadata panel: title, slug (auto-generated & validated), excerpt, reading level, hero image upload, category, tags, canonical URL, optional series assignment.
  - Content builder: markdown/MDX editor with live preview, support for code blocks, embeds, callouts (re-use `NewBlogPostClient` patterns).
  - Compliance checklist: fact-check confirmation, AI disclosure, image rights, accessibility checks.
  - Collaboration: optional co-author mentions, notes for editors, attach assets.
  - Submission actions: save draft, request editorial review, withdraw.

### 3. Admin & Workflow Enhancements
- **Application review queue:** new admin table surface to triage `author_applications`, view profile context, add internal notes, approve/decline with templated responses.
- **Submission review pipeline:** integrate community drafts into existing posts table with statuses (`draft`, `in_review`, `needs_changes`, `scheduled`, `published`) and filters by submission origin.
- **Notifications:**
  - Email + in-app notifications when application status changes or feedback posted.
  - Slack/webhook optional for editorial team alerts.

## Data Model Extensions

| Table | Key Columns | Notes |
| --- | --- | --- |
| `author_applications` | `id`, `profile_id` (FK), `status` (`pending`, `approved`, `declined`, `needs_more_info`), `submitted_at`, `reviewed_by`, `review_notes`, `application_payload` (JSONB) | Store form responses and review audit trail.
| `author_program_statuses` (or extend `profiles`) | `profile_id`, `status`, `approved_at`, `expires_at`, `level` (`guest`, `contributor`, `editor`), `notes` | Drive gating logic for submission access.
| `community_submissions` | `id`, `profile_id`, `post_id` (nullable until approved), `title`, `slug`, `summary`, `content`, `metadata` JSONB, `status`, `submitted_at`, `reviewed_at`, `feedback` | Keeps submission history even if post rejected.
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
- **Supabase Edge Functions:** optional automation for sending transactional emails, running AI-assisted linting (toxicity, plagiarism) before review.
- **Validation:** use Zod schemas shared across client/server to prevent tampering, enforce length limits, sanitize HTML embeds.

## Security & Compliance

- Enforce Supabase RLS policies with `auth.role()` checks, verifying `approved_author` or admin roles for submission endpoints.
- Rate-limit application and submission routes (middleware or Vercel Edge + Upstash Redis) to deter spam/bot abuse.
- Server-side slug generation + collision checks; never trust client-provided slugs.
- Sanitize markdown via trusted pipeline (e.g., `rehype-sanitize`) to prevent XSS when rendering community content.
- Require reCAPTCHA or hCaptcha on public-facing application form if anonymous access allowed; prefer authenticated-only flow.
- Log moderation actions (who approved, when) for auditing.
- Add content scanning (OpenAI moderation, Perspective API) for flagged terms before publication.
- Provide authors with legal acknowledgement for AI-generated content disclosure to stay compliant with platform policies.

## Integration with Existing System

1. **Navigation:** Add CTAs to `/apply` from homepage hero/footers and `/account` dashboard. Once approved, show "Submit a story" CTA linking to `/submit`.
2. **Onboarding linkage:** Extend `OnboardingFlow` to surface author program step if user expresses intent to contribute, pre-filling application data where possible.【F:src/components/auth/OnboardingFlow.tsx†L1-L114】
3. **Admin workspace:** Introduce new tabs/cards inside `AdminDashboard` and `PostsTable` for "Community" pipelines, reusing existing table patterns, filters, and detail drawers.【F:README.md†L34-L68】
4. **Supabase roles:** When an application is approved, assign a new role (`contributor`) via `profile_roles` to unlock submission routes. Declined applicants keep standard reader roles.
5. **Publishing path:** Approved submissions feed the same `posts` table so analytics, newsletters, and topic explorers automatically pick up new stories without extra wiring.
6. **Content lifecycle:** Use existing newsletter + changelog systems to announce new community authors, maintaining brand consistency.

## Implementation Roadmap

1. **Schema migration:** Create tables, enums, policies, triggers.
2. **API layer:** Implement route handlers with Supabase service role, integrate with existing logging and error utilities.
3. **Frontend pages:** Build `/apply` and `/submit` using existing UI primitives (form components, markdown editor). Ensure responsive design and accessibility.
4. **Admin extensions:** Add review queues, notifications, and analytics widgets.
5. **QA & Testing:**
   - Unit test validation schemas.
   - Playwright flows for application submission and admin approval.
   - Supabase policy tests to confirm RLS integrity.
6. **Launch comms:** Update documentation, FAQs, and include new CTAs in marketing pages.

## Sample Build Prompt

> *"Extend Syntax & Sips with a community author program. Add an authenticated `/apply` page where logged-in readers submit an author application capturing expertise, writing samples, and policy acknowledgements. Persist applications in a new Supabase `author_applications` table with RLS so applicants can view their status. Build an `/submit` studio gated to approved contributors that provides metadata inputs, a markdown editor, compliance checkboxes, and actions to save drafts or request editorial review. Wire both flows to Next.js route handlers (`/api/community/author-applications`, `/api/community/submissions`) with shared Zod validation. Update the admin dashboard to surface review queues for applications and community submissions, enabling approve/decline/feedback operations that update Supabase and notify users. Reuse existing UI components, respect the neo-brutalist design system, and ensure security via rate limiting, content sanitization, and audit logging."*

## Competitive Notes

- **Dev.to & Hashnode:** open applications collect portfolio links, expertise tags, and writing goals before granting publishing rights.
- **Medium Partner Program:** employs status dashboards, submission quotas, and editorial review for curated publications.
- **Substack Guest Posts:** rely on invitation links and email verification; flagged for requiring editor approval before mass distribution.

Borrow the best of these patterns: transparent status tracking, structured metadata capture, and strong moderation checkpoints to keep Syntax & Sips trustworthy while inviting community voices.
