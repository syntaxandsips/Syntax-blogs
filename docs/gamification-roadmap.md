# Gamification Roadmap for Syntax & Sips

## 1. Executive Summary
- **Platform context:** Syntax & Sips is a Next.js 15 + Supabase editorial stack with rich reader-facing hubs and an authenticated admin workspace for analytics, publishing workflow, taxonomy, and moderation.【F:README.md†L1-L105】
- **Gamification vision:** Layer a points-based progression engine, badge taxonomy, seasonal awards, and role-driven privileges on top of existing Supabase profiles, roles, and engagement signals (views, comments, onboarding journeys) to deepen community participation.【F:supabase/migrations/0001_create_blog_schema.sql†L31-L101】【F:supabase/migrations/0003_manage_profile_hierarchy.sql†L7-L174】【F:supabase/migrations/0005_create_comments_table.sql†L15-L132】【F:supabase/migrations/0011_add_onboarding_flow.sql†L10-L88】
- **Outcome highlights:** Increase repeat readership and contributions through transparent progression, targeted challenges, and social recognition while reinforcing admin governance and moderation levers already exposed in the dashboard.【F:src/components/admin/AdminDashboard.tsx†L1-L200】【F:src/components/admin/CommentsModeration.tsx†L1-L180】
- **Indicative timeline:** designed for overlap between phases once shared prerequisites are satisfied.
  | Phase | Duration | Focus | Key Dependencies | Planned Overlap |
  | --- | --- | --- | --- | --- |
  | Phase 0: Foundations & Compliance | 2 weeks | Legal/privacy review, Supabase security audit, migration scaffolding, analytics instrumentation baseline | Existing auth schema, legal counsel availability | Runs parallel with design discovery once access reviews complete |
  | Phase 1: Data Layer Enablement | 3 weeks | Schema extensions, tracking hooks, admin feature flags | Phase 0 approvals, migration review | Overlaps final week with Phase 2 API work |
  | Phase 2: Points & Levels MVP | 4 weeks | Points engine, badge awarding jobs, progression UX | Phase 1 schema, caching infrastructure | Overlaps final two weeks with Phase 3 UI builds |
  | Phase 3: Badges & Challenges | 4 weeks | Badge catalog UI, awarding engine, challenge scheduler, notifications | Phase 2 engine contracts | Overlaps final week with Phase 4 role wiring |
  | Phase 4: Roles & Perks Integration | 3 weeks | Role-based perks, moderation tooling, governance updates | Phase 3 badge signals | Overlaps final week with Phase 5 analytics QA |
  | Phase 5: Analytics & Leaderboards | 3 weeks | User dashboards, admin analytics, leaderboards, A/B harness | Phase 2 data feeds, Phase 4 permissions | Overlaps with Phase 6 rollout planning |
  | Phase 6: Rollout & Optimization | 2 weeks + ongoing | Beta launch, feedback loops, balancing, seasonal content | Prior phases feature-complete | Continues post-launch |

## 2. Current System Analysis
### 2.1 Architecture & Technology Stack
- Next.js App Router with Tailwind-driven design system, Framer Motion, and Radix primitives power presentation and interactions, while Supabase provides authentication, data access, and edge automation.【F:README.md†L67-L105】【F:package.json†L5-L64】【F:tailwind.config.js†L1-L52】
- Tooling includes ESLint, TypeScript, Playwright, and a webpack chunk sync script wired into npm scripts for dev/build flows.【F:package.json†L5-L12】【F:README.md†L161-L193】

### 2.2 Database Schema & Models
- Core tables span `profiles`, `roles`, `profile_roles`, `posts`, `categories`, `tags`, `post_tags`, and `comments`, each with RLS enforcing user/admin boundaries.【F:supabase/migrations/0001_create_blog_schema.sql†L12-L178】【F:supabase/migrations/0003_manage_profile_hierarchy.sql†L7-L200】【F:supabase/migrations/0005_create_comments_table.sql†L15-L132】
- Engagement metrics already exist via `posts.views`, comment moderation statuses, and onboarding journeys tracked per profile.【F:supabase/migrations/0001_create_blog_schema.sql†L31-L101】【F:supabase/migrations/0005_create_comments_table.sql†L15-L132】【F:supabase/migrations/0011_add_onboarding_flow.sql†L10-L88】

