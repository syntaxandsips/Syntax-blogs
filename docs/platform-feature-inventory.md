# Platform Feature Inventory & QA Matrix

This reference catalogs the current Syntax & Sips surface area so feature work, regression testing, and onboarding can start with shared expectations. Use it to brief QA agents, plan roadmap slices, and confirm that user journeys continue to operate after every deployment.

## Role & Permission Hierarchy

### Visitor (Unauthenticated)
- Browse multi-channel hubs for blogs, tutorials, podcasts, videos, newsletters, and resources to consume published content without signing in.【F:README.md†L52-L58】
- Explore discovery surfaces such as the homepage hero, topics explorer, changelog timeline, and curated recommendations that keep readers engaged.【F:README.md†L55-L59】【F:README.md†L103-L109】
- Trigger newsletter CTAs from the homepage and dedicated newsletter page to join the weekly dispatch while remaining anonymous.【F:src/app/page.tsx†L3-L36】【F:src/app/newsletter/page.tsx†L61-L156】

**Key dependencies & affected areas**
- Requires public access to App Router routes under `src/app` with ISR caching for hubs like `/blogs` and `/videos`. Content fetchers depend on Supabase reads configured in `getPublishedPosts` and related data helpers.【F:src/app/blogs/page.tsx†L1-L26】【F:README.md†L76-L88】
- Neo-brutalist UI primitives from `src/components/ui` must remain stable for consistent layouts across visitor-facing sections.【F:README.md†L67-L70】

**QA checklist**
- [ ] Verify homepage renders hero, trending posts, content previews, and newsletter form without authentication prompts.【F:src/app/page.tsx†L3-L36】
- [ ] Confirm hub pages (blogs, tutorials, podcasts, videos, resources) load content lists and metadata when accessed as a logged-out user.【F:README.md†L55-L58】
- [ ] Validate newsletter subscribe CTA links out correctly and recent issues render on `/newsletter`.【F:src/app/newsletter/page.tsx†L61-L156】

### Authenticated Member (Reader)
- Sign in via Supabase-backed login flow that syncs auth state, handles redirect parameters, and surfaces onboarding if incomplete.【F:src/components/auth/UserSignInForm.tsx†L14-L123】
- Access `/account` to review profile details, role badges, contribution analytics, and personal posts/comments snapshots.【F:src/app/account/page.tsx†L1-L120】
- Progress through the multi-step onboarding journey capturing persona, goals, and collaboration preferences before landing on their dashboard.【F:src/app/onboarding/page.tsx†L1-L81】【F:src/components/auth/OnboardingFlow.tsx†L1-L120】

**Key dependencies & affected areas**
- Relies on Supabase tables `profiles`, `profile_roles`, `posts`, and `comments` to populate the account dashboard.【F:src/app/account/page.tsx†L21-L118】
- Onboarding states persist in `profile_onboarding_journeys` and reuse shared option sets for personas, goals, and contributions.【F:src/app/onboarding/page.tsx†L39-L80】【F:src/components/auth/OnboardingFlow.tsx†L23-L120】

**QA checklist**
- [ ] Confirm successful login redirects members to `/account` (or requested redirect) after syncing onboarding status.【F:src/components/auth/UserSignInForm.tsx†L52-L123】
- [ ] Validate account dashboard totals update when posts/comments exist for the signed-in profile.【F:src/app/account/page.tsx†L55-L118】
- [ ] Complete onboarding steps and ensure status persists plus redirects to `defaultRedirect`.【F:src/app/onboarding/page.tsx†L49-L81】

### Community Contributor (Approved Author)
- Apply via `/apply/author` to submit focus areas, portfolio links, editorial acknowledgements, and captcha proofing; status messaging updates after submission.【F:src/app/apply/author/page.tsx†L1-L115】【F:src/components/community/AuthorApplicationForm.tsx†L52-L200】
- Approved contributors unlock `/creator/workspace` with MDX drafting, metadata management, editorial checklists, autosave timestamps, and submission status tracking.【F:src/app/creator/workspace/page.tsx†L32-L118】【F:src/components/community/CreatorWorkspace.tsx†L1-L200】
- Workspace actions call `/api/community/submissions` to save drafts, submit for review, withdraw, and pull reviewer feedback threads.【F:src/components/community/CreatorWorkspace.tsx†L164-L200】

