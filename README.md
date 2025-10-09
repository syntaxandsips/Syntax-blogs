<h1 align="center">
  <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/coffee.svg" alt="Coffee cup icon" width="32" height="32" />
  <br />
  Syntax &amp; Sips
</h1>

<p align="center"><strong>A next-generation editorial platform blending AI-assisted storytelling, human curation, and a neo-brutalist design system.</strong></p>

<p align="center">
  <a href="https://nextjs.org/">
    <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/brand-nextjs.svg" alt="Next.js" width="20" height="20" />
    Next.js 15
  </a>
  ·
  <a href="https://supabase.com/">
    <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/brand-supabase.svg" alt="Supabase" width="20" height="20" />
    Supabase
  </a>
  ·
  <a href="https://tailwindcss.com/">
    <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/brand-tailwind.svg" alt="Tailwind CSS" width="20" height="20" />
    Tailwind CSS
  </a>
  ·
  <a href="https://www.framer.com/motion/">
    <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/brand-framer-motion.svg" alt="Framer Motion" width="20" height="20" />
    Framer Motion
  </a>
  ·
  <a href="https://playwright.dev/">
    <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/device-desktop-analytics.svg" alt="Playwright" width="20" height="20" />
    Playwright
  </a>
</p>

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/list.svg" alt="Table of contents" width="22" height="22" /> Table of Contents

