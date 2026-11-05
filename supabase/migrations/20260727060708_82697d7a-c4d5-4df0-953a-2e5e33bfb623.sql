-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
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

CREATE POLICY "Users read own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins read all roles" ON public.user_roles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Agent runs
CREATE TABLE public.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  audit_id uuid REFERENCES public.audits(id) ON DELETE SET NULL,
  agent text NOT NULL,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  score integer,
  summary text,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  fixes jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_runs TO authenticated;
GRANT ALL ON public.agent_runs TO service_role;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own agent runs" ON public.agent_runs
FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all agent runs" ON public.agent_runs
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_agent_runs_updated_at BEFORE UPDATE ON public.agent_runs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit job queue
CREATE TABLE public.audit_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  priority integer NOT NULL DEFAULT 5,
  attempts integer NOT NULL DEFAULT 0,
  error text,
  audit_id uuid REFERENCES public.audits(id) ON DELETE SET NULL,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_jobs TO authenticated;
GRANT ALL ON public.audit_jobs TO service_role;
ALTER TABLE public.audit_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own jobs" ON public.audit_jobs
FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all jobs" ON public.audit_jobs
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update all jobs" ON public.audit_jobs
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_audit_jobs_updated_at BEFORE UPDATE ON public.audit_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI usage log
CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent text,
  model text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  latency_ms integer,
  success boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own usage" ON public.ai_usage
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own usage" ON public.ai_usage
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all usage" ON public.ai_usage
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin visibility on existing tables
CREATE POLICY "Admins read all audits" ON public.audits
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read all profiles" ON public.profiles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Search Console site links
CREATE TABLE public.gsc_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  site_url text NOT NULL,
  permission_level text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, site_url)
);

GRANT SELECT, INSERT, DELETE ON public.gsc_sites TO authenticated;
GRANT ALL ON public.gsc_sites TO service_role;
ALTER TABLE public.gsc_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own gsc sites" ON public.gsc_sites
FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);