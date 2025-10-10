# ADR-0003: RBAC Hardening and Role Hierarchy

Status: Accepted

Context: Phase 1 SEC-001 requires expanding Supabase RBAC beyond the legacy admin/editor/author set so that the global member → contributor → organizer → moderator → admin ladder can govern upcoming Spaces and moderation features. Legacy slugs existed in data (`profile_roles`, `profiles.is_admin`) and RLS policies referenced outdated roles, creating risk for privilege drift. We also need telemetry around authorization denials and a way to gate the refreshed role manager behind a feature flag.

Decision: Update Supabase `roles` and `profile_roles` with canonical slugs (member, contributor, organizer, moderator, admin), migrate existing author/editor assignments, and refresh helper functions/triggers to compute highest roles and keep `profiles.is_admin` in sync. Rebuild key RLS policies (posts, taxonomy, community author program) to leverage the new ladder and add the `rbac_hardening_v1` feature flag. On the app side, gate the admin User Management view behind the new flag, expose highest-role badges, normalize role slug requests, and emit `authz_denied_count` telemetry for admin/community endpoints.

Consequences: Spaces and moderation work can rely on consistent role semantics and telemetry. Admins retain control via flag gating. Legacy clients sending `editor`/`author` slugs are transparently mapped. Service-role blast radius shrinks as more requests run under RLS. We must continue to monitor `authz_denied_count` and expand Playwright/admin journeys before enabling the flag beyond internal users.

Alternatives: (1) Defer RBAC changes until Spaces GA—rejected because subsequent tickets (MOD-001, CNT-020) depend on role consistency. (2) Introduce a separate site_roles enum table instead of reusing `roles`—rejected to avoid duplicating governance and migrations already anchored to existing tables.

Links: GOV-000 groundwork, SEC-001 backlog entry, PR #TBD, `/docs/07-security-privacy.md`, `/docs/06-data-model-delta.md`.
