CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY "Admins read all roles" ON public.user_roles;
DROP POLICY "Admins manage roles" ON public.user_roles;
DROP POLICY "Admins read all agent runs" ON public.agent_runs;
DROP POLICY "Admins read all jobs" ON public.audit_jobs;
DROP POLICY "Admins update all jobs" ON public.audit_jobs;
DROP POLICY "Admins read all usage" ON public.ai_usage;
DROP POLICY "Admins read all audits" ON public.audits;
DROP POLICY "Admins read all profiles" ON public.profiles;
DROP POLICY "Admins read all projects" ON public.projects;
DROP POLICY "Admins read all messages" ON public.support_messages;
DROP POLICY "Admins update all messages" ON public.support_messages;
DROP POLICY "Admins delete messages" ON public.support_messages;
DROP POLICY "Admins read all announcements" ON public.announcements;
DROP POLICY "Admins manage announcements" ON public.announcements;
DROP POLICY "Admins manage site details" ON public.site_details;
DROP POLICY "Admins read all payments" ON public.payments;
DROP POLICY "Admins read all login events" ON public.login_events;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all agent runs" ON public.agent_runs FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all jobs" ON public.audit_jobs FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all jobs" ON public.audit_jobs FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all usage" ON public.ai_usage FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all audits" ON public.audits FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all projects" ON public.projects FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all messages" ON public.support_messages FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all messages" ON public.support_messages FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete messages" ON public.support_messages FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all announcements" ON public.announcements FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage site details" ON public.site_details FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all payments" ON public.payments FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all login events" ON public.login_events FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));