# Syntax & Sips

A fully featured editorial platform for AI, machine learning, and deep learning stories. Syntax & Sips combines a bold neo-brutalist aesthetic with a production-ready CMS, Supabase-backed authentication, rich media storytelling tools, and an analytics-focused admin workspace.

## Table of Contents

- [Product Overview](#product-overview)
- [Feature Highlights](#feature-highlights)
- [System Architecture](#system-architecture)
- [User Experience](#user-experience)
- [Getting Started](#getting-started)
- [Admin Access and Permissions](#admin-access-and-permissions)
- [Quality and Tooling](#quality-and-tooling)
- [Deployment Guide](#deployment-guide)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Product Overview

Syntax & Sips is built with the Next.js App Router and offers a modular content strategy that spans blogs, tutorials, podcasts, videos, newsletters, and resource libraries. Supabase powers authentication, row-level security, scheduled publishing, and editorial metadata. The front end embraces the brand identity with heavy strokes, expressive typography, and animated accents while remaining fully responsive.

## Feature Highlights

### Editorial Experiences

- **Multi-channel publishing:** Dedicated sections for blogs, tutorials, podcasts, resources, newsletters, and videos, each tuned for the target medium. (`src/app/blogs`, `src/app/podcasts`, `src/app/videos`, `src/app/tutorials`, `src/app/resources`).
- **Rich article presentation:** Code samples, inline callouts, AI summaries, video embeds, and topic spotlights elevate long-form posts. (`src/components/ui/NewSummarizeButton.tsx`, `src/components/ui/CodeBlock.tsx`, `src/components/ui/VideoEmbed.tsx`).
- **Dynamic topic curation:** Recommended categories and tag filters are sourced from Supabase so the reading experience stays in sync with editorial planning. (`src/app/topics/page.tsx`, `src/lib/supabase`).
- **Reader trust signals:** Dedicated legal, privacy, cookies, disclaimer, and changelog pages surface governance and transparency content. (`src/app/privacy`, `src/app/cookies`, `src/app/disclaimer`, `src/app/changelog`).

### Admin Workspace

- **Secure admin authentication:** Supabase Auth with server-side guards ensures only elevated profiles can reach the dashboard. (`src/app/admin/page.tsx`, `src/components/auth/AdminLoginForm.tsx`).
- **Dashboard overview:** Editors land on performance metrics, content velocity, and editorial health indicators. (`src/components/admin/DashboardOverview.tsx`, `src/components/admin/AnalyticsPanel.tsx`).
- **Visual post management:** Filterable tables, search, and inline status chips streamline day-to-day publishing. (`src/components/admin/PostsTable.tsx`).
- **Powerful post editor:** Create and edit content with scheduling, tagging, SEO metadata, social imagery, and accent color controls. (`src/components/admin/PostForm.tsx`).
- **Audience and role management:** Manage user accounts, roles, and permissions from a dedicated panel backed by Supabase RPCs. (`src/components/admin/UserManagement.tsx`).
- **Community moderation:** Review, approve, and triage reader feedback in real time through the comments workflow. (`src/components/admin/CommentsModeration.tsx`).
- **Structured taxonomy:** Maintain categories, tags, and topic relationships with guard rails to keep the site navigation cohesive. (`src/components/admin/TaxonomyManager.tsx`).

### Platform Capabilities

- **AI-assisted tools:** Trigger Supabase edge functions to summarize long-form content with a single click for each article. (`src/components/ui/NewSummarizeButton.tsx`).
- **Email capture and lifecycle:** Newsletter subscription flow is powered by Supabase functions and transactional mailers. (`src/app/newsletter`, `supabase/functions/newsletter-subscribe`).
- **Theming and accessibility:** Global neo-brutalist style sheet, theme provider, and focus-aware components maintain consistent visuals and accessible contrast ratios. (`src/styles/neo-brutalism.css`, `src/components/theme-provider.tsx`).
- **Animations and depth:** Framer Motion micro-interactions, animated hero blocks, and 3D elements enhance storytelling without sacrificing performance. (`src/components/magicui`, `src/app/page.tsx`).
- **Testing and observability:** Playwright integration tests and API-level checks keep key flows guarded during releases. (`tests/auth.spec.ts`, `playwright.config.ts`).

## System Architecture

| Layer | Responsibility | Key Modules |
| --- | --- | --- |
| Presentation | Next.js App Router routes, shared layout, and Tailwind-powered UI components | `src/app`, `src/components/ui`, `src/app/layout.tsx` |
| Authentication & Authorization | Supabase Auth session helpers, client/server wrappers, and admin guards | `src/lib/supabase`, `src/components/auth`, `src/middleware.ts` |
| Content Services | Route handlers expose CRUD APIs for posts, comments, taxonomies, and analytics dashboards | `src/app/api/admin`, `src/utils/types.ts` |
| Data Layer | Supabase migrations, SQL helpers, and edge functions for newsletter automation | `supabase/migrations`, `supabase/functions` |
| Tooling | Build scripts, webpack chunk syncing, linting, formatting, and testing harnesses | `scripts/sync-webpack-chunks.js`, `eslint.config.mjs`, `playwright.config.ts` |

## User Experience

<div align="center">
  <img src=".github/images/Hero.png" alt="Syntax and Sips Hero" width="100%">
</div>

- **Neo-brutalist aesthetic:** Bold outlines, offset shadows, and confident color blocking give the site its distinctive personality.
- **Responsive from mobile to desktop:** Layouts collapse gracefully, preserving scannability and tap targets on smaller screens.
- **Audience-centric journeys:** Content hubs, topic filters, and curated follow modules guide readers to their next story.
- **Inclusive interactions:** Keyboard-friendly components, descriptive ARIA labels, and consistent focus rings support accessibility.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project with the SQL schema deployed
- (Optional) Supabase CLI for local database emulation

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and provide the credentials from your Supabase project. Do **not** commit this file.

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

- The `NEXT_PUBLIC_*` keys are required for client-side rendering and the authentication handshake.
- The service role key must remain on the server—store it in secure secrets management only.
- If you are mirroring production locally, run `supabase start` from the Supabase CLI to provision the Postgres + auth stack.

### Database Setup

Run the migrations in order to build the required schema, enums, triggers, and policies:

```bash
supabase db push
```

For a pristine local database you can reset and reseed from scratch:

```bash
supabase db reset --force
```

### Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the reader experience, and head to `/admin` after creating an authorized account.

## Admin Access and Permissions

1. Create a user in the Supabase Auth dashboard or via the Admin API.
2. Insert a matching profile in the `profiles` table with `is_admin` set to `true` (and optionally assign a `primary_role_id`).
3. Sign in at `/admin/login` using that account. The app double-checks the `profiles.is_admin` flag before granting access. (`src/app/admin/page.tsx`).
4. Manage additional roles and team members from the **User Management** panel inside the dashboard. (`src/components/admin/UserManagement.tsx`).

No default credentials are bundled with the project; create and rotate admin accounts according to your security policies.

## Quality and Tooling

| Command | Description |
| --- | --- |
| `npm run lint` | Runs Next.js + ESLint rules across the project. |
| `npm run test` | Executes the Playwright test suite in headless mode. |
| `npm run test:headed` | Opens the Playwright runner with a headed browser for debugging. |
| `npm run build` | Generates an optimized production build. |
| `npm run start` | Serves the production build locally. |

To enable the authenticated Playwright flows, provide the following environment variables when running tests:

```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 \
PLAYWRIGHT_E2E_EMAIL=<admin-email> \
PLAYWRIGHT_E2E_PASSWORD=<admin-password> \
npm run test
```

## Deployment Guide

Syntax & Sips is ready for platforms such as Vercel, Netlify, or any environment that supports Next.js 15.

1. Ensure migrations are deployed and environment variables are configured.
2. Deploy the `newsletter-subscribe` Supabase Edge Function if you rely on the newsletter flow. (`supabase/functions/newsletter-subscribe`).
3. Run `npm run build` to verify the production bundle locally.
4. Publish using your hosting provider of choice (Vercel, Netlify, or a containerized setup).

## Project Structure

```
.
├── src
│   ├── app              # Next.js App Router routes for every audience touch point
│   ├── components       # Shared UI, admin tooling, authentication, and design system pieces
│   ├── hooks            # Custom hooks for Supabase sync and UI behavior
│   ├── lib              # Supabase client helpers, utilities, and configuration
│   └── utils            # Shared types, constants, and formatting helpers
├── supabase             # SQL migrations, seed data, and edge functions
├── scripts              # Build and operational scripts (webpack sync, migrations)
├── tests                # Playwright end-to-end and API tests
└── public               # Static assets, fonts, and Open Graph imagery
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m "Add amazing feature"`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request and describe the user-facing impact.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
