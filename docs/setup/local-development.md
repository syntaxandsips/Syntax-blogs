# Local Development Guide

This guide walks through configuring Syntax & Sips on a local workstation. Follow each section sequentially to avoid missing prerequisites or secrets.

## 1. Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| Node.js | 20.x LTS | Use `nvm`, Volta, or fnm to pin the version. |
| npm | 10.x | Ships with Node 20.x. |
| Supabase CLI | Latest | Optional but recommended for managing migrations. Install with `npm install -g supabase`. |
| Git | Latest stable | Required for cloning and managing branches. |
| Mailtrap (or SMTP provider) | N/A | Needed to exercise newsletter confirmation flows locally. |

## 2. Clone and Install

```bash
git clone https://github.com/your-org/Syntax-blogs.git
cd Syntax-blogs
npm install
```

> Run `npm install` whenever dependencies change in `package.json` to keep `package-lock.json` up to date.

## 3. Environment Configuration

1. Copy `.env.example` (if present) or create `.env.local` from scratch.
2. Populate the variables described below:

| Variable | Purpose | Where to Find |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase REST URL | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side operations (RLS bypass) | Supabase dashboard → Project Settings → API (service_role) |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin for metadata and sharing | Use `http://localhost:3000` in development |
| `MAILTRAP_USER` / `MAILTRAP_PASS` | SMTP credentials for newsletter confirmations | Mailtrap Inboxes → SMTP credentials |
| `MAILTRAP_FROM_EMAIL` / `MAILTRAP_FROM_NAME` | Sender identity | Choose a friendly from address, e.g., `noreply@syntax-blogs.test` |

Store secrets securely (1Password, Vault, environment-specific secret stores). Never commit `.env.local`.

## 4. Supabase Setup

```bash
# Authenticate and link to your project once
supabase login
supabase link --project-ref <your-project-ref>

# Push migrations and seed data
supabase db push

# Optional: start Supabase locally (Docker required)
supabase start
```

- Run `supabase db reset --force` to drop and recreate the database during testing.
- Keep migrations in sync with the remote project to avoid drift.

## 5. Running the App

```bash
npm run dev
```

- Visit `http://localhost:3000` for the public site.
- Access the admin console at `http://localhost:3000/admin` (requires an admin-enabled Supabase user).
- Use `npm run start` after `npm run build` to simulate production locally.

## 6. Creating an Admin User

1. Sign up through the public UI or Supabase Auth portal.
2. In Supabase, update the user's profile record:
   ```sql
   update profiles set is_admin = true where email = 'you@example.com';
   ```
3. Re-authenticate to refresh permissions.

## 7. Optional Tooling

- **Chunk synchronisation:** `scripts/sync-webpack-chunks.js` keeps dynamic import manifests consistent across dev/build commands.
- **Browser automation:** Install Playwright browsers with `npx playwright install` before running the end-to-end suite.
- **Type checking:** Add a `type-check` script (`tsc --noEmit`) if you need strict compilation outside of Next.js builds.

## 8. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Module not found: Can't resolve 'nodemailer'` during `npm run build` | Ensure `npm install` completed and `node_modules` exists. |
| Newsletter confirmation never arrives | Verify `MAILTRAP_*` credentials and confirm the inbox is active. |
| Supabase calls fail during `next build` | Provide environment variables in the build environment or guard `generateStaticParams` calls for offline builds. |
| Avatar uploads fail with `Unauthorized` | Confirm you are signed in and that Supabase `profiles` entry exists for the user. |

## 9. Next Steps

- Read [`docs/testing/README.md`](../testing/README.md) to configure Playwright for CI and local development.
- Explore [`docs/api/README.md`](../api/README.md) for endpoint contracts used by the front-end and partner integrations.
- Update this guide when adding new environment variables, scripts, or onboarding steps.