### 2.3 Authentication & Authorization
- Supabase auth is synchronized via browser/server helpers; admin routes require authenticated Supabase sessions and `profiles.is_admin` checks before rendering the dashboard.【F:src/lib/supabase/client.ts†L1-L21】【F:src/lib/supabase/server-client.ts†L1-L58】【F:src/app/admin/page.tsx†L1-L30】
- Admin login performs Supabase password auth, session synchronization, and authorization gating against `profiles.is_admin`.【F:src/components/auth/AdminLoginForm.tsx†L1-L146】
- Role management uses Supabase service role APIs to create users, assign roles, and maintain `profile_roles` through the admin API.【F:src/app/api/admin/users/route.ts†L1-L197】

### 2.4 UI/UX Components & Styling
- Tailwind-driven neo-brutalist components provide consistent visual language across public and admin experiences; admin dashboard includes overview, analytics, posts, taxonomy, media, user, and comment modules.【F:README.md†L48-L105】【F:src/components/admin/AdminDashboard.tsx†L1-L200】
- Comments UI supports anonymous aliases, staff role flair, and moderation status messaging.【F:src/components/ui/CommentsSection.tsx†L1-L200】

### 2.5 Content Workflow & Engagement
- Admin dashboard fetches posts, categories, tags, recent comments, and offers moderation + publishing controls via API routes.【F:src/components/admin/AdminDashboard.tsx†L74-L176】【F:src/app/api/admin/posts/route.ts†L1-L200】
- Stats components highlight views, publishing cadence, and category distribution, indicating existing analytics seeds.【F:src/components/admin/StatsSection.tsx†L1-L90】
- Public comments API enforces published-post checks, approved-only reads, and pending submissions with optional authenticated authors.【F:src/app/api/posts/[slug]/comments/route.ts†L1-L148】

### 2.6 Current Gamification Implementation
- Supabase migrations provision dedicated gamification tables covering profiles, actions, badges, levels, challenges, leaderboards, and audit trails with RLS enforcement and seed data.【F:supabase/migrations/0012_create_gamification_schema.sql†L45-L214】【F:supabase/migrations/0012_create_gamification_schema.sql†L330-L705】
- The service layer records actions, calculates XP, manages streaks, challenges, and badge awards, and syncs eligible roles through reusable modules consumed across API routes.【F:src/lib/gamification/points-engine.ts†L1-L392】【F:src/lib/gamification/streak-manager.ts†L1-L78】【F:src/lib/gamification/challenge-service.ts†L1-L184】【F:src/lib/gamification/role-service.ts†L1-L120】
- Public and admin API routes expose action ingestion, profile summaries, leaderboards, badge catalogs, and analytics for the dashboards, wiring through Supabase service clients and authorization guards.【F:src/app/api/gamification/actions/route.ts†L1-L87】【F:src/app/api/gamification/profile/route.ts†L1-L78】【F:src/app/api/gamification/leaderboards/route.ts†L1-L64】【F:src/app/api/admin/gamification/analytics/route.ts†L1-L78】
- Client experiences surface XP progress, badges, challenges, and analytics via dedicated hooks and neobrutalist UI panels in both member and admin views.【F:src/hooks/useGamificationProfile.ts†L1-L58】【F:src/components/gamification/GamificationOverview.tsx†L1-L160】【F:src/components/admin/GamificationPanel.tsx†L1-L360】

## 3. Gamification System Architecture
### 3.1 Conceptual Overview
```mermaid
graph TD
  A[User Actions] --> B[Engagement Events]
  B --> C[Points Engine]
  C --> D[XP Ledger]
  C --> E[Badge Evaluator]
  D --> F[Level Progression]
  E --> G[Badge Unlocks]
  F --> H[Role/Perk Service]
  G --> H
  D --> I[Leaderboards]
  G --> J[Showcase & Notifications]
  B --> K[Challenges & Streaks]
  K --> C
  H --> L[Access Control Middleware]
  I --> M[Analytics Dashboards]
  J --> N[UI Components]
```
- **Services:** introduce a gamification service layer (API routes + background jobs) that consumes engagement events (views, comments, posts, onboarding milestones) and updates points, badges, levels, and streaks persisted in dedicated tables.
- **Data flow:** actions trigger synchronous hooks (for immediate feedback) and async jobs (for complex badge evaluations) that publish to Supabase tables, with Next.js components consuming aggregated views for display.

