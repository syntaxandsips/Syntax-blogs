# Risk Register

| ID | Description | Impact | Likelihood | Owner | Mitigation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | Feature flag implementation delays block phased rollout | High | Medium | Engineering Lead | Prioritize GOV-000 ticket, allocate pairing time, validate in staging early | Open |
| R-002 | Supabase RLS misconfiguration exposes private spaces | Critical | Medium | Security Lead | Implement integration tests, conduct security review, enable audit logging | Mitigated (monitor) |
| R-003 | Payment provider onboarding stalled | High | Medium | Commerce PM | Start vendor diligence in Phase 1, prepare backup provider, maintain dark launch | Open |
| R-004 | Observability stack generates noisy alerts | Medium | Medium | SRE Lead | Define metric taxonomy, pilot thresholds with feature flags, iterate with runbooks | Open |
| R-005 | Accessibility regressions from new components | High | Medium | Design Lead | Enforce accessibility checklist, automated axe scans, manual QA before GA | Open |
| R-006 | Community abuse increases with messaging rollout | High | High | Safety Lead | Implement automod, rate limits, trust scores, moderation staffing | Open |
| R-007 | Payout compliance gaps trigger legal issues | Critical | Low | Finance Lead | Align with legal counsel, document SOPs, run sandbox audits before live | Open |
| R-008 | Data migrations cause downtime | High | Low | Database Engineer | Use phased migrations with reversible scripts, monitor metrics, schedule maintenance | Open |
| R-009 | Team bandwidth insufficient for simultaneous modules | Medium | Medium | Program Manager | Sequence backlog with dependencies, adjust staffing, negotiate scope | Open |
| R-010 | External APIs (Zoom/Meet) rate limit events | Medium | Low | Events PM | Cache links, monitor API usage, pre-generate invites, have fallback provider | Open |
