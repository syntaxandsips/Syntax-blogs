# Gamification Data Retention Plan

| Dataset | Retention Policy | Disposal Method |
| --- | --- | --- |
| `gamification_actions` | Rolling 18 months | Automated cron deletes rows older than 18 months and writes audit entry |
| `leaderboard_snapshots` | 90 days | Weekly purge job removes expired scopes |
| `profile_challenge_progress` | Lifecycle of challenge | Records archived when challenge ends, optionally anonymised |
| `gamification_audit` | 3 years | Export for compliance before deletion |
| `gamification_profiles` | Duration of profile | Cascades on profile deletion; manual removal supported |

Backups occur nightly and prior to each migration. Restore plan documented in `supabase/README.md`.
