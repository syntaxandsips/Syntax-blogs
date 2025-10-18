# Runbook: RLS Denial Spike

**Last updated:** 2025-10-31

## 1. Detection
- Alert `pd-sec-ops::rbac_denials_spike` triggers when `authz_denied_count` > 25/min tagged `resource=admin_users` or `resource=spaces`.
- Operations dashboard panel `dash_ops_rbac_v1 :: RBAC Denials` shows trend by `resource`, `role`, `space` tags.
- Synthetic check `observability synthetic journeys › admin flag console guard surfaces login` failing may indicate lockout.

## 2. Immediate Actions
1. Confirm the spike in Grafana panel and correlate to recent deployments/flag toggles.
2. Query Supabase audit logs:
   ```sql
   select created_at, actor_role, action, reason, metadata
   from audit_logs
   where resource = 'admin_users'
     and created_at > now() - interval '1 hour'
   order by created_at desc;
   ```
3. Validate helper function output for affected profiles:
   ```sql
   select highest_role_slug('<profile-id>'::uuid);
   ```
4. Check feature flag history for `rbac_hardening_v1` and related nav flags in `/admin/feature-flags` (audit entries are stored in `feature_flag_audit`).

## 3. Mitigation
- If regression tied to new policies, toggle `rbac_hardening_v1` OFF for all but security staff.
- Re-run policy tests via `npm run test -- tests/security/rbac-policies.test.ts` in staging.
- If helper function bug, apply hotfix migration or revert via `supabase/migrations/0020_sec_001_rls_policies.down.sql` followed by redeploy.
- For false positives (expected denials), adjust alert threshold temporarily via Grafana annotations and document rationale.

## 4. Communication
- Update #ops-telemetry Slack channel with incident timeline and current mitigation steps.
- If admin access degraded for staff, notify affected cohorts and provide estimated resolution time.
- Log incident in `/docs/operations/incidents/YYYY-MM-DD-<summary>.md` once stabilized.

## 5. Recovery & Verification
- After mitigation, re-enable `rbac_hardening_v1` for staff cohort and monitor `authz_denied_count` for 30 minutes.
- Ensure Playwright synthetic journeys pass in CI (`tests/synthetic/observability.spec.ts`).
- Capture metrics snapshot and attach to incident record.

## 6. Postmortem Checklist
- Identify root cause (policy regression, role sync failure, guard bug).
- Add automated test coverage if gap discovered.
- Update documentation and backlog items if new work required.
- Close incident with summary and action items in weekly progress log.
