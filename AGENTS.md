# AGENTS: Syntax & Sips Project Guide

Welcome to **Syntax & Sips**, a Next.js 15 + Supabase editorial platform featuring neobrutalism UI components and gamified storytelling. This document is the authoritative reference for AI coding assistants and contributors. Treat it as a living standard—update it whenever project practices evolve.

---

## 1. Project Overview
- **Mission**: Build an editorial and community platform with gamified engagement mechanics, curated content, and administrative tooling.
- **Primary Stack**: Next.js 15 (App Router), Supabase (PostgreSQL + Auth + Storage), TypeScript (strict), Tailwind CSS, neobrutalism-inspired component library (see [`neobrutalismthemecomp.MD`](./neobrutalismthemecomp.MD)).
- **Key Features**:
  - Rich content authoring and publishing workflows.
  - Supabase-backed authentication, profiles, and role-based dashboards.
  - Gamification system (XP, badges, leaderboards) driving reader engagement.
  - Admin tooling for editorial oversight, moderation, and analytics.
- **Architecture Patterns**:
  - Next.js **App Router** structure with a blend of **Server Components** (data fetching, static content) and **Client Components** (interactive UI, gamification widgets).
  - Supabase edge functions / SQL for backend logic, accessed through typed helpers.
  - Co-located API routes (`app/api/**`) for serverful endpoints when Supabase edge functions are insufficient.

---

## 2. Development Environment Setup
- **Package Management**:
  - Install dependencies: `pnpm install`
  - Add a dependency: `pnpm add <package>`
  - Remove a dependency: `pnpm remove <package>`
  - After editing `package.json`, re-run `pnpm install` to sync lockfiles.
- **Core Scripts**:
  - Local development server: `pnpm dev`
  - Production build: `pnpm build`
  - TypeScript type checking: `pnpm type-check`
  - Linting: `pnpm lint`
  - Formatting: `pnpm format`
- Ensure Node version aligns with `.nvmrc`/CI configuration (if missing, default to Active LTS). Use Volta or nvm to pin versions.
- Configure Supabase environment variables locally (`.env.local`) using team-provided secrets. Never commit secrets.

---

## 3. Code Standards & Best Practices
- **TypeScript**: `strict` enabled. Avoid `any`; prefer explicit interfaces/types. Use discriminated unions or enums for gamification state.
- **Styling**:
  - Rely on Tailwind utility classes. Extend theme via `tailwind.config.js` when necessary.
  - Follow neobrutalism system for bold colors, shadows, and outlined components—cross-reference `docs/` and `neobrutalismthemecomp.MD` for canonical patterns.
  - Design mobile-first; layer responsive modifiers (`sm:`, `md:`, `lg:`…) progressively.
  - Prefer CSS variables (defined in `globals.css` or theme tokens) for colors/spacings used across components.
- **Components**:
  - Use functional React components with hooks; avoid legacy class components.
  - Default to **Server Components** for static content or data fetching without client interactivity.
  - Promote **Client Components** (add `'use client'`) for interactivity, Supabase auth hooks, or stateful UI.
  - Compose UI through reusable primitives; avoid deep prop drilling—consider context providers for shared state.
- **File Organization**:
  - Feature-first structure: group routes, components, hooks, tests within feature directories.
  - File naming: kebab-case for route folders/files, PascalCase for component files, camelCase for helpers.
  - Keep modules focused—extract helpers when files exceed ~200 lines or mix concerns.
- **Performance**:
  - Utilize dynamic imports (`next/dynamic`) for heavy client components.
  - Use `React.memo`, `useMemo`, `useCallback` thoughtfully to avoid unnecessary re-renders.
  - Optimize images via Next.js `<Image>` component and Supabase storage transformations.
  - Cache server data with `revalidate`/ISR and Supabase row-level caching where applicable.

---

## 4. Testing Requirements
- **Framework**: Vitest (unit/integration), Playwright (E2E) if configured under `tests/`.
- **Commands**:
  - Run all tests: `pnpm test`
  - Watch mode: `pnpm test:watch`
  - Coverage report: `pnpm test:coverage`
  - End-to-end tests: `pnpm test:e2e`
- **Standards**:
  - Every new feature/bugfix requires automated tests. Maintain ≥80% coverage—monitor `coverage/` reports.
  - Cover happy paths, failure modes, boundary conditions.
  - Mock Supabase/network calls via testing utilities to keep tests deterministic.
  - Write integration tests for API routes and critical workflows (auth, publishing, gamification rewards).
  - Include UI component tests using testing-library + Vitest for render/interaction states.
- **Organization**:
  - Co-locate tests next to implementation files as `<name>.test.ts[x]`.
  - Use descriptive `describe`/`it` names capturing behavior.
  - Use `beforeEach`/`afterEach` for setup/cleanup; prefer helper factories for fixtures.

