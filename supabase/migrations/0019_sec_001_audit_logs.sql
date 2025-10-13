-- =====================================================================
-- SEC-001: Core audit log table to support RBAC guard instrumentation
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role text NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  entity_id text,
  space_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON public.audit_logs(resource, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_space_idx ON public.audit_logs(space_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_logs'
      AND policyname = 'Service role manages audit logs'
  ) THEN
    DROP POLICY "Service role manages audit logs" ON public.audit_logs;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_logs'
      AND policyname = 'Admins read audit logs'
  ) THEN
    DROP POLICY "Admins read audit logs" ON public.audit_logs;
  END IF;
END;
$$;

CREATE POLICY "Service role manages audit logs"
  ON public.audit_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins read audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.user_has_role_or_higher('admin'));

COMMENT ON TABLE public.audit_logs IS 'Immutable audit log capturing privileged actions and denials.';
