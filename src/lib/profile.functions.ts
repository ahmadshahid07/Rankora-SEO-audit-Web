import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(
        "id, email, full_name, avatar_url, phone, address, city, country, onboarded, created_at",
      )
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw: unknown) =>
    z
      .object({
        full_name: z.string().trim().min(2, "Please enter your full name").max(120),
        phone: z
          .string()
          .trim()
          .min(7, "Enter a valid phone number")
          .max(24)
          .regex(/^[+0-9()\-\s]+$/, "Phone can only contain digits, spaces and + - ( )"),
        address: z.string().trim().min(4, "Enter your address").max(240),
        city: z.string().trim().max(80).optional().or(z.literal("")),
        country: z.string().trim().max(80).optional().or(z.literal("")),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        city: data.city || null,
        country: data.country || null,
        onboarded: true,
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Records/refreshes a login heartbeat so the admin can see who is active. */
export const recordPresence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw: unknown) =>
    z
      .object({
        provider: z.string().max(40).optional(),
        userAgent: z.string().max(400).optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const email = String((context as any).claims?.email ?? "");
    const nowIso = new Date().toISOString();
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: existing } = await context.supabase
      .from("login_events")
      .select("id")
      .eq("user_id", context.userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await context.supabase
        .from("login_events")
        .update({ last_seen_at: nowIso })
        .eq("id", existing.id);
      if (error) console.error("presence update failed", error.message);
    } else {
      const { error } = await context.supabase.from("login_events").insert({
        user_id: context.userId,
        email,
        provider: data.provider ?? "email",
        user_agent: data.userAgent ?? null,
        last_seen_at: nowIso,
      });
      if (error) console.error("presence insert failed", error.message);
    }
    return { ok: true };
  });
