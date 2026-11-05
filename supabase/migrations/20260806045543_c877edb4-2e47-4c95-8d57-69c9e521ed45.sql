ALTER TABLE public.gsc_sites
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS import_count integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS gsc_sites_user_site_unique ON public.gsc_sites (user_id, site_url);