# Contributing to Syntax & Sips

Thank you for your interest in improving Syntax & Sips! This guide documents how to propose changes, report issues, and collaborate with the maintainers. Following these practices keeps the project stable, inclusive, and enjoyable for everyone.

## Ground Rules

- **Follow the Code of Conduct.** Review the [Code of Conduct](CODE_OF_CONDUCT.md) and help us maintain a respectful, harassment-free community.
- **Stay transparent.** Discuss significant ideas through GitHub issues or discussions before investing extensive effort.
- **Document decisions.** Explain the motivation behind changes in pull requests and link to supporting discussions or issues.

## How to Get Help

- **Questions & feedback:** Start a thread in [GitHub Discussions](https://github.com/prashant-andani/Syntax-blogs/discussions).
- **Bug reports & feature ideas:** Open an issue using the provided templates—include context, reproduction steps, and impact.
- **Security concerns:** Email the maintainers at [security@syntax-sips.dev](mailto:security@syntax-sips.dev); do not open a public issue.

## Local Development Workflow

1. **Fork** the repository and clone your fork locally.
2. Create a topic branch from `main`: `git checkout -b feature/short-description`.
3. Install dependencies: `npm install`.
4. Configure environment variables following the [README instructions](README.md#-getting-started).
5. Run the development server with `npm run dev` and keep Vitest/Playwright tests handy during iteration.

## Coding Standards

- Use **TypeScript** with `strict` types; avoid `any`. Export shared interfaces from the relevant module.
- Favor **functional React components**. Mark interactive components with `'use client'` and keep server components pure.
- Apply **Tailwind CSS** utilities and respect the neobrutalism design system described in [`neobrutalismthemecomp.MD`](neobrutalismthemecomp.MD).
- Follow the repository's lint rules. Run `npm run lint` before submitting a pull request.
- Keep files focused. Extract helpers when modules exceed roughly 200 lines or mix concerns.

## Testing Expectations

- Unit and integration tests use **Vitest**. Add coverage for new functionality, edge cases, and regressions.
- UI interactions should rely on Testing Library helpers; avoid brittle implementation-specific selectors.
- End-to-end tests run through **Playwright** when modifying user flows or Supabase integrations.
- Before requesting review, run:
  - `npm run lint`
  - `npm run type-check`
  - `npm test`
  - Any additional domain-specific checks documented in `package.json` or `docs/`.

## Commit & Pull Request Guidelines

- Write commits using [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat(admin): add moderation queue`).
- Keep pull requests focused; large refactors should be broken into logical stages.
- Complete the [pull request template](.github/PULL_REQUEST_TEMPLATE.md) with testing evidence and screenshots for UI changes.
- Ensure CI workflows pass and address reviewer feedback promptly.

## Documentation Updates

- Update inline comments, README sections, and relevant guides under `docs/` when you alter behavior.
- Significant Supabase schema updates must include migration notes and operational instructions.
- Add runbook or troubleshooting tips when you introduce new infrastructure or automation.

## Release Readiness Checklist

Before requesting a review, confirm that:

- [ ] The change set is covered by automated tests or manual validation notes.
- [ ] Documentation (README, docs, comments) is current.
- [ ] Feature flags or configuration toggles default to safe values.
- [ ] You have confirmed accessibility for UI-impacting changes (keyboard navigation, screen readers, contrast).

Thanks again for contributing! Your collaboration helps us deliver an editorial platform the community can trust.
