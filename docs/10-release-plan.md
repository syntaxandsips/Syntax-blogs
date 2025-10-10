# Release Plan

## 1. Feature Flags
| Flag Key | Purpose | Default | Owner | Notes |
| --- | --- | --- | --- | --- |
| `rbac_hardening_v1` | Harden Supabase role matrix and gate admin role manager | OFF | Security Lead | Enable before opening spaces_v1 pilot; required for SEC-001 sign-off |
| `spaces_v1` | Enables space creation, rules, membership | OFF | Product Lead | Phase 2 pilot with selected communities |
| `content_templates_v1` | Activates new editors/templates | OFF | Content PM | Depends on `spaces_v1` |
| `search_unified_v1` | Turns on new taxonomy/search service | OFF | Search PM | Requires index backfill |
| `reputation_v1` | Enables reputation events & privilege ladder | OFF | Community PM | Gate moderation tools |
| `moderation_automation_v1` | Automod + sanctions workflows | OFF | Safety Lead | Requires `reputation_v1` |
| `donations_v1` | Donations & pledges | OFF | Commerce PM | Sandbox + compliance gate |
| `payouts_v1` | Creator payouts | OFF | Finance Lead | Requires `donations_v1` |
| `events_v1` | Events/workshops modules | OFF | Events PM | Tied to `donations_v1` for paid events |
| `messaging_v1` | Threaded comments & DMs | OFF | Community PM | Monitor abuse metrics |
| `notifications_v1` | New notification center & webhooks | OFF | Platform PM | Roll out after events/donations |

> Governance update (GOV-000): Supabase-backed feature flag service, admin console manager, and audit trail shipped. All launch flags remain OFF by default until phase gates clear; toggles recorded in `feature_flag_audit`.

## 2. Rollout Strategy
1. **Development:** Feature branches merged behind flags with tests and telemetry.
2. **Internal Alpha:** Enable flags for staff accounts only; collect feedback, validate instrumentation.
3. **Pilot Spaces:** Expand to 3–5 curated spaces with support coverage; monitor KPIs daily.
4. **Staged GA:** Gradually enable for additional spaces/regions; communicate in product changelog & newsletters.
5. **Global GA:** Once KPIs stable and no critical issues for 2 weeks, set flag default to ON and remove gating once adoption complete.

## 3. Release Cadence
- Bi-weekly releases with change review meeting every Tuesday.
- Release train includes code freeze 24h before deployment, smoke tests, and observability verification.
- Emergency hotfix path documented for severity-1 issues (rollback via Vercel + Supabase migration revert).

## 4. Deployment Checklist
- ✅ CI pipeline green (lint, test, type-check, e2e, coverage).
- ✅ Feature flag configs reviewed and updated in admin console.
- ✅ Migrations applied in staging and validated with canary data.
- ✅ Telemetry dashboards checked for baseline and anomaly detection configured.
- ✅ Documentation updated (`/docs`, changelog, release notes).
- ✅ Support & community teams briefed with FAQs.

## 5. Canary & Monitoring
- Deploy to staging -> enable flags for canary users.
- Monitor metrics for 24h: publish latency, search P95, donation success, moderation queue age.
- Use synthetic journeys (Playwright) to validate critical flows.
- Confirm no spikes in errors/logs; review Supabase performance dashboards.

## 6. Rollback Procedures
- **Feature-level:** Toggle flag OFF, clear caches, notify stakeholders.
- **Database-level:** Execute down migration scripts; for irreversible data changes, restore from Supabase point-in-time recovery.
- **Payments:** Pause webhook processing via provider dashboard, ensure escrow funds safe.
- **Events:** Notify attendees of postponement if event module impacted.

## 7. Communication
- Publish release notes in `/docs/changelog` and `src/app/changelog` route.
- Send email digest to affected space organizers when new modules enable.
- Maintain incident communication templates for support team (in `/docs/operations/communications/`).

## 8. Compliance & Approvals
- Security review required before toggling `moderation_automation_v1`, `donations_v1`, `payouts_v1`.
- Legal approval before enabling commerce in new geographies.
- Finance sign-off on fee structures and payout schedules.
- Accessibility review sign-off before GA for any UX-heavy module.

## 9. Post-Release Activities
- Track KPI deltas for 14 days; report to leadership.
- Capture customer feedback and triage into backlog.
- Schedule retrospective covering what went well, challenges, follow-up actions.
- Update `/docs/risk-register.md` with any realized risks and mitigation outcomes.