**Key dependencies & affected areas**
- Requires Supabase tables `author_applications`, `community_contributors`, and `community_submissions` with role gating to expose contributor experiences.【F:src/app/creator/workspace/page.tsx†L32-L118】
- Admin community queue must stay in sync so approvals propagate contributor status and update submission pipelines.【F:src/components/admin/CommunityReviewQueue.tsx†L29-L200】

**QA checklist**
- [ ] Submit a new author application, verify captcha enforcement, and confirm status chips render on the landing page after save.【F:src/app/apply/author/page.tsx†L66-L116】【F:src/components/community/AuthorApplicationForm.tsx†L185-L200】
- [ ] Ensure non-approved contributors see the pending-access message and cannot reach the workspace editor.【F:src/app/creator/workspace/page.tsx†L32-L56】
- [ ] Validate draft autosave, checklist toggles, and submission intents (save, submit, withdraw) update status badges and feedback indicators.【F:src/components/community/CreatorWorkspace.tsx†L81-L200】

### Administrator / Editor
- Gate `/admin` behind Supabase auth + profile role checks before loading the dashboard shell.【F:src/app/admin/page.tsx†L1-L37】
- Operate editorial tools for posts, analytics, comments moderation, taxonomy management, gamification, settings, and the community review queue from one interface.【F:README.md†L60-L70】【F:src/components/admin/AdminDashboard.tsx†L1-L200】
- Process community author applications and submissions with approval/feedback actions that trigger Supabase updates and notifications.【F:src/components/admin/CommunityReviewQueue.tsx†L29-L200】

**Key dependencies & affected areas**
- Depends on `/api/admin/**` route handlers, Supabase row-level security, and typed utilities in `@/utils/types` to hydrate admin data sets.【F:src/components/admin/AdminDashboard.tsx†L1-L200】
- Gamification panel reads badge/challenge analytics and writes updates through Supabase-managed payloads.【F:src/components/admin/GamificationPanel.tsx†L1-L160】

**QA checklist**
- [ ] Confirm non-admin accounts are redirected to `/admin/login` and cannot access dashboard data.【F:src/app/admin/page.tsx†L13-L30】
- [ ] Verify posts CRUD, comment moderation, user management, and taxonomy edits persist via API calls without console errors.【F:src/components/admin/AdminDashboard.tsx†L1-L200】
- [ ] Approve/decline community queue entries and ensure status badges + success messaging update after refresh.【F:src/components/admin/CommunityReviewQueue.tsx†L56-L200】

## Page Inventory & Functional Expectations

