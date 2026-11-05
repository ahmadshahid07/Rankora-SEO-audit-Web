import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const sendSupportMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw: unknown) =>
    z
      .object({
        subject: z.string().trim().min(3, "Add a short subject").max(140),
        body: z.string().trim().min(5, "Tell us a bit more").max(4000),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("support_messages").insert({
      user_id: context.userId,
      subject: data.subject,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("support_messages")
      .select("id, subject, body, status, admin_reply, replied_at, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
