# Data Model Delta

## 1. New Tables & Entities
| Table | Purpose | Key Columns | Notes |
| --- | --- | --- | --- |
| `spaces` | Defines communities with branding and governance metadata | `id`, `slug`, `name`, `description`, `visibility`, `rules`, `created_by`, `feature_flags`, `created_at`, `updated_at` | `slug` unique; `feature_flags` JSONB for space-level toggles |
| `space_members` | Maps users to spaces with roles and status | `space_id`, `profile_id`, `role`, `status`, `invited_by`, `joined_at`, `last_active_at` | Composite PK (`space_id`, `profile_id`); status enum (pending, active, banned) |
| `space_rules` | Structured rules/flairs/templates | `id`, `space_id`, `type`, `value`, `position` | `type` enum (rule, flair, template, automod) |
| `post_templates` | Stores reusable template metadata | `id`, `space_id`, `content_type`, `title`, `body`, `config` | `config` JSONB for form fields, required sections |
| `post_versions` | Version history for posts | `id`, `post_id`, `version_number`, `content`, `metadata`, `created_by`, `created_at` | Add `content` as JSONB to support editor structure |
| `questions` | Extends posts for Q&A | `post_id`, `accepted_answer_id`, `bounty_amount`, `bounty_currency`, `bounty_expires_at` | `post_id` FK to `posts`; `accepted_answer_id` references `answers` table |
| `answers` | Stores answers for Q&A posts | `id`, `question_id`, `body`, `author_id`, `is_accepted`, `created_at`, `updated_at` | Add index on (`question_id`, `is_accepted`) |
| `comments` (update) | Support threading & mentions | Add columns: `parent_id`, `thread_root_id`, `mentions`, `path` | `path` materialized for ordering; `mentions` array |
| `tag_synonyms` | Manage tag merges/synonyms | `id`, `tag_id`, `synonym_tag_id`, `status`, `created_by` | Unique index on (`tag_id`, `synonym_tag_id`) |
| `topic_pages` | Curated pages per tag | `tag_id`, `layout`, `hero_content`, `featured_ids` | `featured_ids` JSONB referencing posts/events |
| `reputation_events` | Track XP earning | `id`, `profile_id`, `space_id`, `event_type`, `points`, `metadata`, `created_at` | Index on (`profile_id`, `space_id`, `created_at`) |
| `reputation_aggregates` | Denormalized totals | `profile_id`, `space_id`, `total_points`, `decayed_points`, `last_decay_at` | Primary key (`profile_id`, `space_id`) |
| `privilege_thresholds` | Defines XP requirements | `id`, `space_id`, `action`, `required_points`, `created_at` | `action` enum aligned with privilege ladder |
| `reports` | Moderation reports | `id`, `target_type`, `target_id`, `reporter_id`, `reason`, `status`, `handled_by`, `handled_at`, `resolution_notes` | Partial indexes by `status` for queue performance |
| `automod_rules` | Per-space automation | `id`, `space_id`, `rule_type`, `config`, `enabled`, `created_at` | `rule_type` enum (rate_limit, first_post, banned_domain, trust_score) |
| `sanctions` | Records enforcement | `id`, `space_id`, `profile_id`, `type`, `reason`, `status`, `expires_at`, `created_by` | `type` enum (removal, quarantine, shadow_ban, space_ban, site_ban) |
| `audit_logs` | Immutable log for staff actions | `id`, `actor_id`, `actor_role`, `entity_type`, `entity_id`, `action`, `metadata`, `created_at` | Store hashed chain for immutability |
| `donations` | Monetary contributions | `id`, `profile_id`, `target_type`, `target_id`, `amount`, `currency`, `fee_amount`, `donor_covers_fees`, `is_recurring`, `status`, `receipt_url`, `created_at` | Index on (`target_type`, `target_id`) |
| `pledges` | Recurring commitments | `id`, `profile_id`, `target_type`, `target_id`, `interval`, `amount`, `currency`, `status`, `next_charge_at`, `cancelled_at` | |
| `payment_methods` | Tokenized payment references | `id`, `profile_id`, `provider`, `external_id`, `status`, `last4`, `expires_at` | PII encrypted at rest |
| `payout_accounts` | Creator payout info | `id`, `profile_id`, `provider`, `external_account_id`, `status`, `kyc_status`, `kyc_metadata`, `created_at` | |
| `payout_jobs` | Queue for payouts | `id`, `payout_account_id`, `amount`, `currency`, `status`, `attempts`, `last_error`, `scheduled_for`, `processed_at` | Index on `status` |
| `events` | Events metadata | `id`, `space_id`, `title`, `description`, `start_at`, `end_at`, `timezone`, `capacity`, `price`, `currency`, `venue`, `location`, `accessibility_notes`, `meeting_link`, `recording_url`, `status` | Spatial index if geolocation used |
| `event_tickets` | Tickets and attendance | `id`, `event_id`, `profile_id`, `ticket_type`, `price`, `currency`, `status`, `qr_code`, `checked_in_at`, `attended` | Partial index on (`event_id`, `status`) |
| `event_waitlist` | Waitlist entries | `id`, `event_id`, `profile_id`, `status`, `notified_at` | |
| `event_coupons` | Coupon codes | `id`, `event_id`, `code`, `discount_type`, `discount_value`, `max_redemptions`, `expires_at` | Unique index on (`event_id`, `code`) |
| `workshops` | Workshop definition | `id`, `space_id`, `title`, `description`, `curriculum`, `prerequisites`, `materials_url`, `status` | |
| `workshop_sessions` | Session schedule | `id`, `workshop_id`, `session_number`, `start_at`, `end_at`, `location`, `meeting_link` | |
| `workshop_enrollments` | Enrollment tracking | `id`, `workshop_id`, `profile_id`, `status`, `progress`, `feedback_score`, `completed_at` | |
| `materials` | Files/links locker | `id`, `owner_type`, `owner_id`, `title`, `description`, `storage_path`, `visibility` | |
| `assignments` | Workshop assignments | `id`, `workshop_id`, `title`, `description`, `due_at`, `rubric` | |
| `assignment_submissions` | Submissions & feedback | `id`, `assignment_id`, `profile_id`, `submission_url`, `status`, `grade`, `feedback`, `submitted_at`, `reviewed_at` | |
| `bounties` | Escrow details | `id`, `target_type`, `target_id`, `sponsor_id`, `amount`, `currency`, `status`, `expires_at`, `dispute_status` | |
| `bounty_transactions` | Escrow ledger | `id`, `bounty_id`, `transaction_type`, `amount`, `currency`, `reference`, `processed_at` | |
| `notifications` | In-app notifications | `id`, `profile_id`, `type`, `payload`, `channel`, `delivery_status`, `created_at`, `read_at` | |
| `notification_preferences` | Subscription matrix | `id`, `profile_id`, `space_id`, `content_type`, `channel`, `preference`, `updated_at` | Composite unique key |
| `webhooks` | External integrations | `id`, `space_id`, `target_url`, `event_types`, `secret`, `status`, `last_delivery_at` | |
| `webhook_deliveries` | Delivery logs | `id`, `webhook_id`, `payload`, `status`, `attempts`, `response_code`, `sent_at` | |
| `direct_messages` | DM threads | `id`, `initiator_id`, `recipient_id`, `status`, `created_at`, `last_message_at` | |
| `direct_message_messages` | DM content | `id`, `thread_id`, `sender_id`, `body`, `attachments`, `status`, `created_at`, `read_at` | |
| `feature_flag_audit` | Track flag changes | `id`, `flag_key`, `actor_id`, `change_type`, `payload`, `created_at` | |

