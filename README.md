# Syntax & Sips

<p align="center"><strong>An editorial platform that fuses AI storytelling, human craftsmanship, and a bold neo-brutalist aesthetic.</strong></p>

<p align="center">
  <a href="https://nextjs.org/">Next.js 15</a> ·
  <a href="https://supabase.com/">Supabase</a> ·
  <a href="https://tailwindcss.com/">Tailwind CSS</a> ·
  <a href="https://www.framer.com/motion/">Framer Motion</a> ·
  <a href="https://playwright.dev/">Playwright</a>
</p>

## At a Glance

- **Audience experience:** Multi-format content hubs with topic curation, inline code, AI-powered summaries, and rich media embeds. (`src/app`, `src/components/ui`).
- **Editorial cockpit:** Authenticated admin workspace for analytics, publishing workflow, taxonomy stewardship, and community moderation. (`src/components/admin`).
- **Modern foundations:** Next.js App Router, Supabase Auth, Edge Functions, and a component-driven design system ready for enterprise hardening. (`src/lib`, `supabase`).

## Table of Contents

- [Product Narrative](#product-narrative)
- [Feature Highlights](#feature-highlights)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Data Model Snapshot](#data-model-snapshot)
- [Experience Walkthrough](#experience-walkthrough)
- [Getting Started](#getting-started)
- [Development Playbooks](#development-playbooks)
- [Testing & Quality](#testing--quality)
- [Security & Compliance](#security--compliance)
- [Deployment & Operations](#deployment--operations)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Product Narrative

Syntax & Sips is a fully featured editorial stack for teams telling stories about AI, machine learning, and deep tech. The public site celebrates content with oversized typography, kinetic micro-interactions, and accessible color palettes. Behind the scenes, editors gain a unified workspace to manage content velocity, audience growth, and governance in one place. Supabase anchors authentication, data access, and automation so the platform scales from prototype to production-ready deployment.

<div align="center">
  <img src=".github/images/Hero.png" alt="Syntax & Sips hero layout" width="100%" />
</div>

## Feature Highlights

### Reader Experience

- **Multi-channel storytelling:** Dedicated routes for blogs, tutorials, podcasts, videos, newsletters, and resource libraries to tailor each medium. (`src/app/blogs`, `src/app/podcasts`, `src/app/videos`, `src/app/tutorials`, `src/app/resources`).
- **Rich article presentation:** Markdown, code snippets, callouts, and video embeds keep long-form content readable and actionable. (`src/components/ui/CodeBlock.tsx`, `src/components/ui/VideoEmbed.tsx`).
- **AI-assisted recaps:** One-click summarization leans on Supabase functions to distill articles into shareable insights. (`src/components/ui/NewSummarizeButton.tsx`).
- **Audience journeys:** Topic explorers, recommended reads, and changelog transparency build trust with returning readers. (`src/app/topics/page.tsx`, `src/app/changelog/page.tsx`).

### Editorial Operations

- **Secure admin authentication:** Supabase Auth + server checks guard the `/admin` routes. (`src/app/admin/page.tsx`, `src/components/auth/AdminLoginForm.tsx`).
- **Dashboard intelligence:** Analytics cards and trend visualizations surface readership health at a glance. (`src/components/admin/DashboardOverview.tsx`, `src/components/admin/AnalyticsPanel.tsx`).
- **Visual content workflow:** Filterable tables, inline status chips, and post detail drawers streamline publishing operations. (`src/components/admin/PostsTable.tsx`, `src/components/admin/PostForm.tsx`).
- **Community moderation:** Review, approve, or archive reader comments from a live queue. (`src/components/admin/CommentsModeration.tsx`).
- **Role-aware management:** Update profiles, roles, and permissions without leaving the console. (`src/components/admin/UserManagement.tsx`).

### Platform Intelligence

- **Supabase Edge Functions:** Power newsletter lifecycle events and AI integrations with serverless functions. (`supabase/functions/newsletter-subscribe`).
- **Neo-brutalist design system:** Shared components and theming utilities keep UX cohesive across surfaces. (`src/components/ui`, `src/components/theme-provider.tsx`).
- **Performance-minded animations:** Framer Motion micro-interactions layer delight without sacrificing Core Web Vitals. (`src/components/magicui`, `src/app/page.tsx`).

## Architecture & Tech Stack

### Core Stack

| Layer | Technologies | Key Modules |
| --- | --- | --- |
| Presentation | Next.js App Router, Tailwind CSS, Lucide icons | `src/app`, `src/components/ui`, `src/styles` |
| Interaction | Framer Motion, custom hooks, Radix Primitives | `src/components/magicui`, `src/hooks` |
| Authentication | Supabase Auth, SSR helpers, middleware guards | `src/lib/supabase`, `src/middleware.ts` |
| Data & APIs | Next.js route handlers, Supabase RPC, nodemailer | `src/app/api`, `supabase/functions` |
| Tooling | Webpack chunk sync, ESLint, Playwright | `scripts/sync-webpack-chunks.js`, `eslint.config.mjs`, `playwright.config.ts` |

### Service Topology

- **Client:** Progressive enhancement with SSR, streamed routes, and suspense boundaries.
- **Server:** Next.js API routes orchestrate CRUD for posts, taxonomy, comments, and newsletter management. (`src/app/api/admin`).
- **Database:** Supabase Postgres with row level security, migrations, and SQL helpers. (`supabase/migrations`).
- **Automation:** Supabase Edge Functions handle newsletter subscribe events and AI summarization triggers. (`supabase/functions`).

## Data Model Snapshot

| Domain | Key Tables / Views | Purpose |
| --- | --- | --- |
| Content | `posts`, `post_tags`, `categories`, `tags` | Authoring, categorization, scheduling |
| Editorial Workflow | `profiles`, `roles`, `profile_roles` | Admin access, hierarchy, and permissions |
| Engagement | `comments`, `newsletter_subscribers` | Reader participation and lifecycle programs |
| Configuration | `site_settings` | Global branding, navigation, and operational toggles |

> Review `supabase/migrations` for the authoritative schema and business logic, including triggers and RLS policies.

## Experience Walkthrough

1. **Discover stories:** Readers land on the home page hero with animated headlines and quick access to trending categories. (`src/app/page.tsx`).
2. **Navigate content hubs:** Dedicated routes for each medium showcase curated content with tailored layouts. (`src/app/blogs`, `src/app/resources`).
3. **Dive into detail:** Article pages stitch together markdown, code blocks, video embeds, and AI summary toggles. (`src/app/blogs/[slug]/page.tsx`, `src/app/blogs/[slug]/NewBlogPostClient.tsx`).
4. **Engage and subscribe:** Newsletter capture and comment sections invite deeper community participation. (`src/app/newsletter/page.tsx`, `src/components/ui/CommentsSection.tsx`).
5. **Admin login:** Authorized team members authenticate via `/admin/login` with Supabase-backed credentials. (`src/components/auth/AdminLoginForm.tsx`).
6. **Manage the newsroom:** Editors monitor analytics, publish or edit posts, manage media, and adjust taxonomy settings from the admin dashboard. (`src/components/admin/AdminDashboard.tsx`, `src/components/admin/TaxonomyManager.tsx`, `src/components/admin/MediaLibraryDialog.tsx`).

Additional hero and dashboard visuals live under `.github/images` for reference.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase project with the Syntax & Sips schema deployed
- (Optional) Supabase CLI for local Postgres + auth emulation

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and supply Supabase credentials (never commit this file):

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

- The `NEXT_PUBLIC_*` keys enable client-side session handling.
- The service role key must remain on the server—load it via secure secrets management only.
- Mirror production locally with `supabase start` if you use the Supabase CLI.

### Database Setup

Deploy migrations to your Supabase instance:

```bash
supabase db push
```

For a clean slate during development you can reset the local database:

```bash
supabase db reset --force
```

### Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the reader experience and `/admin` for authenticated tooling once your admin account is prepared.

## Development Playbooks

| Scenario | Command |
| --- | --- |
| Start development server with chunk sync | `npm run dev` |
| Compile production assets | `npm run build` |
| Serve the production build locally | `npm run start` |
| Lint codebase | `npm run lint` |
| Execute Playwright tests in headless mode | `npm run test` |
| Debug Playwright suites with UI runner | `npm run test:ui` |
| Run headed browser tests | `npm run test:headed` |

### Debugging Tips

- Next.js route handlers in `src/app/api` log useful context for Supabase queries; wire up `console` output or structured logging as needed.
- Keep `scripts/sync-webpack-chunks.js` running during development to align generated chunk manifests with the Next.js build. (`scripts/sync-webpack-chunks.js`).
- Supabase logs are accessible from the dashboard when evaluating row level security rules or cron triggers.

## Testing & Quality

Playwright safeguards critical user journeys from login to publishing. Provide credentials via environment variables before running end-to-end suites:

```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 \
PLAYWRIGHT_E2E_EMAIL=<admin-email> \
PLAYWRIGHT_E2E_PASSWORD=<admin-password> \
npm run test
```

Linting is configured through `eslint.config.mjs`, and TypeScript types are enforced project-wide via `tsconfig.json`.

Refer to `QA_PRODUCTION_READINESS.md` for manual verification checklists prior to launching new environments.

## Security & Compliance

- Admin access requires Supabase-managed accounts with the `profiles.is_admin` flag set to `true`. (`src/app/admin/page.tsx`).
- Secrets live only in environment variables; never bundle credentials in the repository.
- Row Level Security and Supabase policies gate access to reader data—review migrations before altering schemas. (`supabase/migrations`).
- Communicate privacy, legal, cookies, and disclaimer obligations through dedicated content pages. (`src/app/privacy/page.tsx`, `src/app/cookies/page.tsx`, `src/app/disclaimer/page.tsx`).

## Deployment & Operations

Syntax & Sips deploys cleanly to Vercel, Netlify, or containerized infrastructure that supports Next.js 15.

1. Configure environment variables for your target environment (Supabase URL, anon key, service role key).
2. Apply database migrations and confirm the `newsletter-subscribe` Edge Function is deployed if you rely on email capture. (`supabase/functions/newsletter-subscribe`).
3. Run `npm run build` locally to validate the production bundle.
4. Ship the build via your hosting provider and monitor Supabase logs plus application analytics for the first 24 hours.

## Project Structure

```
.
├── src
│   ├── app              # Next.js routes for readers, admin, marketing, and legal pages
│   ├── components       # UI primitives, admin tooling, and design system modules
│   ├── hooks            # Custom React hooks for session management and UI behavior
│   ├── lib              # Supabase clients, helpers, and configuration glue
│   └── utils            # Shared types, formatters, and constants
├── supabase             # SQL migrations, seed references, and edge functions
├── scripts              # Build-time helpers (webpack chunk sync, tooling)
├── tests                # Playwright end-to-end suites and fixtures
├── public               # Static assets, fonts, and Open Graph imagery
└── .github/images       # Marketing and documentation visuals
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m "Add amazing feature"`.
4. Push to your fork: `git push origin feature/amazing-feature`.
5. Open a Pull Request describing the user impact and validation.

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for full terms.