### 3.2 Data Model Implementation
| Table | Purpose | Key Columns |
| --- | --- | --- |
| `gamification_profiles` | Store cumulative XP, prestige, streak history, and opt-in settings for each profile | `profile_id` (PK/FK), `xp_total`, `level`, `prestige_level`, `level_progress`, `current_streak`, `longest_streak`, `last_action_at`, `streak_frozen_until`, `opted_in`, `settings`, `created_at`, `updated_at`【F:supabase/migrations/0012_create_gamification_schema.sql†L45-L74】
| `gamification_actions` | Append-only XP ledger for awarded events including idempotency guardrails | `id`, `profile_id`, `action_type`, `action_source`, `points_awarded`, `xp_awarded`, `metadata`, `awarded_at`, `request_id`【F:supabase/migrations/0012_create_gamification_schema.sql†L66-L87】
| `gamification_badges` | Badge catalog metadata with rarity, visuals, availability, and reward hooks | `id`, `slug`, `name`, `description`, `category`, `rarity`, `parent_badge_id`, `icon`, `theme`, `requirements`, `reward_points`, `is_time_limited`, `available_from`, `available_to`, timestamps【F:supabase/migrations/0012_create_gamification_schema.sql†L86-L113】
| `profile_badges` | Junction table tracking badge ownership state and notification metadata | `profile_id`, `badge_id`, `state`, `awarded_at`, `evidence`, `progress`, `notified_at`【F:supabase/migrations/0012_create_gamification_schema.sql†L114-L125】
| `gamification_levels` | Level definitions with XP thresholds and perks JSON | `level`, `title`, `min_xp`, `perks`, timestamps【F:supabase/migrations/0012_create_gamification_schema.sql†L127-L138】
| `gamification_challenges` | Configurable challenge catalogue with cadence, rewards, and scheduling windows | `id`, `slug`, `title`, `description`, `cadence`, `requirements`, `reward_points`, `reward_badge_id`, `starts_at`, `ends_at`, `is_active`, timestamps【F:supabase/migrations/0012_create_gamification_schema.sql†L140-L159】
| `profile_challenge_progress` | Track per-profile challenge progress, streak counts, and completion timestamps | `id`, `profile_id`, `challenge_id`, `progress`, `status`, `streak_count`, `started_at`, `completed_at`, `updated_at`【F:supabase/migrations/0012_create_gamification_schema.sql†L163-L176】
| `leaderboard_snapshots` | Persist cached leaderboard payloads with TTL for reuse across requests | `id`, `scope`, `captured_at`, `expires_at`, `payload`【F:supabase/migrations/0012_create_gamification_schema.sql†L180-L189】
| `gamification_audit` | Admin-auditable record of manual adjustments and privileged actions | `id`, `profile_id`, `action`, `delta`, `reason`, `performed_by`, `metadata`, `created_at`【F:supabase/migrations/0012_create_gamification_schema.sql†L192-L208】

### 3.3 API & Service Design
- **Route handlers implemented:** `/api/gamification/actions`, `/api/gamification/profile`, `/api/gamification/leaderboards`, `/api/gamification/challenges`, and `/api/admin/gamification/*` supply action ingestion, dashboard payloads, analytics, badge management, and challenge CRUD guarded by admin middleware.【F:src/app/api/gamification/actions/route.ts†L1-L87】【F:src/app/api/gamification/profile/route.ts†L1-L78】【F:src/app/api/gamification/leaderboards/route.ts†L1-L64】【F:src/app/api/admin/gamification/badges/route.ts†L1-L140】【F:src/app/api/admin/gamification/analytics/route.ts†L1-L78】
- **Caching strategy:** leaderboard requests consult Upstash/in-memory caches and persisted Supabase snapshots before recomputing, while action writes invalidate both caches and snapshot records.【F:src/lib/gamification/profile-service.ts†L1-L420】【F:src/lib/gamification/cache.ts†L1-L126】【F:src/lib/gamification/points-engine.ts†L1-L392】
- **Integration touchpoints:** admin post/comment/user APIs emit gamification events and read aggregated state to keep dashboards in sync with moderation workflows.【F:src/app/api/admin/posts/route.ts†L1-L200】【F:src/app/api/admin/users/route.ts†L1-L197】【F:src/app/api/posts/[slug]/comments/route.ts†L1-L148】
- **Planned automation:** Supabase cron or Edge Functions remain on the roadmap for seasonal resets and large-batch badge audits; track in rollout playbook before GA.

