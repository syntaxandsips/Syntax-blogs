# Supabase Operations Notes

- Run `supabase db dump --data-only --file backups/pre-gamification.sql` before applying migration `0012_add_gamification_tables.sql`.
- After migrations, seed default gamification data via `supabase db seed` using the new entries baked into the migration.
- Schedule nightly dumps of gamification tables and store them encrypted in the standard S3 bucket.
- Rotate the service role key used for gamification admin endpoints every 90 days.
