# Testing Playbook

This playbook captures how Syntax & Sips validates quality across environments. It currently focuses on Playwright-based end-to-end coverage and outlines how to extend into unit and integration tests.

## 1. Test Matrix

| Layer | Tool | Status | Notes |
| --- | --- | --- | --- |
| End-to-end | Playwright (`@playwright/test`) | Configured | Suites live in `tests/*.spec.ts`. |
| Component / unit | Vitest (planned) | Pending | Add when component coverage is required. |
| Accessibility | Axe / Playwright | Pending | Integrate via Playwright fixtures once UI stabilises. |
| Performance | Web Vitals logging | Partial | Metrics emitted via `src/lib/analytics/report-web-vitals.ts`. |

## 2. Environment Preparation

1. Install dependencies: `npm install`.
2. Install browsers: `npx playwright install` (run once per machine or CI agent).
3. Provide Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Seed baseline content using `supabase db push` or import fixtures through the admin UI.
5. Configure newsletter SMTP credentials if tests exercise subscription flows (`MAILTRAP_*`).

## 3. Running the Suite

| Command | Purpose |
| --- | --- |
| `npm run test` | Execute the Playwright suite headlessly (CI default). |
| `npm run test:ui` | Launch the Playwright UI runner for interactive debugging. |
| `npm run test:headed` | Run in headed mode with a visible browser window. |

Tests default to Chromium. Override via `npx playwright test --project=firefox` if cross-browser validation is required.

## 4. Test Data & Auth

- Use Supabase policies to create dedicated test users and flag them with non-production roles.
- When running locally, sign in once in the UI; Playwright preserves authenticated state in `tests/.auth` (configure via fixtures as needed).
- Reset state between runs using Playwright hooks (`test.beforeEach`) or Supabase `db reset` commands.

## 5. Reporting & Diagnostics

- Enable traces in CI by exporting `PLAYWRIGHT_JUNIT_OUTPUT_NAME` or using the `--reporter=line,junit` flag.
- Store HTML reports with `npx playwright show-report` after a run.
- Document failures and resolutions in [`tests/build-verification.md`](../build-verification.md) for historical context.

## 6. Adding New Tests

1. Co-locate specs in `tests/` with descriptive filenames (`feature-name.spec.ts`).
2. Prefer `test.step` blocks to clarify multi-stage flows.
3. Wrap network-dependent logic with retries and provide deterministic fixtures for Supabase responses when possible.
4. Gate expensive journeys (e.g., newsletter flow) behind tagged tests: `test.describe.configure({ mode: 'serial' })` for stateful flows.

## 7. Extending Coverage

- **Unit tests:** Introduce Vitest alongside Testing Library for UI components. Mirror docs in this playbook when the stack is finalised.
- **Accessibility:** Add `@axe-core/playwright` to capture WCAG regressions as part of nightly runs.
- **Performance:** Capture Core Web Vitals through `sendToAnalytics` and alert when values regress. (`src/lib/analytics/report-web-vitals.ts`)

## 8. CI Integration

- Run `npm run lint`, `npm run test`, and `npm run build` in pull request workflows.
- Cache `~/.cache/ms-playwright` to speed up Playwright browser installation on CI.
- Fail the pipeline if Playwright exits non-zero; upload traces and screenshots as build artifacts for debugging.

## 9. Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `Error: useSignInWithEmail` cannot reach Supabase | Ensure environment variables are present in `process.env` for the Playwright run. |
| Tests hang on newsletter confirmation | Seed Mailtrap inbox credentials and allow outbound SMTP or stub the transport layer. |
| `page.goto` times out | Increase `test.setTimeout` for data-heavy pages or warm the database with fixtures. |
| CI fails due to missing browsers | Run `npx playwright install --with-deps` during pipeline setup. |

Keep this playbook current by documenting new fixtures, utilities, or CI conventions as they are introduced.
