-- =====================================================================
-- Revert MOD-001 audit indexes
-- =====================================================================

DROP INDEX IF EXISTS public.audit_logs_space_resource_idx;
DROP INDEX IF EXISTS public.audit_logs_space_entity_idx;