### 3.4 Frontend Component Architecture
- Shared gamification hooks (`useGamificationProfile`, `useLeaderboard`, `useChallenges`) and neobrutalist UI primitives (`GamificationOverview`, progress meters) power member-facing experiences and can be extended for new quests or streak visuals.【F:src/hooks/useGamificationProfile.ts†L1-L58】【F:src/hooks/useLeaderboard.ts†L1-L54】【F:src/hooks/useChallenges.ts†L1-L74】【F:src/components/gamification/GamificationOverview.tsx†L1-L160】
- The admin dashboard ships with a `GamificationPanel` that surfaces analytics, badge CRUD, and challenge management atop the existing layout shell, allowing iterative enhancements as new metrics arrive.【F:src/components/admin/AdminDashboard.tsx†L880-L1015】【F:src/components/admin/GamificationPanel.tsx†L1-L360】

## 4. Implementation Roadmap
| Phase | Duration | Key Deliverables | Dependencies | Planned Overlap | Risks & Mitigations |
| --- | --- | --- | --- | --- | --- |
| **Phase 0: Foundations & Compliance** | 2 weeks | Legal/privacy review, Supabase RLS audit, data classification, migration scaffolding, analytics baseline | Legal counsel availability, security engineering sign-off | Parallel UX discovery and badge taxonomy definition | Regulatory drift → schedule bi-weekly check-ins, document DPIA outcomes |
| **Phase 1: Data Layer Enablement** | 3 weeks | Create gamification tables, Supabase policies, seeds, service clients; migrate existing profiles | Phase 0 DPIA + security approvals, DB access windows | Final week overlaps with Phase 2 API development | Data integrity → write reversible migrations, backup before deploy |
| **Phase 2: Points & Levels MVP** | 4 weeks | Implement action ledger, XP calculation, level rules, user profile widget, admin adjustments | Phase 1 schema, caching infrastructure | Final two weeks overlap with Phase 3 UI builds | Over-reward loops → design normalization, cap daily XP |
| **Phase 3: Badges & Challenges** | 4 weeks | Badge catalog UI, awarding engine, challenge scheduler, streak service, notifications | Phase 2 service contracts, badge taxonomy | Final week overlaps with Phase 4 role wiring | Cron load → throttle background jobs, index progress tables |
| **Phase 4: Roles & Perks Integration** | 3 weeks | Map levels/badges to additional roles/perms, moderation tooling, governance updates | Phase 3 badge signals, policy updates | Final week overlaps with Phase 5 analytics QA | Permission escalation → add audit logs, require dual approval |
| **Phase 5: Analytics & Leaderboards** | 3 weeks | User dashboards, admin analytics, leaderboards, A/B harness, performance benchmarking | Phase 2 data feeds, Phase 4 permissions | Overlaps with Phase 6 rollout planning | Data accuracy → cross-check with posts/comments metrics |
| **Phase 6: Rollout & Optimization** | 2 weeks + ongoing | Beta launch, feedback loops, balancing, seasonal content, post-launch DPIA review | Prior phases feature-complete | Continues post-launch | Adoption lag → in-app onboarding, email campaigns |

### 4.1 Timeline Optimization & Critical Path
- **Critical path:** Phase 0 data privacy impact assessment (DPIA) → Phase 1 migrations → Phase 2 points ledger → Phase 3 badge engine → Phase 4 role binding. These unlock downstream analytics and rollout; accelerating schema reviews and caching setup shortens overall delivery.
- **Overlap strategy:** Begin Phase 2 API scaffolding during Phase 1 validation once core tables exist in staging; allow design team to prototype badges/leaderboards during Phase 0 compliance review; start analytics instrumentation (Phase 5) with mock data during late Phase 3 to parallelize visualization work.
- **Acceleration levers:** Pre-authorize Supabase access changes, automate migration linting, and provision Redis cache layer in Phase 1 so Phase 2 services can plug in immediately. Pair legal counsel with engineering to complete DPIA within first week to avoid blocking migrations.

