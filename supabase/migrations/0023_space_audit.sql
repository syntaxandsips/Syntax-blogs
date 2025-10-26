-- =====================================================================
-- MOD-001: audit indexes for space governance
-- =====================================================================

CREATE INDEX IF NOT EXISTS audit_logs_space_resource_idx
  ON public.audit_logs(resource, created_at DESC)
  WHERE resource LIKE 'space%';

CREATE INDEX IF NOT EXISTS audit_logs_space_entity_idx
  ON public.audit_logs(entity_id, created_at DESC)
  WHERE resource LIKE 'space%';

