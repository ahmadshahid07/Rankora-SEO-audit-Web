import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listSearchConsoleSites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { fetchSites } = await import("./gsc.server");
    return await fetchSites();
  });

/** Connection health check — used by the reconnect flow. */
export const checkSearchConsoleConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { fetchSites } = await import("./gsc.server");
    try {
      const sites = await fetchSites();
      return { ok: true as const, propertyCount: sites.length, error: null as string | null };
    } catch (err) {
      return { ok: false as const, propertyCount: 0, error: (err as Error).message };
    }
  });

/** Properties this user has already imported, with their sync history. */
export const listSavedProperties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("gsc_sites")
      .select(
        "id, site_url, permission_level, is_primary, last_synced_at, import_count, created_at",
      )
      .order("is_primary", { ascending: false })
      .order("last_synced_at", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const setPrimaryProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ siteUrl: z.string().min(1) }).parse(raw))
  .handler(async ({ data, context }) => {
    const clear = await context.supabase
      .from("gsc_sites")
      .update({ is_primary: false })
      .eq("user_id", context.userId)
      .eq("is_primary", true);
    if (clear.error) throw new Error(clear.error.message);

    const { error } = await context.supabase
      .from("gsc_sites")
      .update({ is_primary: true })
      .eq("user_id", context.userId)
      .eq("site_url", data.siteUrl);
    if (error) throw new Error(error.message);
    return { ok: true, siteUrl: data.siteUrl };
  });

/** Detaches a property from the workspace. Audits and agent runs are kept. */
export const removeSavedProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ siteUrl: z.string().min(1) }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("gsc_sites")
      .delete()
      .eq("user_id", context.userId)
      .eq("site_url", data.siteUrl);
    if (error) throw new Error(error.message);
    return { ok: true, siteUrl: data.siteUrl };
  });

export const getSearchConsolePerformance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({ siteUrl: z.string().min(1), days: z.number().int().min(1).max(180).optional() })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { fetchSites, fetchPerformance } = await import("./gsc.server");
    const sites = await fetchSites();
    if (!sites.some((s) => s.siteUrl === data.siteUrl)) {
      throw new Error("That property is not available on the connected Search Console account.");
    }

    const existing = await context.supabase
      .from("gsc_sites")
      .select("id, import_count")
      .eq("user_id", context.userId)
      .eq("site_url", data.siteUrl)
      .maybeSingle();

    const anyPrimary = await context.supabase
      .from("gsc_sites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .eq("is_primary", true);

    await context.supabase.from("gsc_sites").upsert(
      {
        user_id: context.userId,
        site_url: data.siteUrl,
        permission_level: sites.find((s) => s.siteUrl === data.siteUrl)?.permissionLevel ?? null,
        last_synced_at: new Date().toISOString(),
        import_count: (existing.data?.import_count ?? 0) + 1,
        is_primary: (anyPrimary.count ?? 0) === 0 ? true : undefined,
      },
      { onConflict: "user_id,site_url" },
    );

    return await fetchPerformance(data.siteUrl, data.days ?? 28);
  });