### 4.2 Detailed Task Checklist
- [x] **DPIA & Legal Readiness** — Completed via the gamification compliance memo capturing DPIA outcomes, opt-in controls, and retention policy notes.【F:docs/gamification-compliance.md†L1-L68】
- [x] **RLS & Security Hardening** — Gamification tables ship with comprehensive RLS policies, audit triggers, and helper functions baked into the migration.【F:supabase/migrations/0012_create_gamification_schema.sql†L330-L705】
- [x] **Gamification Schema Migration** — Migration 0012 provisions tables, indexes, triggers, and seed data spanning profiles, actions, badges, levels, challenges, snapshots, and audit logs.【F:supabase/migrations/0012_create_gamification_schema.sql†L45-L214】
- [x] **Caching Infrastructure Setup** — Upstash-aware caching utilities plus persisted leaderboard snapshots and invalidation hooks deliver the documented TTL strategy.【F:src/lib/gamification/cache.ts†L1-L126】【F:src/lib/gamification/profile-service.ts†L1-L420】
- [x] **Points Engine Implementation** — The points engine records actions, recalculates XP, updates streaks, and triggers downstream badge/challenge workflows before syncing roles.【F:src/lib/gamification/points-engine.ts†L1-L392】
- [x] **Badge Evaluation Service** — Badge evaluator encapsulates criteria resolution, duplicate guards, and notification bookkeeping for awarded badges.【F:src/lib/gamification/badge-evaluator.ts†L1-L220】
- [x] **Challenge & Streak Module** — Challenge service and streak manager persist progress, evaluate completions, and support streak freeze logic.【F:src/lib/gamification/challenge-service.ts†L1-L184】【F:src/lib/gamification/streak-manager.ts†L1-L78】
- [x] **Role Mapping & Perk Enforcement** — Role service promotes/demotes profiles against Supabase roles based on level thresholds and badge ownership.【F:src/lib/gamification/role-service.ts†L1-L120】
- [x] **Analytics Dashboards & Leaderboards** — Admin analytics, leaderboards, and hooks deliver aggregated stats with snapshot caching and UI management flows.【F:src/app/api/admin/gamification/analytics/route.ts†L1-L78】【F:src/lib/gamification/profile-service.ts†L1-L420】【F:src/components/admin/GamificationPanel.tsx†L1-L360】
- [ ] **Rollout & Monitoring Playbook** — Outstanding: finalize feature flag gating, beta cohort comms, KPI dashboards, and incident escalation runbooks before GA.

Resource requirements: 1 full-stack engineer, 1 product designer, 1 Supabase/DB specialist, QA support, part-time data analyst.

## 5. Badge System Design
### 5.1 Taxonomy & Categories
- **Achievement Badges:** Personal milestones (first post, 10 comments, onboarding completion).
- **Milestone Badges:** Quantitative thresholds (1000 views on authored posts, 30-day streak).
- **Community Badges:** Peer recognition (most helpful comment, community-voted).
- **Seasonal/Special:** Event participation, hackathons, limited editions.

### 5.2 Badge Hierarchy & Metadata
- Define rarity tiers (`common`, `uncommon`, `rare`, `legendary`) with color-coding and unlock effects stored in `gamification_badges.rarity` and `requirements` JSON.
- Support badge families via `category` and `parent_badge_id` (optional) for progressive series.

### 5.3 Awarding Logic
- Use deterministic rules evaluated by background jobs (e.g., `total_posts >= 10`) and event-driven triggers (e.g., comment approved) captured in `gamification_actions`.
- Allow manual awards/removals via admin UI with audit logging.

### 5.4 Display Strategy
- Profile page badge showcase (grid + filters) and inline flair next to usernames in comments using existing alias/role display patterns.【F:src/components/ui/CommentsSection.tsx†L6-L144】
- Admin dashboard badge manager listing badges, counts, rarity heatmaps.

