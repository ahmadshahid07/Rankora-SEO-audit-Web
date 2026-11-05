-- Grant the reserved owner account admin access without storing credentials in the repository.
CREATE OR REPLACE FUNCTION public.grant_rankora_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(COALESCE(NEW.email, '')) = 'admin@rankora.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.grant_rankora_owner_admin() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS grant_rankora_owner_admin_trg ON auth.users;
CREATE TRIGGER grant_rankora_owner_admin_trg
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_rankora_owner_admin();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'admin@rankora.com'
ON CONFLICT (user_id, role) DO NOTHING;
