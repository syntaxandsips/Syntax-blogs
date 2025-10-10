# Test Strategy

## 1. Objectives
- Ensure every new module (Spaces, Content, Commerce, Events, Moderation) ships with automated coverage and feature flag validation.
- Catch regressions in authz, data integrity, and UX flows before production.
- Provide confidence for staged rollouts and rollback readiness.

## 2. Test Pyramid
| Layer | Scope | Tools | Coverage Target |
| --- | --- | --- | --- |
| Unit | Pure functions, hooks, utilities | Vitest, Testing Library | ≥80% per module |
| Integration | API routes, Supabase interactions, feature flag toggles | Vitest + Supabase test client, MSW | ≥70% critical flows |
| End-to-End | User journeys across flags (Spaces creation, publish, moderation, donations, events) | Playwright | 20 high-priority journeys |
| Performance | Publish latency, search P95, donation throughput | k6 or Artillery + telemetry verification | Run per release |
| Accessibility | Axe scans, keyboard navigation | Playwright + @axe-core/playwright | 100% of new flows |

## 3. Environments
- **Local:** Developer runs `npm run lint`, `npm run test`, `npm run type-check`, and `npm run test:e2e` (CI-mode) before pushing.
- **CI:** GitHub Actions pipeline executes lint, type-check, unit/integration tests, Playwright headless smoke, coverage reports, and uploads artifacts.
- **Staging:** Feature flags toggled for pilot spaces; synthetic monitoring runs nightly.

## 4. Test Data Management
- Seed Supabase test database with fixtures for spaces, profiles, tags, payments using migrations + seed scripts.
- Use factories for generating domain objects (e.g., `createSpace`, `createDonation`).
- Ensure anonymized datasets for replaying production scenarios.

## 5. Automation Requirements
- Add pre-commit hooks for lint/type-check (Husky optional) to catch issues early.
- Configure coverage thresholds (`vitest --coverage`) failing build if below 80%.
- Integrate Playwright with trace/screenshot retention for debugging.
- Add contract tests for third-party APIs (payments, conferencing) using sandbox credentials.

## 6. Feature Flag Testing
- Tests must run with flags ON and OFF to ensure fallback behavior.
- Provide helper to set flag context in tests (`withFeatureFlag('spaces_v1', true)`).
- CI includes matrix builds for critical flags (Spaces, Commerce, Events).
- Added Vitest coverage for the feature flag SDK (caching, invalidation, telemetry) as part of GOV-000; extend coverage to admin API routes in upcoming iterations.
- SEC-001 adds Vitest coverage for role slug normalization and observability counters, plus a Supabase RBAC harness (`tests/security/rbac-policies.test.ts`) that runs when credentials are provided.

## 7. Performance & Load
- Baseline load test for publish, search, donations, and event checkout before GA.
- Automate nightly light-load test to detect regressions using k6 with telemetry ingestion.
- Record results in `/docs/testing/performance-reports/`.

## 8. Accessibility & UX
- Run Playwright axe checks on core pages (home, space, article editor, Q&A, donations, event checkout).
- Queue Accessibility scan for the Feature Flag Manager once Playwright admin journeys are wired (tracks in GOV-000 follow-up).
- Manual keyboard walkthrough sign-off required before enabling flag for GA.
- Capture screenshots of empty/loading/error states for QA reference.

## 9. Manual Testing & Exploratory Sessions
- Conduct bug bashes at end of each phase with cross-functional participation.
- Maintain exploratory test charters in `/docs/testing/exploratory/`.

## 10. Reporting & Governance
- CI publishes coverage and test summaries to Slack/Teams.
- Track flaky tests; auto quarantine with owner assignment and SLA for fix.
- Maintain `testing/README.md` with updated commands and troubleshooting steps.