### 5.5 Rarity & Special Editions
- Store time-bounded availability, limited counts, or invite-only flags; leverage Supabase cron to archive expired seasonal badges.

### 5.6 Collection & Showcase
- Allow users to pin favorite badges, share deep links, and highlight progression history with timeline components.

## 6. Level & Progression Design
### 6.1 Level Structure
- Target ~20 levels with exponential XP requirements stored in `gamification_levels` (e.g., `min_xp = base * level^1.5`).
- Provide thematic names (e.g., “Curious Reader” → “Syntax Sage”) to reinforce brand voice.

### 6.2 XP Calculation
- Base XP per action defined via lookup table; apply modifiers for streaks, challenge completions, or content recency.
- Deduplicate repeated quick actions through cooldown windows (e.g., only first five daily comment likes count).

### 6.3 Level-Up Mechanics
- Immediate toast + email summary triggered when XP crosses a threshold; update `gamification_profiles.level` and `last_level_up_at`.
- Offer optional level prestige resets after max level.

### 6.4 Visualization Components
- Progress bars, animated level badges, and “next milestone” callouts integrated into profile header and admin user summary.
- Use existing Stats/Analytics cards for aggregated view.【F:src/components/admin/StatsSection.tsx†L31-L90】

### 6.5 Level-Based Perks
- Unlocks: faster moderation for trusted users, access to beta posts, ability to host community events.
- Map perks to Supabase roles (`roles` + `profile_roles`) or feature flags consumed by Next.js route guards.【F:supabase/migrations/0003_manage_profile_hierarchy.sql†L7-L174】【F:src/app/api/admin/users/route.ts†L84-L197】

## 7. Actions & Awards System
### 7.1 Action Catalog
| Action | Trigger Source | Base Points | Notes |
| --- | --- | --- | --- |
| Publish post | `/api/admin/posts` success | +200 XP | Bonus for views milestones |
| Approved comment | Comments API approval | +25 XP | Additional for receiving upvotes |
| Daily login | Supabase session sync | +10 XP | Award once per 24h |
| Newsletter signup | Newsletter flow | +30 XP | Encourage lifecycle participation |
| Onboarding completion | `profile_onboarding_journeys.status` → `completed` | +100 XP | Unlocks onboarding badge |
| Community recognition | Upvote/thanks event | Variable | Weighted by giver level |

### 7.2 Awards & Challenges
- Daily streak challenges (comment + read + share) tracked via `profile_challenge_progress`.
- Weekly themed quests (e.g., “AI Deep Dive Week”) awarding special badges.
- Monthly competitions (top views, top commenter) surfaced via leaderboards and admin announcements.

### 7.3 Streak Mechanics
- Maintain `current_streak` and `longest_streak`; break streak if no qualifying action within 36 hours.
- Provide “streak freeze” consumables as high-level perk.

### 7.4 Social Recognition
- Introduce lightweight reactions (thanks/upvotes) stored as actions; highlight top contributors on homepage modules.
- Display badge flair or level indicator near comment authors.【F:src/components/ui/CommentsSection.tsx†L73-L200】

### 7.5 Seasonal Events
- Define seasonal badge sets and time-bound challenges; auto-archive using availability windows.
- Support “double XP weekends” toggled via admin panel feature flags.

## 8. Role & Permission System
### 8.1 Role Definitions
- Extend existing roles (`admin`, `editor`, `author`, `member`) with gamified roles (`mentor`, `ambassador`, `moderator`) tied to level thresholds or badge requirements.【F:supabase/migrations/0003_manage_profile_hierarchy.sql†L7-L125】

### 8.2 Earning & Maintenance
- Automatic promotion when level ≥ threshold AND trust criteria met (e.g., no moderation strikes).
- Periodic review job demotes if inactivity or strikes accumulate.

### 8.3 Permission Matrices
- Map roles to capabilities (e.g., comment moderation, event creation, content pitching) stored in config JSON consumed by UI and Supabase policies.
- Use `profile_roles` to assign and track, leveraging existing triggers to sync admin flag.【F:supabase/migrations/0003_manage_profile_hierarchy.sql†L128-L200】

### 8.4 Moderation Enhancements
- Introduce `gamified_moderator` role granting limited comment approval rights via admin API with audit trail.
- Provide “flagged content” queue filtered by role-specific rules.