| Route | Primary Audience | Purpose & Expected Behavior | Dependencies | QA Focus |
| --- | --- | --- | --- | --- |
| `/` | Visitors & members | Present hero, topics, trending posts, content previews, and newsletter CTA using neo-brutalist layout.【F:src/app/page.tsx†L3-L36】 | Uses shared navigation/footer, content preview components, and Supabase-backed trending data loaders.【F:README.md†L55-L70】 | Ensure sections render in order and CTAs route to `/blogs` and `/newsletter`. |
| `/blogs` | Visitors & members | Surface published articles with filtering using `getPublishedPosts` data fetcher.【F:src/app/blogs/page.tsx†L1-L26】 | Requires Supabase post queries and ISR revalidation interval (60s).【F:src/app/blogs/page.tsx†L7-L24】 | Validate list hydration, metadata, and revalidation behavior. |
| `/tutorials`, `/videos`, `/podcasts`, `/resources` | Visitors & members | Provide media-specific hubs referenced in the highlights section.【F:README.md†L55-L58】 | Share UI primitives and Supabase content lookups within `src/app` directories.【F:README.md†L76-L88】 | Confirm navigation between hubs retains filters and styling. |
| `/topics` | Visitors & members | Allow topic exploration for curated journeys and recommendations.【F:README.md†L55-L59】 | Depends on taxonomy data surfaced through Supabase tables and UI chips.【F:src/components/admin/TaxonomyManager.tsx†L1-L120】 | Check chips/tags match taxonomy definitions and link to filtered content. |
| `/changelog` | Visitors & members | Show product transparency timeline to highlight releases and community updates.【F:README.md†L55-L59】 | Pulls entries from Supabase and shares formatting components with other editorial pages.【F:README.md†L103-L109】 | Confirm chronology order and highlight badges render. |
| `/newsletter` | Visitors | Market the weekly email, show perks, signup flow, and recent issues.【F:src/app/newsletter/page.tsx†L61-L156】 | Subscribes via Supabase edge function `newsletter-subscribe` for persistence.【F:supabase/functions/newsletter-subscribe/index.ts†L12-L125】 | Validate CTA opens subscription URL and edge function accepts valid email payloads. |
| `/login`, `/signup` | Visitors | Provide Supabase-backed auth forms with redirect handling, onboarding detection, and branded messaging.【F:src/components/auth/UserSignInForm.tsx†L14-L175】 | Uses `createBrowserClient`, auth sync hooks, and `sanitizeRedirect` utilities.【F:src/components/auth/UserSignInForm.tsx†L7-L75】 | Test success, error states, redirect query params, and onboarding reroute. |
| `/onboarding` | Members | Collect persona, goals, focus, and support preferences before unlocking dashboards.【F:src/app/onboarding/page.tsx†L1-L81】【F:src/components/auth/OnboardingFlow.tsx†L23-L120】 | Persists to Supabase `profile_onboarding_journeys`; uses option constants in client component.【F:src/components/auth/OnboardingFlow.tsx†L23-L120】 | Complete each step, refresh, and ensure state resumes where left off. |
| `/account` | Members | Display profile summary, role badges, onboarding status, authored posts, and comment history.【F:src/app/account/page.tsx†L1-L118】 | Requires Supabase joins across posts, comments, and roles to calculate contribution totals.【F:src/app/account/page.tsx†L55-L118】 | Verify metrics match underlying data and role ordering respects priority. |
| `/apply/author` | Contributors-in-waiting | Landing page + application form with perks, journey, and status alert once submitted.【F:src/app/apply/author/page.tsx†L1-L116】 | Depends on Supabase `author_applications` and `HCaptcha` integration to throttle bots.【F:src/components/community/AuthorApplicationForm.tsx†L4-L200】 | Submit, edit, and resurface application to confirm data persistence and status messaging. |
| `/creator/workspace` | Approved contributors | Provide draft management, MDX editor, metadata inputs, checklists, autosave, and feedback threads.【F:src/app/creator/workspace/page.tsx†L32-L118】【F:src/components/community/CreatorWorkspace.tsx†L81-L200】 | Relies on `community_contributors`, `community_submissions`, categories, and API routes for persistence.【F:src/app/creator/workspace/page.tsx†L32-L118】 | Validate gating, autosave timestamps, submission intents, and reviewer feedback display. |
| `/admin` | Editors/Admins | Central dashboard with posts, analytics, comments, taxonomy, users, gamification, settings, and community queues.【F:src/components/admin/AdminDashboard.tsx†L1-L200】 | Requires `/api/admin/**`, Supabase service access, and component registry under `src/components/admin`.【F:README.md†L60-L70】 | Smoke test each panel, confirm API calls succeed, and that community queue actions update status. |
| `/privacy`, `/terms`, `/cookies`, `/disclaimer`, `/roadmap`, `/docs/**` | All audiences | Provide legal, roadmap, and documentation surfaces for transparency and compliance.【F:README.md†L40-L44】 | Static markdown/MDX routes leveraging App Router and content components.【F:README.md†L76-L88】 | Check copy loads, navigation works, and metadata is accurate. |

## Feature Delivery Checklist

### Content Publishing & Discovery
- **Requirements:** Maintain homepage hero, trending, and preview sections; ensure hub pages pull published posts with ISR caching.【F:src/app/page.tsx†L3-L36】【F:src/app/blogs/page.tsx†L1-L26】
- **Dependencies:** Supabase `posts`, `categories`, `tags`, and shared UI components for render consistency.【F:README.md†L94-L100】【F:README.md†L55-L70】
- **Impacted areas:** Navigation menus, SEO metadata, and topic explorers rely on the same data model.【F:README.md†L55-L59】
- **QA checklist:**
  - [ ] Confirm homepage surfaces curated sections and links to each content vertical.【F:src/app/page.tsx†L3-L36】
  - [ ] Verify `/blogs` (and sibling hubs) honor publish status and update within revalidation window.【F:src/app/blogs/page.tsx†L7-L26】
  - [ ] Test topic and changelog navigation for broken links or stale metadata.【F:README.md†L55-L59】

