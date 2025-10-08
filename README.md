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
- **Server:** Next.js API routes orchestrate CRUD for posts, taxonomy, comments, and newsletter workflows. (`src/app/api/admin`)
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
- Optional: Supabase CLI for local development (`supabase start`)

### Installation
```bash
npm install
```

### Environment Variables
Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_SITE_URL=https://www.syntax-blogs.prashant.sbs
```

- `NEXT_PUBLIC_*` keys power client-side session management.
- Keep the service role key server-side only via secure secrets management.
- Mirror production locally with `supabase start` to exercise migrations and RLS behavior.

### Database Setup
```bash
supabase db push
```

For a clean slate during development:
```bash
supabase db reset --force
```

### Run the App
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (and `/admin` for authenticated tooling once an admin account exists).

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/shield-check.svg" alt="Quality" width="22" height="22" /> Operational Playbooks

| Scenario | Command |
| --- | --- |
| Start development server with chunk sync | `npm run dev` |
| Compile production assets | `npm run build` |
| Serve production bundle locally | `npm run start` |
| Lint the codebase | `npm run lint` |
| Execute Playwright regression suites | `npm run test` |
| Debug Playwright suites with UI runner | `npm run test:ui` |
| Run headed browser tests | `npm run test:headed` |

### Quality &amp; Observability
- Playwright validates core journeys from authentication to publishing. Provide credentials via environment variables before running suites.
- ESLint and TypeScript guard code quality; see `eslint.config.mjs` and `tsconfig.json` for project-wide rules.
- Consult `QA_PRODUCTION_READINESS.md` for manual verification checklists before launch windows.

### Security &amp; Compliance
- Admin access requires Supabase-managed accounts with `profiles.is_admin = true`. (`src/app/admin/page.tsx`)
- Secrets live exclusively in environment variables; never bundle credentials in the repository.
- RLS policies gate reader data—inspect migrations prior to schema updates. (`supabase/migrations`)
- Dedicated privacy, cookies, and disclaimer pages surface policy obligations. (`src/app/privacy/page.tsx`, `src/app/cookies/page.tsx`, `src/app/disclaimer/page.tsx`)

### Deployment &amp; Operations
1. Configure Supabase keys per environment (local, staging, production).
2. Apply database migrations and confirm the `newsletter-subscribe` Edge Function is deployed. (`supabase/functions/newsletter-subscribe`)
3. Run `npm run build` locally to validate the production bundle.
4. Deploy via Vercel, Netlify, or containerized infrastructure, then monitor Supabase logs and analytics within the first 24 hours.

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/layout-grid-add.svg" alt="Structure" width="22" height="22" /> Project Structure

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

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/book.svg" alt="Documentation" width="22" height="22" /> Documentation &amp; Support
- Deep dives on AI integrations, gamification strategy, and community programs live in [`docs/`](./docs).
- Reference [`neobrutalismthemecomp.MD`](./neobrutalismthemecomp.MD) for design tokens and layout principles.
- Supabase guidance and environment variables live alongside platform runbooks in [`docs/`](./docs) (expand as playbooks evolve).

For questions or enhancements, open an issue or start a discussion—maintainers actively triage requests.

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/pencil.svg" alt="Contributing" width="22" height="22" /> Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m "feat(scope): description"`.
4. Push to your fork: `git push origin feature/your-feature`.
5. Open a Pull Request describing motivation, user impact, and validation.

---

## <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/license.svg" alt="License" width="22" height="22" /> License

Licensed under the MIT License. See [LICENSE](LICENSE) for the full terms.