### 8.5 Special Privileges
- High-level users gain early access to drafts (`posts` filter), ability to spotlight posts, or host community livestreams.
- Expose toggles in admin UI for manual overrides using existing user management flows.【F:src/components/admin/UserManagement.tsx†L1-L200】

### 8.6 Role Progression/Demotion
- Cron job recalculates eligibility weekly, comparing XP, badge ownership, and strike count; logs outcomes to `gamification_audit`.

## 9. Tracking & Analytics
### 9.1 Metrics Inventory
- Core metrics: XP gain rate, badge completion %, streak retention, challenge participation, leaderboard diversity.
- Secondary metrics: impact on post views, comment volume, onboarding completion uplift.

### 9.2 Dashboards
- User-facing: timeline of actions, upcoming badge hints, streak tracker, leaderboard placements.
- Admin-facing: aggregated KPIs, anomaly alerts, manual adjustment interface embedded in dashboard.【F:src/components/admin/AnalyticsPanel.tsx†L1-L200】【F:src/components/admin/DashboardOverview.tsx†L1-L200】

### 9.3 Reporting & Export
- Scheduled exports to data warehouse (CSV/JSON) via Edge Functions; include audit logs.
- Provide API filters for timeframe, segment (role, level), challenge, or badge category.

### 9.4 Leaderboards
- Global, category-specific, seasonal, and private group leaderboards cached in `leaderboard_snapshots` with TTL; include anti-cheat checks.

### 9.5 Trend Analysis & Experimentation
- Instrument feature flags for A/B tests (e.g., new badge criteria) with Supabase remote config.
- Monitor retention uplifts, adjust XP weights accordingly.

## 10. UI/UX Implementation Guide
### 10.1 Design System Extensions
- Add badge color palette, level gradients, progress bar variants to Tailwind theme tokens.【F:tailwind.config.js†L17-L45】
- Extend component library with gamification-specific cards, toasts, and widgets matching neo-brutalist aesthetic.

### 10.2 Component Library Additions
- `BadgeCard`, `LevelProgress`, `ChallengeBanner`, `LeaderboardTable`, `PerkTooltip` components.
- Shared skeleton states for loading gamification data consistent with existing admin cards.

### 10.3 Interaction Patterns
- Gamified micro-interactions using Framer Motion for badge unlock animations; subtle confetti for level-ups.
- Provide inline tooltips explaining how to earn each badge when hovered.

### 10.4 Accessibility Considerations
- Ensure color contrast for rarity indicators, provide text equivalents for icons, support screen reader announcements on level-ups.
- Allow users to opt out of public leaderboard display in settings JSON.

### 10.5 Onboarding Flow
- Update onboarding journey to explain gamification benefits and encourage early badge quests; integrate with existing `profile_onboarding_journeys` table.【F:supabase/migrations/0011_add_onboarding_flow.sql†L10-L88】

## 11. Technical Implementation Details
### 11.1 Code Organization
- Create `src/lib/gamification` for shared services (points calculator, badge evaluator, streak manager).
- Introduce `src/app/api/gamification/*` routes mirroring admin API structure for maintainability.【F:src/app/api/admin/posts/route.ts†L1-L200】

### 11.2 Key Algorithms
- **Points Engine:** configurable weight mapping + cooldown logic, executed within transaction to avoid double counting.
- **Badge Evaluator:** pattern-matching over action aggregates; include progress tracking (partial completion) for long-term badges.
- **Streak Checker:** windowed evaluation with tolerance, storing resets in audit log.

### 11.3 Database Changes
- Write migrations adding gamification tables, indexes (e.g., `profile_id`, `awarded_at`), and RLS policies ensuring users access their data while admins access aggregated views.
- Add triggers to sync `gamification_profiles` when new `profiles` inserted, similar to onboarding trigger approach.【F:supabase/migrations/0011_add_onboarding_flow.sql†L41-L63】

### 11.4 API Specifications
- Document payloads for `/api/gamification/actions`, `/api/gamification/profile`, `/api/gamification/leaderboards`, `/api/admin/gamification/badges`.
- Ensure service role client used for admin write operations, while authenticated clients only read their data.【F:src/lib/supabase/server-client.ts†L1-L63】

