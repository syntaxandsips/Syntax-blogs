# Observability Strategy

## 1. Objectives
- Provide end-to-end visibility of user journeys (content creation, moderation, commerce, events).
- Track key KPIs and SLOs defined in product spec and roadmap.
- Enable fast detection, triage, and resolution of incidents through alerting and runbooks.

## 2. Metrics Catalog
| Metric Key | Description | Type | Tags |
| --- | --- | --- | --- |
| `content_publish_latency_ms` | Time from publish request to confirmation | Histogram | `space`, `content_type`, `flag` |
| `draft_autosave_latency_ms` | Editor autosave performance | Histogram | `space`, `content_type` |
| `search_latency_ms` | Search query latency | Histogram | `query_type`, `result_count`, `flag` |
| `search_zero_result_rate` | % of searches with no results | Gauge | `query_type`, `space` |
| `donation_success_rate` | Successful donations / attempts | Gauge | `provider`, `currency`, `space` |
| `payout_error_rate` | Failed payouts / processed payouts | Gauge | `provider` |
| `event_rsvp_to_attendance_rate` | Attendance / RSVPs | Gauge | `event_type`, `space` |
| `moderation_queue_oldest_min` | Age of oldest open report | Gauge | `queue_type`, `space` |
| `crash_free_sessions` | % of sessions without fatal error | Gauge | `platform` |
| `authz_denied_count` | Authorization failures | Counter | `context`, `resource`, `role`, `space`, `reason` |
| `flag_evaluation_latency_ms` | Feature flag evaluation | Histogram | `flag_key` |
| `webhook_delivery_success_rate` | Webhook successes vs. attempts | Gauge | `event_type` |
| `automod_trigger_count` | Automod actions per rule | Counter | `rule_type`, `space` |

## 3. Tracing Strategy
- Instrument Next.js route handlers and server components with OpenTelemetry.
- Propagate trace context through Supabase client calls using custom instrumentation wrappers.
- Annotate spans with entity identifiers (`space_id`, `post_id`, `event_id`) and feature flag states.
- Capture async workflows (payout jobs, notification deliveries) via worker instrumentation.

## 4. Logging
- Structured JSON logs with fields: `timestamp`, `level`, `message`, `user_id`, `space_id`, `request_id`, `feature_flags`.
- Redact PII (emails, payment tokens) and use hashing for user IDs when possible.
- Centralize logs via Logflare or OpenTelemetry Collector; set retention 30 days (longer for audit logs stored in DB).

## 5. Dashboards
- **Executive KPI Dashboard:** Aggregates content latency, search performance, donation success, RSVP-to-attendance, crash-free sessions.
- **Operations Dashboard:** Displays moderation queue age, automod triggers, authz failures, feature flag adoption.
- **Commerce Dashboard:** Shows donation funnel, payout queue status, dispute rate.
- **Events Dashboard:** Tracks registrations, attendance, revenue, NPS survey results.
- **Reliability Dashboard:** SLO status, error budgets, incident history.

## 6. Alerting Policies
| Alert | Condition | Threshold | Channel |
| --- | --- | --- | --- |
| Publish latency high | `content_publish_latency_ms` P95 > 10s for 5m | Critical | PagerDuty → Engineering On-call |
| Search latency regression | `search_latency_ms` P95 > 1s for 10m | Warning | Slack #search |
| Donation failures spike | `donation_success_rate` < 90% for 15m | Critical | PagerDuty + Finance Slack |
| Payout errors rising | `payout_error_rate` > 2% for 30m | Critical | PagerDuty + Payments distro |
| Moderation backlog | `moderation_queue_oldest_min` > 60 | Warning | Slack #safety |
| Crash-free drop | `crash_free_sessions` < 97% daily | Warning | Slack #frontend |
| Webhook delivery failures | `webhook_delivery_success_rate` < 95% for 30m | Warning | Slack #integrations |

## 7. SLOs & Error Budgets
| Service | SLO | Error Budget |
| --- | --- | --- |
| Content publishing | 99.5% of publishes < 5s | 3m per day |
| Search service | 99% of queries < 800ms | 7.2m per 12h |
| Donations API | 99.2% success | 0.8% failure allowance |
| Payout processing | 99% jobs succeed within 1h | 1% failure/timeout |
| Notifications | 99% delivered within 2m | 1% delayed |

## 8. Tooling & Implementation
- Adopt OpenTelemetry SDK for Next.js + Node workers; export to vendor (e.g., Grafana Cloud, Honeycomb).
- Use Supabase Logflare integration for SQL audit, complement with custom metrics via functions.
- Configure synthetic monitoring (Pingdom/Lighthouse CI) for home feed, space page, checkout flow.
- Add Playwright synthetic tests for core user journeys with metrics logging.
- Ship interim Node-side metrics adapter that records `flag_evaluation_latency_ms` for every feature flag lookup; upgrade to OTEL exporters during `OBS-100`.

## 9. Runbooks
- Create `/docs/operations/runbooks/` with scenario-specific guides (publish latency, payment failures, search outage).
- Each runbook includes detection signals, immediate actions, rollback instructions, communication templates.
- Link runbooks from dashboards for quick access.

## 10. Data Quality & Telemetry Governance
- Establish metric naming conventions (`domain_metric_unit`), tag cardinality guidelines, and sampling rules.
- Automate schema checks for telemetry payloads in CI.
- Schedule quarterly telemetry reviews to prune stale metrics and adjust alert thresholds.