## 2. Index & Constraint Strategy
- Enforce foreign keys between new tables and existing `profiles`, `posts`, `tags` to maintain referential integrity.
- Add unique constraints for slugs (`spaces.slug`, `events.slug` if introduced) and composite keys where appropriate.
- Implement partial indexes for queue-heavy tables (`reports`, `payout_jobs`, `notifications`) filtering by status to speed up dashboards.
- Use `btree_gin` indexes on JSONB columns for searching `feature_flags`, `config`, and `payload` data.
- Leverage Supabase Row Level Security policies aligned with `/docs/07-security-privacy.md` to protect each table.

## 3. Data Retention & Privacy
- **Audit & Moderation Logs:** Retain indefinitely with immutable hash chain; provide export for legal review.
- **Reputation Events:** Retain raw events 24 months; aggregate older data into monthly summaries.
- **Donations & Payments:** Retain financial records per jurisdiction (min 7 years); mask PII with encryption at rest and rotate keys annually.
- **Messaging:** Allow users to delete direct messages; maintain tombstones for abuse investigations with 12-month retention.
- **Events/Workshops:** Keep attendance logs for 24 months; anonymize after retention period.
- **Webhooks:** Store delivery payloads for 30 days for debugging, then purge.

## 4. Migration Approach
1. **Feature-flag gated migrations:** Introduce new tables with `enabled` flags default false; ensure down migrations exist.
2. **Backfill Strategy:** Use Supabase functions or background workers to populate new tables (e.g., `reputation_aggregates`) with resume tokens.
3. **Incremental rollout:** Deploy schema changes in small batches (spaces, then content, then commerce) to minimize lock times.
4. **Testing:** Integration tests validating RLS and referential integrity must run in CI before enabling flags.
5. **Monitoring:** Instrument migrations with telemetry (start/end timestamps, row counts, error events) feeding dashboards.

## 5. Open Data Questions
- Confirm whether to reuse existing `posts` table for projects/events or create specialized tables with foreign keys.
- Determine storage strategy for media-heavy workshop materials (Supabase Storage vs. external CDN).
- Align on currency handling for multi-region payouts (exchange rates, ledger accuracy).