### 11.5 Caching & Performance Strategy
- **Caching layers:** Introduce Redis/Upstash for hot leaderboards, badge catalogs, and XP summaries with TTL-based invalidation (e.g., 5-minute global leaderboard cache, 60-minute badge metadata cache) while leveraging Next.js Route Handlers revalidation for personalized data.
- **Write-through patterns:** On action ingestion, update cached XP totals atomically to keep profile widgets responsive; fall back to Supabase queries on cache miss with circuit breaker logging.
- **Edge caching:** Use Next.js ISR for public leaderboard pages and CDN cache-control headers for seasonal event assets.
- **Instrumentation:** Add OpenTelemetry tracing around cache hits/misses and Supabase query latency to monitor 95th percentile performance.

## 12. Testing Strategy
### 12.1 Unit Testing
- Test points calculation, badge eligibility predicates, streak resets, and role promotions using Jest/TS testing utilities.

### 12.2 Integration Testing
- Extend Playwright suites to cover gamified UI flows (badge unlock toast, leaderboard display) leveraging existing `npm run test` infrastructure.【F:package.json†L5-L12】
- Add API integration tests to verify RLS and permission enforcement.

### 12.3 User Testing
- Conduct usability sessions on profile gamification dashboard and admin tooling; gather qualitative feedback on clarity and motivation.

### 12.4 Performance Testing
- Load-test leaderboard queries and badge evaluation jobs; ensure Supabase indexes sized for expected volume.
- Target **<200 ms** p95 response times for profile dashboard APIs and **<500 ms** for leaderboard fetches under 1k concurrent users; sustain badge evaluation cron runs processing 10k events within 2 minutes.
- Validate cache effectiveness (>80% hit rate) and document fallback latency budgets.

## 13. Deployment Plan
### 13.1 Environments
- Reuse existing dev/staging/prod Supabase projects; enable feature flags to gate gamification to beta cohort first.

### 13.2 Deployment Steps
1. Apply migrations (phase-gated) with rollback scripts.
2. Deploy backend (API routes, Edge Functions).
3. Deploy frontend components once feature flags ready.
4. Seed initial badges/levels via admin script.

### 13.3 Rollback Procedures
- Maintain down migrations for table creation; disable feature flags and remove scheduled jobs if issues arise.
- Restore from Supabase backups before rerunning migrations.

### 13.4 Monitoring
- Instrument logging for action ingestion, badge awarding, and leaderboard refresh; alert on failure rates.
- Track key KPIs in analytics dashboard; integrate with existing admin overview.【F:src/components/admin/DashboardOverview.tsx†L1-L200】

### 13.5 Legal & Compliance Considerations
- **Data privacy:** Document gamification data categories (behavioral metrics, leaderboard rankings) in the privacy policy, add explicit consent toggles in profile settings, and respect deletion requests by cascading deletes across gamification tables.
- **Regional regulations:** Align DPIA outputs with GDPR/CCPA obligations, ensuring opt-out mechanisms for public recognition features and configurable data retention (e.g., purge action logs after 18 months unless flagged for moderation).
- **Children & sensitive data:** Confirm age gating on registration to avoid collecting data from under-13 users; restrict storing sensitive metadata in gamification payloads.
- **Compliance reviews:** Schedule quarterly legal reviews post-launch to reassess criteria, especially for seasonal events that may introduce contests or sweepstakes requirements.

## 14. Maintenance & Evolution
- Monitor gamification health weekly: XP inflation, badge completion, leaderboard churn.
- Adjust XP weights and badge criteria through config tables without redeploying.
- Expand feature set (guilds, collaborative quests, referral programs) informed by analytics and community feedback loops.
- Encourage community proposals via admin workflow; schedule seasonal updates.

## 15. Conclusion
- The proposed gamification framework leverages existing Supabase schema, admin tooling, and engagement touchpoints to deliver a cohesive rewards ecosystem that strengthens reader loyalty, encourages contributions, and empowers moderators.
- Success metrics: increased repeat sessions, higher comment approval volume, onboarding completion lift, improved content production cadence.
- Next steps: secure stakeholder buy-in, prioritize Phase 1 backlog, and kick off schema implementation with migration reviews.

