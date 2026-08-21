-- Production security hardening
-- Repeatable migration for the Supabase production project.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon, authenticated',
      r.schema_name,
      r.function_name,
      r.args
    );
  END LOOP;
END $$;

ALTER VIEW public.student_reward_balances
  SET (security_invoker = true);

ALTER VIEW public.ccmas_hydration_status
  SET (security_invoker = true);

DROP POLICY IF EXISTS "Public can read CCMAS disciplines"
  ON public.ccmas_disciplines;
CREATE POLICY "Public can read CCMAS disciplines"
  ON public.ccmas_disciplines
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can read CCMAS source documents"
  ON public.ccmas_source_documents;
CREATE POLICY "Public can read CCMAS source documents"
  ON public.ccmas_source_documents
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can read national programme catalogue"
  ON public.national_programme_catalogue;
CREATE POLICY "Public can read national programme catalogue"
  ON public.national_programme_catalogue
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.set_ask_solutions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
