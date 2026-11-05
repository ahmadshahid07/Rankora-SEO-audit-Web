CREATE OR REPLACE FUNCTION public.enforce_single_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF NEW.role = 'admin'::app_role THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
    IF v_email IS DISTINCT FROM 'admin@rankora.com' THEN
      RAISE EXCEPTION 'Administrator access is reserved for the Rankora owner account.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_single_admin() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_single_admin_trg ON public.user_roles;
CREATE TRIGGER enforce_single_admin_trg
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_admin();

DELETE FROM public.user_roles
WHERE role = 'admin'::app_role
  AND user_id NOT IN (SELECT id FROM auth.users WHERE email = 'admin@rankora.com');

INSERT INTO public.site_details (label, value, category, sort_order) VALUES
  ('Platform name', 'Rankora', 'general', 1),
  ('Tagline', 'The World''s Most Intelligent AI SEO Automation Platform', 'general', 2),
  ('Support email', 'support@rankora.com', 'contact', 3),
  ('AI agents', '10 specialized SEO agents', 'product', 4)
ON CONFLICT DO NOTHING;

INSERT INTO public.announcements (title, body, kind, published) VALUES
  ('Welcome to Rankora', 'Multi-agent AI SEO auditing is live. Add a project and let Atlas, SpiderX, Optimus, Backlink Beast and WriterMind analyse your site.', 'announcement', true)
ON CONFLICT DO NOTHING;