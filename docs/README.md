# Syntax & Sips Documentation Index

Welcome to the Syntax & Sips knowledge base. This index orients contributors to the supporting guides that complement the primary README. Each guide is version-controlled alongside the application so playbooks evolve with the product.

## Directory Map

| Area | File / Folder | Purpose |
| --- | --- | --- |
| Local setup | [`docs/setup/local-development.md`](./setup/local-development.md) | Install dependencies, configure Supabase, and run the app locally. |
| Testing | [`docs/testing/README.md`](./testing/README.md) | Configure Playwright, seed data, and interpret reports. |
| API reference | [`docs/api/README.md`](./api/README.md) | REST endpoints, request/response shapes, and authentication requirements. |
| Architecture & roadmaps | [`docs/ai-integration-roadmap.md`](./ai-integration-roadmap.md) | Upcoming integrations, sequencing, and milestones. |
| Gamification | [`docs/gamification-roadmap.md`](./gamification-roadmap.md) | XP, badges, and leaderboard planning. |
| Community programs | [`docs/community-author-program.md`](./community-author-program.md) | Contributor workflows and program governance. |
| Design system | [`neobrutalismthemecomp.MD`](../neobrutalismthemecomp.MD) | Visual language, components, and design tokens. |
| SEO & content strategy | [`docs/seo/`](./seo) | Search audits, content planning, and visibility improvements. |
| Code review guidelines | [`docs/code-review.md`](./code-review.md) | Architectural guardrails, component reuse, and performance advice. |
| Community launch | [`docs/promotion-plan.md`](./promotion-plan.md) | Promotion checklist and outreach tactics for public releases. |

## How to Use These Guides

1. **Start with setup:** Configure your environment before running scripts or tests.
2. **Read relevant playbooks:** Reference the guide that matches the feature or area you are updating.
3. **Keep documentation fresh:** When code paths change, update the affected guide in the same pull request.
4. **Cross-link resources:** Add backlinks between guides where workflows intersect (e.g., API routes that require Supabase migrations).
5. **Document decisions:** Capture rationale for architectural choices and migrations in these guides so the team retains shared context.

## Maintenance Workflow

- Review documentation in code review checklists; a feature is not complete until its docs reflect reality.
- Schedule quarterly audits to prune deprecated instructions and surface new learnings.
- Track documentation updates in the changelog under the "Changed" section for transparency.
- Encourage contributors to propose documentation issues via GitHub Discussions or Issues when gaps are discovered.

Happy shipping!
