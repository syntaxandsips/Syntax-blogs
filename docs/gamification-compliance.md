# Gamification DPIA & Compliance Checklist

This document summarises the foundational governance work completed for the Syntax & Sips gamification rollout.

## Data Protection Impact Assessment Summary

- **Purpose & scope:** The gamification system processes engagement signals (post views, comment approvals, onboarding completion, challenge participation) to award XP, badges, streaks, and roles. Personal data processed remains limited to existing `profiles` records plus opt-in preferences stored in `gamification_profiles.settings`.
- **Legal basis:** Community participation is governed by the Syntax & Sips Terms of Use; gamification is considered legitimate interest with an explicit opt-in toggle stored per profile (`gamification_profiles.opted_in`). Users can withdraw consent at any time via profile settings.
- **Data flows:** Events are written to `gamification_actions` with metadata, aggregated into `gamification_profiles`, and surfaced through Next.js API routes. Admin operations are logged to `gamification_audit` ensuring traceability.
- **Risk mitigation:**
  - Row level security policies restrict access to owners and admins for all gamification tables.
  - Audit triggers capture XP/level changes for incident investigation.
  - Consent toggle is enforced in the points engine before any XP is awarded.
  - Age gating reuses existing onboarding checks; under-13 profiles remain opted-out by default.

## Privacy Policy & Retention Notes

- **Privacy policy update:** Add a new section describing storage of progression data (XP totals, challenge history, badge ownership) and purpose of motivational feedback.
- **Retention:** Gamification actions are retained for 24 months for analytics before archival. Audit logs are retained for 36 months for compliance.
- **User controls:**
  - Opt-in/opt-out managed via `gamification_profiles.opted_in`.
  - Manual XP adjustments require admin justification recorded in `gamification_audit`.
  - Export requests can leverage the `leaderboard_snapshots` payload for quick fulfilment.

## Security Posture

- RLS policies implemented for every gamification table (see `supabase/migrations/0012_create_gamification_schema.sql`).
- Service role policies isolate write access for background jobs (`auth.role() = 'service_role'`).
- Cached leaderboard payloads respect TTL controls to prevent stale exposure.
- Admin APIs enforce authentication via `requireAdmin` helper to avoid privilege escalation.

## Monitoring & Alerting

- Badge/Challenge admin endpoints surface success messages and persist audit entries for manual adjustments.
- Leaderboard and analytics queries are cached (Upstash-ready) with hit/miss logging to `console` for early diagnostics.
- Future work: integrate with the existing observability stack to emit metrics for XP throughput, badge unlock rates, and challenge completion velocity.

## Accessibility & UX Guardrails

- All gamification UI components follow neobrutalist styling with large tap targets and WCAG-compliant contrast.
- Progress visuals expose textual summaries for assistive technologies.
- Admin workflows provide validation feedback and loading indicators to communicate long-running operations.

---

_Last updated: 2025-02-14_
