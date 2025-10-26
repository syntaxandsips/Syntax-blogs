# Runbook: Space Onboarding Failures

_Last updated: 2025-11-07_

## Purpose
Spaces v1 introduces space creation, membership approval, and rule governance behind the `spaces_v1` feature flag. This runbook covers how to triage and resolve failures when organizers cannot create spaces or when membership requests stall.

## Preconditions
- `spaces_v1` enabled for the current environment.
- Supabase migrations `0022_spaces_core.sql` and `0023_space_audit.sql` applied successfully.
- Operations dashboard panels `dash_ops_rbac_v1` (authz denials) and `dash_ops_nav_v1` (nav interactions) reachable.

## Detection
1. **Alert:** `pd-sec-ops::space_creation_drop` fires when `space_creation_success_rate` falls below 95% over 15 minutes.
2. **Support Ticket:** Organizers report 4xx errors from `/api/spaces` or members see stale "Request pending" messages.
3. **Dashboard Signal:** `space_join_approval_latency_ms` histogram shows sustained latency > 5 minutes.

## Immediate Actions
1. **Confirm Feature Flag**
   ```sql
   select flag_key, enabled from public.feature_flags where flag_key = 'spaces_v1';
   ```
   - If `enabled=false`, toggle for staff cohort only via admin console; document reason in `feature_flag_audit`.
2. **Check Audit Logs**
   ```sql
   select created_at, actor_role, action, metadata
   from public.audit_logs
   where resource in ('space', 'space_membership')
   order by created_at desc limit 20;
   ```
   - Missing entries suggest API guard failures; inspect application logs for `requireRole`/`requireSpaceRole` errors.
3. **Validate Policies**
   ```sql
   select *
   from pg_policies
   where tablename in ('spaces', 'space_members')
   order by tablename, policyname;
   ```
   - Ensure `Members request access` exists; if missing, re-run migration `0022_spaces_core.sql`.
4. **Review Telemetry**
   - `authz_denied_count{resource="space"}` spikes indicate guard denials; inspect tags for `reason` (`no_session`, `inactive_membership`, etc.).
   - `space_join_approval_latency_ms` > target implies organizer backlog; confirm moderators are online.

## Remediation Steps
- **Creation Failing with 5xx:**
  - Check Supabase RPC quota; ensure `feature_flags` default metadata is valid JSON.
  - Confirm `requireRole` returns `organizer` or higher. Grant temporary organizer role via Role Manager UI if necessary.
- **Join Requests Stuck Pending:**
  - Ensure `space_members.role_slug` trigger active. Recreate trigger with:
    ```sql
    call public.space_members_set_role_slug();
    ```
  - Verify organizers receive notifications; check nav interaction logs for `/spaces` traffic.
- **Audit Entries Missing:**
  - Re-deploy `/api/spaces` routes; confirm `writeAuditLog` calls succeed (service key valid).

## Escalation
- If Supabase schema drift detected, page Database On-Call and prepare PITR window.
- For repeated authz denials > 10/min, escalate to Security Lead; consider temporarily disabling `spaces_v1`.

## Verification
- Create test space (`spaces_v1` staging cohort) and complete join→approve flow using staff accounts.
- Confirm `space_creation_success_rate` returns above 99% and new audit rows appear with `resource='space_membership'`.
- Run Playwright smoke for Space Shell (when available) to validate accessibility checks.

## Postmortem Notes
- Document root cause, mitigation, and follow-up tasks in `/docs/progress/weekly-YYYY-MM-DD.md` and backlog.
- Evaluate whether additional alerts or dashboards are required (e.g., backlog of pending members per space).