### Newsletter Lifecycle
- **Requirements:** Offer newsletter landing with perks, steps, and recent issues; capture subscriptions via edge function with email validation.【F:src/app/newsletter/page.tsx†L61-L156】【F:supabase/functions/newsletter-subscribe/index.ts†L12-L125】
- **Dependencies:** Supabase table `newsletter_subscribers`, edge function deployment credentials, and CTA links from homepage components.【F:supabase/functions/newsletter-subscribe/index.ts†L72-L125】【F:src/app/page.tsx†L3-L36】
- **Impacted areas:** Homepage CTA, footer signup, and admin analytics rely on accurate subscriber counts.【F:README.md†L55-L70】
- **QA checklist:**
  - [ ] Submit valid and invalid emails to edge function and confirm responses (200 vs 422/405).【F:supabase/functions/newsletter-subscribe/index.ts†L12-L125】
  - [ ] Check recent issues and CTAs render on `/newsletter` with proper styling.【F:src/app/newsletter/page.tsx†L61-L156】
  - [ ] Ensure newsletter CTAs across the site link back to the landing or subscription URL.【F:src/app/page.tsx†L3-L36】

### Community Author Program
- **Requirements:** Provide persuasive landing content, gated application form with captcha, and Supabase persistence for applicant status.【F:src/app/apply/author/page.tsx†L1-L116】【F:src/components/community/AuthorApplicationForm.tsx†L4-L200】
- **Dependencies:** `author_applications` table, hCaptcha site key env, and `/api/community/author-applications` route handler.【F:src/app/apply/author/page.tsx†L96-L115】【F:src/components/community/AuthorApplicationForm.tsx†L185-L200】
- **Impacted areas:** Contributor workspace eligibility, admin review queue counts, and onboarding messaging pull from application status.【F:src/app/creator/workspace/page.tsx†L32-L118】【F:src/components/admin/CommunityReviewQueue.tsx†L29-L200】
- **QA checklist:**
  - [ ] Complete application with captcha, submit, and reload to confirm fields repopulate from Supabase.【F:src/components/community/AuthorApplicationForm.tsx†L129-L200】
  - [ ] Trigger duplicate submission to ensure dedupe/status messaging surfaces correctly on the landing hero.【F:src/app/apply/author/page.tsx†L66-L116】
  - [ ] Validate admin queue reflects new application and allows approve/decline with notes.【F:src/components/admin/CommunityReviewQueue.tsx†L29-L200】

### Contributor Workspace & Review Pipeline
- **Requirements:** Gate workspace to approved contributors, list drafts, support MDX editor, metadata inputs, editorial checklist, autosave, and submission intents.【F:src/app/creator/workspace/page.tsx†L32-L118】【F:src/components/community/CreatorWorkspace.tsx†L81-L200】
- **Dependencies:** `community_contributors`, `community_submissions`, categories reference data, and `/api/community/submissions` endpoint.【F:src/app/creator/workspace/page.tsx†L32-L118】【F:src/components/community/CreatorWorkspace.tsx†L164-L200】
- **Impacted areas:** Admin review queue, posts table (post-approval), notifications, and contributor analytics rely on accurate status transitions.【F:src/components/admin/CommunityReviewQueue.tsx†L29-L200】【F:README.md†L60-L65】
- **QA checklist:**
  - [ ] Verify pending contributors receive the access pending card and cannot interact with editor controls.【F:src/app/creator/workspace/page.tsx†L32-L56】
  - [ ] Create, autosave, and submit a draft; confirm status badges and last saved timestamp update appropriately.【F:src/components/community/CreatorWorkspace.tsx†L81-L200】
  - [ ] Approve submission in admin queue and ensure contributor sees updated feedback/status on refresh.【F:src/components/admin/CommunityReviewQueue.tsx†L29-L200】