---

## 5. Responsive Design Standards
- **Approach**: Mobile-first. Start with base styles targeting small screens, layer breakpoints progressively.
- **Breakpoints**: Tailwind defaults (`sm`, `md`, `lg`, `xl`, `2xl`). Extend only if justified.
- **Implementation Tips**:
  - Use responsive modifiers (`sm:flex`, `lg:grid-cols-3`) and fluid spacing via `%`, `rem`, `em`.
  - Ensure touch targets are ≥44px, apply `aria-label`s to icon buttons.
  - Validate layouts on real devices/emulators for both portrait and landscape.
- **Accessibility**:
  - Adhere to WCAG 2.1 AA. Provide semantic HTML, ARIA roles, skip links where needed.
  - Ensure keyboard navigation across interactive elements (`tabIndex`, `focus-visible` styles).
  - Maintain color contrast ≥4.5:1—leverage Tailwind tokens or CSS variables.
  - Test with screen readers (NVDA/VoiceOver) and consider high-contrast/dark mode scenarios.

---

## 6. Database & API Standards
- **Supabase Integration**:
  - Use generated TypeScript types from Supabase (`supabase/types` or similar). Avoid raw string queries without typing.
  - Enforce Row Level Security policies; document new policies in `supabase/README.md` (create if missing).
  - Wrap database operations in try/catch, log errors with context, surface user-friendly messages.
  - Rely on Supabase client pooling in server components or route handlers; avoid creating clients per request without caching.
- **API Routes (`app/api/**`)**:
  - Follow REST semantics (GET for reads, POST for create actions, etc.).
  - Validate auth/permissions server-side using Supabase auth helpers and role checks.
  - Return appropriate HTTP status codes and JSON error payloads with `code`/`message` structure.
  - Apply rate limiting to public endpoints (e.g., Upstash Redis) to defend against abuse.
- **Data Validation**:
  - Use Zod schemas for request bodies, params, and responses. Export shared schemas from `src/lib/validation`.
  - Provide actionable error messages; surface validation issues to the UI when safe.

---

## 7. Security Best Practices
- **Authentication**:
  - Leverage Supabase Auth (magic links, OAuth, email/pass). Guard server components via `createServerComponentClient`.
  - Use secure, HTTP-only cookies for session tokens. Rotate secrets when compromised.
  - Implement logout endpoints that invalidate sessions on both client and Supabase.
- **Authorization**:
  - Enforce RBAC: e.g., `reader`, `author`, `editor`, `admin`. Validate roles before mutating data.
  - Apply middleware (`middleware.ts`) or route handlers to enforce protections.
  - Log privileged actions (publishing, banning users) with user IDs and timestamps.
- **Data Security**:
  - Store secrets in environment variables; never log or commit credentials.
  - Sanitize and escape user input before rendering; prevent XSS and SQL injection (Supabase client parameterizes queries by default).
  - Serve exclusively over HTTPS in production. Configure strict CSP headers via `next.config.ts`/`middleware`.
  - Set precise CORS rules for API routes.

---

## 8. Performance Optimization
- **Frontend**:
  - Apply code splitting via dynamic imports and route-level chunks.
  - Optimize hero media with responsive images (`sizes`, `priority` judiciously) and Supabase storage transformations.
  - Cache fetches with `revalidateTag`/`revalidatePath` or SWR strategies.
  - Monitor hydration costs; reduce client JS by offloading logic to server components.
- **Backend**:
  - Index database columns used in filters or ordering; run EXPLAIN plans for heavy queries.
  - Batch Supabase calls where possible; avoid N+1 queries by using RPC or `select` with nested relationships.
  - Implement caching layers (Edge cache, Redis) for frequently accessed leaderboards or public content.
  - Include retry logic for transient Supabase/network errors with exponential backoff.

---

## 9. Documentation Standards
- **Code**:
  - Use JSDoc/TSDoc comments for exported functions, hooks, and utilities. Describe parameters, return types, side effects.
  - Document complex gamification logic (badge thresholds, XP formulas) inline and in `docs/`.
  - Annotate component prop interfaces with descriptions and default values.
- **Project Docs**:
  - Keep `README.md` aligned with deployment state. Update when setup or architecture changes.
  - Maintain API specs (OpenAPI/Markdown) under `docs/api/`.
  - Document deployment runbooks and Supabase migrations in `docs/operations/`.
  - Provide troubleshooting FAQs for local setup, testing, and Supabase connectivity.
- **Inline Comments**:
  - Explain *why* decisions were made; remove obsolete comments promptly.
  - Avoid obvious comments (e.g., `// increment i`).

---

