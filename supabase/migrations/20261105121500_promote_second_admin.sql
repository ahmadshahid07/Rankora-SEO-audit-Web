-- 1. Update enforce_single_admin to permit both owner accounts
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
    SELECT lower(email) INTO v_email FROM auth.users WHERE id = NEW.user_id;
    IF v_email NOT IN ('admin@rankora.com', 'ahmadshahid.45612@gmail.com') THEN
      RAISE EXCEPTION 'Administrator access is reserved for Rankora owner accounts.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Update the auto-grant trigger function
CREATE OR REPLACE FUNCTION public.grant_rankora_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(COALESCE(NEW.email, '')) IN ('admin@rankora.com', 'ahmadshahid.45612@gmail.com') THEN
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

-- 3. Grant admin role to ahmadshahid.45612@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('51c8ddf7-bcb6-4bcd-b3e6-83ac23be34eb', 'admin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;
