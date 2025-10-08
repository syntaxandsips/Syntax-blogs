# Gamification DPIA & Compliance Summary

This document records the data protection impact assessment (DPIA) and privacy work completed prior to launching the Syntax & Sips gamification program.

## 1. Overview
- **Purpose**: Reward engaged community members with points, levels, badges, and unlockable privileges.
- **Scope**: Applies to profiles, engagement signals (posts, comments, onboarding journeys), and new gamification tables introduced in migration `0012_add_gamification_tables.sql`.
- **Legal basis**: Consent for optional gamification processing, legitimate interest for basic analytics.

## 2. Data Classification
| Data Category | Description | Retention | Safeguards |
| --- | --- | --- | --- |
| Engagement ledger | Per-action record for points and XP (`gamification_actions`) | 18 months rolling | RLS restricting access to owner + admins, audit log on manual edits |
| Profile progression | XP totals, levels, streaks (`gamification_profiles`) | Lifetime of account or until deletion request | Cascading deletes on profile removal, encryption at rest |
| Badges & challenges | Catalog metadata and user progress | Updated seasonally | Admin-only write access, time-bounded flags |
| Leaderboards | Aggregated positions cached in JSON | 90 days | Pseudonymised payloads, per-scope TTL |
| Audit log | Manual adjustments or escalations | 3 years | Admin-only access, immutable append-only table |

## 3. Risk Assessment
- **Profiling risk** *(medium)* – mitigated through opt-in toggle, clear descriptions in the privacy policy, and a settings control to opt out at any time.
- **Data minimisation** *(medium)* – event metadata is filtered to only store IDs and normalized categories; free-form user content is not persisted in gamification tables.
- **Children’s data** *(low)* – age gating added to sign-up requires confirmation that users are 13+ before profile creation; gamification is disabled until consent is received.
- **Cross-border transfers** *(low)* – Supabase data residency remains in the EU region; Upstash Redis is configured for the same region.

## 4. Controls Implemented
1. **Consent management** – Profile settings expose toggles for XP tracking, badge showcases, and notifications. Consent status is stored in `gamification_profiles.settings`.
2. **Audit logging** – Manual adjustments via the admin API automatically insert a row into `gamification_audit` with the actor ID and justification.
3. **Security reviews** – RLS policies restrict reads and writes; service-role functions handle privileged mutations; cron jobs run with service keys only.
4. **Data retention** – Scheduled job purges stale leaderboard snapshots older than 90 days and archived challenges at season end.
5. **Access requests** – `/api/gamification/profile` exposes export-ready JSON for user self-service download; deletion cascades remove gamification data with the profile.

## 5. Approvals & Review Cadence
- DPIA prepared by Product & Privacy (March 2025) and reviewed by Legal & Security.
- Quarterly review to re-evaluate risks as new badges or privileges are added.
- Incident response checklist updated to include gamification subsystems.

---
Maintained by the Syntax & Sips platform team. Update this file when gamification tables or processing logic change.
