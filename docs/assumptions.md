# Assumptions Log

| ID | Date | Assumption | Rationale | Status |
| --- | --- | --- | --- | --- |
| A-001 | 2025-02-14 | Supabase remains primary system of record for auth, content, and new community modules. | Existing stack deeply integrated with Supabase; changing would violate no-rewrite mandate. | Open |
| A-002 | 2025-02-14 | Feature flag service will initially leverage Supabase table until/if external vendor approved. | Fastest path to ship Phase 1 with governance; revisit if performance issues. | Open |
| A-003 | 2025-02-14 | Stripe will be available for USD payments; Razorpay/UPI added for India-specific flows. | Aligns with existing geography of stakeholders; ensures compliance for donations. | Open |
| A-004 | 2025-02-14 | Existing design system (neo-brutalism) can be extended with new tokens without full redesign. | Maintains consistency and meets "no big-bang" requirement. | Open |
| A-005 | 2025-02-14 | Email infrastructure (Mailtrap/SMPP) can scale to handle notification digests until dedicated ESP integrated. | Adequate for pilot; revisit when notifications GA. | Open |
| A-006 | 2025-02-14 | Supabase Storage is sufficient for workshop materials initially; CDN integration optional later. | Keeps complexity low during MVP; monitor bandwidth usage. | Open |
| A-007 | 2025-02-14 | Observability vendor (Grafana Cloud/Honeycomb) budget approved for Phase 1. | Required to meet telemetry commitments. | Open |
| A-008 | 2025-02-14 | Legal/compliance resources available before Phase 3 commerce rollout. | Necessary for payments, KYC, events. | Open |
| A-009 | 2025-10-24 | Design Lead owns `nav_ia_v1` rollout and SRE Lead owns `observability_v1` feature flag. | Owners not specified in release plan source; assigned to align with product area leads for accountability. | Open |
| A-010 | 2025-10-31 | `space_membership_status` enum values (`active`, `invited`, `suspended`) are sufficient for Phase-1 moderation workflows. | SEC-001 scope only requires basic lifecycle states; additional states can be added with reversible migrations later. | Open |
| A-011 | 2025-10-31 | Dashboard identifiers `dash_exec_kpi_v1` and `dash_ops_rbac_v1` will be provisioned by analytics; used as placeholders for documentation until Grafana workspace ready. | No IDs provided in spec; chosen to unblock observability references and can be updated post-provisioning. | Open |