- [Overview](#-overview)
- [Why Teams Love It](#-why-teams-love-it)
- [Architecture &amp; Stack](#-architecture--stack)
- [Experience Blueprint](#-experience-blueprint)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [API Quickstart](#-api-quickstart)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment &amp; Operations](#-deployment--operations)
- [Documentation &amp; Support](#-documentation--support)
- [Contributing](#-contributing)
- [License](#-license)
- [Maintainers &amp; Contact](#-maintainers--contact)
- [Changelog](#-changelog)

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/info-circle.svg" alt="Info" width="22" height="22" /> Overview

Syntax &amp; Sips delivers an editorial suite for AI, ML, and deep-tech teams who need premium storytelling with operational rigor. The reader-facing experience showcases rich, multi-format content, while authenticated workspaces equip editors with analytics, governance tooling, and gamified engagement loops. Supabase powers authentication, content orchestration, and automation so the platform scales from prototype to production-ready deployments.

- **Live deployment:** [https://www.syntax-blogs.prashant.sbs](https://www.syntax-blogs.prashant.sbs)
- **Design language:** Neo-brutalist foundations with bold outlines, kinetic micro-interactions, and intentional accessibility choices.
- **Governance:** Supabase-backed policies, analytics, and moderation tooling keep editorial operations accountable.

<div align="center">
  <img src=".github/images/Hero.png" alt="Syntax &amp; Sips hero layout" width="100%" />
</div>

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/hexagons.svg" alt="Highlights" width="22" height="22" /> Why Teams Love It

### Reader Experience
- **Multi-channel storytelling:** Dedicated hubs for blogs, tutorials, podcasts, videos, newsletters, and resource libraries. (`src/app/blogs`, `src/app/videos`, `src/app/podcasts`, `src/app/tutorials`, `src/app/resources`)
- **Rich article presentation:** Markdown, code snippets, callouts, and video embeds tuned for readability. (`src/components/ui/CodeBlock.tsx`, `src/components/ui/VideoEmbed.tsx`)
- **AI-assisted recaps:** One-click summarization with Supabase functions produces shareable insights. (`src/components/ui/NewSummarizeButton.tsx`)
- **Audience journeys:** Topic explorers, changelog transparency, and curated recommendations keep readers engaged. (`src/app/topics/page.tsx`, `src/app/changelog/page.tsx`)

### Editorial Operations
- **Secure admin authentication:** Supabase Auth plus server-side guards protect `/admin`. (`src/app/admin/page.tsx`, `src/components/auth/AdminLoginForm.tsx`)
- **Dashboard intelligence:** Analytics cards and trend visualizations reveal readership health instantly. (`src/components/admin/DashboardOverview.tsx`, `src/components/admin/AnalyticsPanel.tsx`)
- **Workflow automation:** Filterable tables, inline status chips, and drawers streamline publishing cycles. (`src/components/admin/PostsTable.tsx`, `src/components/admin/PostForm.tsx`)
- **Community stewardship:** Live moderation queues empower teams to review, approve, or archive comments. (`src/components/admin/CommentsModeration.tsx`)
- **Role-aware management:** Update profiles, roles, and permissions without leaving the console. (`src/components/admin/UserManagement.tsx`)

### Platform Intelligence
- **Supabase Edge Functions:** Drive newsletter lifecycle events and AI integrations with serverless routines. (`supabase/functions/newsletter-subscribe`)
- **Design system cohesion:** Shared UI primitives deliver consistent neo-brutalism styling across screens. (`src/components/ui`, `src/components/theme-provider.tsx`)
- **Performance-minded motion:** Framer Motion micro-interactions elevate delight while respecting Core Web Vitals. (`src/components/magicui`, `src/app/page.tsx`)

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/cpu.svg" alt="Stack" width="22" height="22" /> Architecture &amp; Stack

| Layer | Tooling | Key Modules |
| --- | --- | --- |
| Presentation | Next.js App Router, Tailwind CSS, Radix, Lucide | `src/app`, `src/components/ui`, `src/styles` |
| Interaction | Framer Motion, custom hooks, SWR patterns | `src/components/magicui`, `src/hooks` |
| Authentication | Supabase Auth helpers, middleware guards | `src/lib/supabase`, `src/middleware.ts` |
| Data &amp; APIs | Route handlers, Supabase RPC, edge functions | `src/app/api`, `supabase/functions` |
| Tooling | ESLint, Prettier, Playwright, Webpack chunk sync | `eslint.config.mjs`, `scripts/sync-webpack-chunks.js`, `playwright.config.ts` |

### Service Topology
- **Client:** Progressive enhancement with streaming routes, suspense boundaries, and accessible motion primitives.
- **Server:** Next.js API routes orchestrate CRUD for posts, taxonomy, comments, community submissions, and newsletter workflows. (`src/app/api`)
- **Database:** Supabase Postgres with RLS, migrations, and SQL helpers. (`supabase/migrations`)
- **Automation:** Edge Functions handle newsletter subscriptions and AI summarization triggers. (`supabase/functions`)

### Data Model Snapshot

| Domain | Tables / Views | Purpose |
| --- | --- | --- |
| Content | `posts`, `post_tags`, `categories`, `tags` | Authoring, categorization, scheduling |
| Editorial Workflow | `profiles`, `roles`, `profile_roles` | Access control and permissions |
| Engagement | `comments`, `newsletter_subscribers` | Community programs and lifecycle management |
| Configuration | `site_settings` | Global branding, navigation, and operational toggles |

> Review `supabase/migrations` for canonical schema changes, triggers, and row-level security policies.

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/route.svg" alt="Journey" width="22" height="22" /> Experience Blueprint

1. **Discover stories:** Animated hero headlines and trending categories greet visitors. (`src/app/page.tsx`)
2. **Navigate content hubs:** Medium-specific layouts surface curated content per channel. (`src/app/blogs`, `src/app/tutorials`, `src/app/videos`)
3. **Deep-dive into articles:** Summaries, code, and embeds keep long-form content actionable. (`src/components/ui`)
4. **Engage with community:** Comments, newsletters, and gamified rewards boost retention. (`src/app/changelog/page.tsx`, `supabase/functions`)
5. **Administer operations:** Dashboards, moderation queues, and role management keep teams aligned. (`src/components/admin`)

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/rocket.svg" alt="Getting Started" width="22" height="22" /> Getting Started

### Prerequisites
- Node.js 20+ and npm 10+
- Supabase project with service role and anon keys
- Optional: Supabase CLI for local development (`npm install -g supabase`)
- Optional: Mailtrap (or SMTP provider) credentials for newsletter confirmations (`MAILTRAP_*` variables)

### Installation
```bash
npm install
```

### Environment Variables
Create `.env.local` in the project root and populate the required secrets:

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project REST URL | Yes | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client session management | Yes | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for privileged server calls | Yes | `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` |
| `NEXT_PUBLIC_SITE_URL` | Fully qualified site URL used for metadata | Recommended | `https://www.syntax-blogs.prashant.sbs` |
| `MAILTRAP_USER` / `MAILTRAP_PASS` | SMTP credentials for transactional emails | Required for newsletter flows | _Provided by Mailtrap_ |
| `MAILTRAP_HOST` / `MAILTRAP_PORT` | Override host/port if not using defaults | Optional | `smtp.mailtrap.io` / `2525` |
| `MAILTRAP_FROM_EMAIL` / `MAILTRAP_FROM_NAME` | Sender identity for outgoing mail | Optional | `noreply@syntax-blogs.test` / `Syntax & Sips` |

### Database Setup
```bash
# Authenticate once, then mirror the latest schema locally
supabase login
supabase db push

# Optional: reset your local instance during development
supabase db reset --force
```

### Run the App
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (and `/admin` for authenticated tooling once an admin account exists).

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/player-play.svg" alt="Usage" width="22" height="22" /> Usage

- **Content authoring:** Log in with an admin-enabled profile, create posts in the admin dashboard, and publish or schedule content. (`src/components/admin/PostForm.tsx`)
- **Newsletter flows:** Embed the newsletter form or issue a `POST /api/newsletter` request. The confirmation link expires after 48 hours. (`src/lib/newsletter.ts`)
- **Gamification hooks:** Display leaderboards and challenges by querying `/api/gamification/*` endpoints for authenticated profiles.
- **Programmatic access:** Use the API endpoints to fetch published posts, record views, or submit community content—see [API Quickstart](#-api-quickstart).

#### Example: Fetch trending posts
```bash
curl "http://localhost:3000/api/posts/trending?limit=4"
```

#### Example: Submit a comment
```bash
curl -X POST "http://localhost:3000/api/posts/{slug}/comments" \
  -H "Content-Type: application/json" \
  -d '{"content":"Loving the neobrutalist patterns!"}'
```

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/api.svg" alt="API" width="22" height="22" /> API Quickstart

- Public content endpoints expose published posts, trending articles, search, and approved comments.
- Authenticated APIs manage comments, profiles, gamification progress, newsletter confirmations, and admin consoles.
- Each route documents request/response shapes, auth requirements, and failure modes in [`docs/api/README.md`](./docs/api/README.md).
- Rate limiting helpers (`src/lib/rate-limit.ts`) and Supabase RLS policies enforce platform safety.

> **Tip:** Use `NEXT_PUBLIC_SITE_URL` to construct absolute URLs when consuming APIs from external clients. (`src/lib/site-url.ts`)

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/code.svg" alt="Development" width="22" height="22" /> Development

### Project Structure
```
.
├── src
│   ├── app              # Next.js routes for reader, admin, marketing, and legal pages
│   ├── components       # UI primitives, admin tooling, and design system modules
│   ├── hooks            # Custom React hooks for sessions and UI behavior
│   ├── lib              # Supabase clients, helpers, and configuration glue
│   └── utils            # Shared types, formatters, and constants
├── supabase             # SQL migrations, seed references, and edge functions
├── scripts              # Build-time helpers (webpack chunk sync, tooling)
├── tests                # Playwright end-to-end suites and fixtures
├── public               # Static assets, fonts, and Open Graph imagery
└── .github/images       # Marketing and documentation visuals
```

### Essential Scripts
| Action | Command | Notes |
| --- | --- | --- |
| Start development server with chunk sync | `npm run dev` | Wraps `next dev` with Webpack chunk reconciliation |
| Compile production assets | `npm run build` | Runs chunk sync before building |
| Serve production bundle locally | `npm run start` | Useful for smoke testing the output of `next build` |
| Lint the codebase | `npm run lint` | ESLint configuration lives in `eslint.config.mjs` |
| Execute Playwright regression suites | `npm run test` | Headless browser tests |
| Debug Playwright suites with UI runner | `npm run test:ui` | Useful for developing tests |
| Run headed browser tests | `npm run test:headed` | Opens Chromium with a visible window |

### Coding Standards
- TypeScript strict mode is enabled—prefer explicit types and discriminated unions over `any`. (`tsconfig.json`)
- Tailwind CSS drives styling; extend the theme via `tailwind.config.js` as needed.
- Exported helpers include TSDoc annotations for parameters, return values, and error conditions. (`src/lib/*.ts`)
- Follow the neobrutal design conventions documented in [`neobrutalismthemecomp.MD`](./neobrutalismthemecomp.MD).

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/shield-check.svg" alt="Quality" width="22" height="22" /> Testing

- **Frameworks:** Playwright powers end-to-end coverage today; expand with Vitest for unit tests as the library surface grows.
- **Environment:** Ensure Supabase keys and newsletter SMTP credentials are available to fully exercise flows that touch auth or mail.
- **Commands:**
  - `npm run test` — execute headless Playwright suites.
  - `npm run test:ui` — iterate on scenarios with the Playwright UI runner.
  - `npm run test:headed` — run tests with visible browsers for debugging.
- **Reports:** Capture failures and test insights in `tests/build-verification.md` and update the document when CI/CD behavior changes.
- **Guidance:** Detailed configuration, data seeding strategies, and coverage targets live in [`docs/testing/README.md`](./docs/testing/README.md).

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/settings.svg" alt="Settings" width="22" height="22" /> Deployment &amp; Operations

1. Configure Supabase keys per environment (local, staging, production) and document them in `.env.example` or internal secrets managers.
2. Apply database migrations and confirm the `newsletter-subscribe` Edge Function is deployed. (`supabase/functions/newsletter-subscribe`)
3. Run `npm run build` locally (or in CI) to validate the production bundle before promoting a release.
4. Deploy via Vercel, Netlify, or containerized infrastructure; monitor Supabase logs, analytics, and newsletters within the first 24 hours.
5. Reference `tests/build-verification.md` and `docs/ai-integration-roadmap.md` for manual QA and roadmap context.

Security highlights:
- Admin access requires Supabase-managed accounts with `profiles.is_admin = true`. (`src/app/admin/page.tsx`)
- Secrets live exclusively in environment variables; never bundle credentials in the repository.
- RLS policies gate reader data—inspect migrations prior to schema updates. (`supabase/migrations`)
- Dedicated privacy, cookies, and disclaimer pages surface policy obligations. (`src/app/privacy/page.tsx`, `src/app/cookies/page.tsx`, `src/app/disclaimer/page.tsx`)

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/book.svg" alt="Documentation" width="22" height="22" /> Documentation &amp; Support

- Central index for playbooks, roadmaps, and design notes: [`docs/README.md`](./docs/README.md).
- Deep dives on AI integrations, gamification strategy, and community programs: [`docs/`](./docs).
- Design tokens and layout principles: [`neobrutalismthemecomp.MD`](./neobrutalismthemecomp.MD).
- For questions or enhancements, open an issue or start a discussion—maintainers actively triage requests.

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/pencil.svg" alt="Contributing" width="22" height="22" /> Contributing

We welcome thoughtful proposals that make Syntax &amp; Sips more resilient, inclusive, and delightful. Before you begin:

- Read the [Contributing Guide](CONTRIBUTING.md) for branching strategy, coding standards, and release readiness checks.
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md) to help maintain a respectful community.
- Review [`docs/code-review.md`](./docs/code-review.md) for architectural guardrails and quality expectations.

When you are ready to contribute:

1. Fork the repository and create a topic branch: `git checkout -b feature/your-feature`.
2. Develop your change locally, keeping tests and linting (`npm run lint`, `npm run type-check`, `npm test`) green.
3. Update documentation or runbooks impacted by the change.
4. Complete the pull request template with context, validation notes, and screenshots for UI work.

Need help? Start a [discussion](https://github.com/prashant-andani/Syntax-blogs/discussions) before diving in so we can collaborate on scope.

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/license.svg" alt="License" width="22" height="22" /> License

This project is made available under the **Syntax &amp; Sips Community Source License 1.0**. You may review, study, and run the software for personal, non-commercial purposes. Any commercial use, redistribution, or modification requires prior written permission from the maintainers—see [LICENSE](LICENSE) for the full terms and contact details.

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/users.svg" alt="Team" width="22" height="22" /> Maintainers &amp; Contact

- GitHub Issues: best channel for bugs and feature requests.
- Discussions: share ideas, roadmaps, or questions with the community.
- Operational escalations: coordinate with the Syntax &amp; Sips platform team via the internal #syntax-sips Slack channel.

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/history.svg" alt="Changelog" width="22" height="22" /> Changelog

Review version history, release cadence, and upgrade notes in [CHANGELOG.md](CHANGELOG.md).
