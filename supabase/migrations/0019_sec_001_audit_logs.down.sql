-- =====================================================================
-- DOWN: Remove audit logs table introduced for SEC-001
-- =====================================================================

DROP TABLE IF EXISTS public.audit_logs;