### Admin Operations & Governance
- **Requirements:** Secure `/admin` route, load dashboard overview, analytics, posts management, comments moderation, taxonomy controls, user management, gamification, settings, and community review queue.【F:src/app/admin/page.tsx†L1-L37】【F:src/components/admin/AdminDashboard.tsx†L1-L200】
- **Dependencies:** Supabase admin APIs, typed payloads in `@/utils/types`, `createBrowserClient`, and API handlers under `/api/admin`.【F:src/components/admin/AdminDashboard.tsx†L1-L200】
- **Impacted areas:** All content publishing, community submissions, gamification rewards, and permissions rely on admin workflows functioning correctly.【F:README.md†L60-L70】【F:src/components/admin/GamificationPanel.tsx†L1-L160】
- **QA checklist:**
  - [ ] Attempt admin access without proper role and confirm redirect guard.【F:src/app/admin/page.tsx†L13-L30】
  - [ ] Exercise each dashboard tab (posts CRUD, analytics refresh, comments moderation, taxonomy edits, gamification save) and monitor for API errors.【F:src/components/admin/AdminDashboard.tsx†L1-L200】【F:src/components/admin/GamificationPanel.tsx†L1-L160】
  - [ ] Process community queue actions and validate success/error messaging plus Supabase updates.【F:src/components/admin/CommunityReviewQueue.tsx†L56-L200】

### Authentication & Onboarding
- **Requirements:** Provide login/signup flows with redirect sanitation, session sync, and onboarding gate before dashboard access.【F:src/components/auth/UserSignInForm.tsx†L14-L123】【F:src/app/onboarding/page.tsx†L1-L81】
- **Dependencies:** Supabase auth client, `/api/auth/me` endpoint for onboarding check, `profile_onboarding_journeys` persistence, and `sanitizeRedirect` helper.【F:src/components/auth/UserSignInForm.tsx†L52-L123】【F:src/app/onboarding/page.tsx†L39-L81】
- **Impacted areas:** Account dashboard, contributor application, and admin gating all rely on accurate auth + onboarding state.【F:src/app/account/page.tsx†L1-L118】【F:src/app/creator/workspace/page.tsx†L32-L118】
- **QA checklist:**
  - [ ] Test login success, failure, email confirmation, and redirect query parameters.【F:src/components/auth/UserSignInForm.tsx†L25-L125】
  - [ ] Run through onboarding, reload mid-flow, and ensure state persists and completes properly.【F:src/app/onboarding/page.tsx†L49-L81】
  - [ ] Confirm post-onboarding navigation lands on intended destination (e.g., `/account`).【F:src/components/auth/UserSignInForm.tsx†L52-L123】

### Gamification & Engagement Analytics
- **Requirements:** Surface gamification panel in admin for managing badges, challenges, and analytics plus support XP/streak tracking in payloads.【F:src/components/admin/GamificationPanel.tsx†L1-L160】
- **Dependencies:** Supabase gamification tables, normalization utilities (`@/lib/gamification/utils`), and admin API endpoints to fetch/save data.【F:src/components/admin/GamificationPanel.tsx†L1-L160】
- **Impacted areas:** Member engagement metrics, badge assignments, and community recognition loops tie into dashboards and potential UI badges.【F:README.md†L60-L70】
- **QA checklist:**
  - [ ] Load gamification panel and verify analytics cards populate without errors.【F:src/components/admin/GamificationPanel.tsx†L1-L120】
  - [ ] Create/edit badges and challenges, ensuring validation and success messaging respond appropriately.【F:src/components/admin/GamificationPanel.tsx†L1-L160】
  - [ ] Confirm updates reflect in analytics charts after refresh.【F:src/components/admin/GamificationPanel.tsx†L1-L160】

### Comments & Community Moderation
- **Requirements:** Enable admin comments moderation queue with filters and actions; expose member comment history on `/account`.【F:src/components/admin/CommentsModeration.tsx†L1-L160】【F:src/app/account/page.tsx†L73-L118】
- **Dependencies:** Supabase `comments` table, `/api/admin/comments` endpoints, and role-based guardrails.【F:src/components/admin/AdminDashboard.tsx†L1-L200】
- **Impacted areas:** Reader trust, contributor analytics, and engagement metrics rely on accurate moderation status updates.【F:README.md†L60-L65】
- **QA checklist:**
  - [ ] Approve/reject comments from admin queue and confirm status changes persist.【F:src/components/admin/CommentsModeration.tsx†L1-L160】
  - [ ] Verify member account view reflects latest comment statuses and associated post links.【F:src/app/account/page.tsx†L73-L118】
  - [ ] Stress test comment filters for `pending`, `approved`, and `rejected` without runtime errors.【F:src/components/admin/CommentsModeration.tsx†L1-L160】

Use this matrix as the canonical backlog of current experiences; update it whenever new features ship or dependencies change to keep QA coverage comprehensive.