## 10. Git & Collaboration Standards
- **Commit Messages**: Use Conventional Commits (`feat(auth): add passwordless flow`). Scope optional but encouraged.
- **Branching**:
  - `feature/<short-description>` for new functionality.
  - `fix/<issue>` for bug fixes.
  - `hotfix/<issue>` for urgent production patches.
  - Keep branches focused; rebase onto `main` before opening PRs.
- **Pull Requests**:
  - Provide summary, motivation, testing evidence, and linked issues.
  - Attach screenshots or recordings for UI updates (desktop + mobile) when feasible.
  - Ensure `pnpm lint`, `pnpm type-check`, and `pnpm test` pass before requesting review.
  - Seek review from at least one teammate; address feedback promptly.

---

## 11. Build & Deployment
- **Build Steps**:
  - Run `pnpm lint` and `pnpm test` before `pnpm build` to catch regressions early.
  - Generate source maps for production debugging; ensure CI artifacts capture them securely.
  - Optimize assets (SVG minification, font subsetting in `fonts/`).
- **Environment Management**:
  - Use `.env.local` for local, `.env.development`, `.env.production` as needed. Track required vars in `docs/env.md`.
  - Never commit `.env*` files containing secrets. Provide `.env.example` updates when introducing new variables.
  - Configure Supabase project settings per environment (dev/staging/prod) and document connection URLs.
- **Deployment**:
  - Follow CI/CD pipeline (e.g., GitHub Actions) to build, lint, test, and deploy to the hosting provider (Vercel/Supabase Edge Functions).
  - Ensure rollback strategy (previous deployment ID or Supabase migration revert plan).
  - Monitor logs and metrics post-deploy; create incidents for critical failures.

---

## 12. Error Handling & Logging
- **Error Handling**:
  - Wrap async operations in try/catch; throw typed errors when re-raising.
  - Implement React error boundaries for client components to display graceful fallbacks.
  - Surface user-friendly messages while logging technical details server-side.
  - Provide recovery paths (retry buttons, cached state) where possible.
- **Logging**:
  - Use structured logging utilities (e.g., pino) to include context (`userId`, `route`, `payload`).
  - Apply log levels (`debug`, `info`, `warn`, `error`) consistently.
  - Redact sensitive information before logging. Configure retention/rotation policies in hosting provider.

---

## 13. Accessibility Standards
- **WCAG 2.1 AA** compliance is non-negotiable.
  - Ensure keyboard accessibility for all interactive controls.
  - Provide ARIA attributes where semantic HTML cannot convey purpose.
  - Maintain contrast ratios ≥4.5:1 for text and 3:1 for large text/icons.
  - Supply `alt` text for imagery and transcripts/captions for media.
  - Validate screen reader experience using VoiceOver, NVDA, or Narrator.
- **Testing**:
  - Include accessibility checks in testing pipeline (e.g., `@axe-core/react`, Playwright accessibility snapshots).
  - Manually test keyboard navigation and focus management in PRs touching UI.

---

## 14. Monitoring & Analytics
- **Performance Monitoring**:
  - Track Core Web Vitals via Next.js telemetry or third-party tooling (e.g., Vercel Analytics).
  - Set performance budgets; alert when metrics regress.
  - Monitor error rates (client + server) and latency for API routes.
- **User Analytics**:
  - Capture engagement metrics (session duration, XP earned, feature usage) ethically.
  - Respect privacy/GDPR: anonymize where possible, offer opt-outs, document data collection policies.
  - Coordinate analytics events with product to ensure consistent naming and taxonomy.

---

## 15. AI Assistant Guidelines
- **Code Generation**:
  - Treat generated code as drafts—review manually, ensure alignment with patterns above.
  - Add robust error handling, logging, and validation before finalizing.
  - Produce accompanying tests and documentation updates for new functionality.
- **Documentation Updates**:
  - When standards evolve, update this AGENTS.md along with relevant docs.
  - Capture new architectural patterns, lint rules, or dependencies promptly.
  - Provide examples or code snippets illustrating new conventions.
- **Continuous Improvement**:
  - Log recurring issues or friction points and codify learnings here.
  - Keep instructions actionable; prune deprecated guidance.
  - Coordinate with maintainers to validate significant documentation revisions.

---

## Self-Documentation Charter
You are empowered to improve this document:
1. Preserve section structure and clarity.
2. Provide concise rationales for updates in commit messages and PR summaries.
3. Include examples, diagrams, or references when clarifying complex workflows.
4. Ensure new guidance aligns with actual project configuration and is tested.
5. Verify that after edits, AGENTS.md still offers a coherent onboarding path.

Embrace continuous improvement—keep this guide accurate, practical, and aligned with Syntax & Sips' evolving needs.
