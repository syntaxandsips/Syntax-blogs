# Gamification Analytics Baseline

This document captures the baseline metrics gathered before launching the Syntax & Sips gamification experience.

## 1. Engagement Signals Instrumented
- Page views and read time sourced from existing post analytics (`posts.views`).
- Comment submissions, approvals, and replies from the moderation queue.
- Newsletter signups, onboarding completion, and resource downloads via existing Supabase tables.

## 2. KPIs to Track Post-Launch
1. **Repeat sessions** – % of authenticated profiles returning within 7 and 30 days.
2. **Comment depth** – Average number of replies per approved comment.
3. **Onboarding completion rate** – Completion percentage within the first 48 hours.
4. **Content output** – Weekly count of published posts and drafts moved forward.
5. **Moderation participation** – Actions taken by elevated roles (approvals, flags, edits).

## 3. Reporting Cadence
- Daily monitoring dashboard for XP anomalies and streak resets.
- Weekly leadership summary comparing control vs. beta cohorts.
- Monthly deep dive into badge completion funnels and challenge participation.

## 4. Data Privacy Notes
- Aggregated reports only expose anonymised IDs.
- Export scripts respect opt-out settings stored in `gamification_profiles.settings`.
- Materialized views refresh every 30 minutes during beta; hourly afterwards.

---
Update this baseline after each season to maintain a reliable comparison set for A/B testing and retention analysis.
