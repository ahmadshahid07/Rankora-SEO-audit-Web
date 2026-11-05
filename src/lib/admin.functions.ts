import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Designated admin accounts that hold the admin role. */
export const ADMIN_EMAILS = ["admin@rankora.com", "ahmadshahid.45612@gmail.com"];
export const ADMIN_EMAIL = ADMIN_EMAILS[0];

type Ctx = { supabase: any; userId: string; claims?: any };

async function assertAdmin(context: Ctx) {
  // Role check runs as the caller, against the RLS-protected user_roles table.
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required.");
}

function emailOf(context: Ctx): string {
  return String(context.claims?.email ?? "").toLowerCase();
}

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r: { role: string }) => r.role);
    return {
      roles,
      isAdmin: roles.includes("admin"),
      isOwnerEmail: ADMIN_EMAILS.includes(emailOf(context)),
    };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = context.supabase;

    const [
      users,
      roles,
      audits,
      jobs,
      usage,
      projects,
      messages,
      announcements,
      details,
      payments,
      logins,
      agentRuns,
    ] = await Promise.all([
      sb
        .from("profiles")
        .select(
          "id, email, full_name, avatar_url, phone, address, city, country, onboarded, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500),
      sb.from("user_roles").select("user_id, role"),
      sb
        .from("audits")
        .select("id, user_id, url, score, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      sb
        .from("audit_jobs")
        .select("id, user_id, url, status, priority, attempts, error, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      sb
        .from("ai_usage")
        .select("id, user_id, agent, model, total_tokens, latency_ms, success, created_at")
        .order("created_at", { ascending: false })
        .limit(300),
      sb
        .from("projects")
        .select("id, user_id, name, url, description, status, last_audit_score, created_at")
        .order("created_at", { ascending: false })
        .limit(300),
      sb
        .from("support_messages")
        .select("id, user_id, subject, body, status, admin_reply, replied_at, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      sb
        .from("announcements")
        .select("id, title, body, kind, published, pinned, starts_at, ends_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      sb
        .from("site_details")
        .select("id, label, value, category, sort_order")
        .order("sort_order", { ascending: true })
        .limit(200),
      sb
        .from("payments")
        .select("id, user_id, amount_cents, currency, plan, status, created_at")
        .order("created_at", { ascending: false })
        .limit(2000),
      sb
        .from("login_events")
        .select("id, user_id, email, provider, user_agent, last_seen_at, created_at")
        .order("last_seen_at", { ascending: false })
        .limit(300),
      sb
        .from("agent_runs")
        .select("id, user_id, agent, url, score, duration_ms, status, created_at")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);

    for (const r of [
      users,
      roles,
      audits,
      jobs,
      usage,
      projects,
      messages,
      announcements,
      details,
      payments,
      logins,
      agentRuns,
    ]) {
      if (r.error) throw new Error(r.error.message);
    }

    const usageRows = usage.data ?? [];
    const auditRows = audits.data ?? [];
    const payRows = (payments.data ?? []).filter((p: any) => p.status === "paid");
    const loginRows = logins.data ?? [];

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
    const sum = (rows: any[]) => rows.reduce((a, r) => a + (r.amount_cents ?? 0), 0) / 100;
    const since = (t: number) => payRows.filter((p: any) => new Date(p.created_at).getTime() >= t);

    // 12-month revenue series
    const monthly: { label: string; total: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const rows = payRows.filter((p: any) => {
        const t = new Date(p.created_at).getTime();
        return t >= d.getTime() && t < next.getTime();
      });
      monthly.push({ label: d.toLocaleString(undefined, { month: "short" }), total: sum(rows) });
    }

    // last 14 days
    const daily: { label: string; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const next = new Date(d.getTime() + 86400000);
      const rows = payRows.filter((p: any) => {
        const t = new Date(p.created_at).getTime();
        return t >= d.getTime() && t < next.getTime();
      });
      daily.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, total: sum(rows) });
    }

    const onlineCutoff = Date.now() - 15 * 60 * 1000;
    const online = loginRows.filter((l: any) => new Date(l.last_seen_at).getTime() >= onlineCutoff);

    return {
      users: users.data ?? [],
      roles: roles.data ?? [],
      audits: auditRows,
      jobs: jobs.data ?? [],
      usage: usageRows,
      projects: projects.data ?? [],
      messages: messages.data ?? [],
      announcements: announcements.data ?? [],
      details: details.data ?? [],
      payments: payRows,
      logins: loginRows,
      agentRuns: agentRuns.data ?? [],
      revenue: {
        today: sum(since(startOfDay)),
        month: sum(since(startOfMonth)),
        year: sum(since(startOfYear)),
        allTime: sum(payRows),
        monthly,
        daily,
      },
      stats: {
        totalUsers: (users.data ?? []).length,
        totalProjects: (projects.data ?? []).length,
        totalAudits: auditRows.length,
        avgScore:
          auditRows.length > 0
            ? Math.round(
                auditRows.reduce((a: number, r: any) => a + (r.score ?? 0), 0) / auditRows.length,
              )
            : 0,
        aiCalls: usageRows.length,
        aiTokens: usageRows.reduce((a: number, r: any) => a + (r.total_tokens ?? 0), 0),
        queued: (jobs.data ?? []).filter((j: any) => j.status === "queued").length,
        openMessages: (messages.data ?? []).filter((m: any) => m.status === "open").length,
        onlineNow: online.length,
      },
    };
  });

/* ---------------- Support messages ---------------- */

export const replyToMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ id: z.string().uuid(), reply: z.string().trim().min(1).max(4000) }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("support_messages")
      .update({ admin_reply: data.reply, status: "replied", replied_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["open", "replied", "closed"]) }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("support_messages")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Announcements ---------------- */

export const upsertAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().trim().min(2).max(140),
        body: z.string().trim().min(2).max(4000),
        kind: z.enum(["announcement", "feature", "update"]),
        published: z.boolean(),
        pinned: z.boolean().optional(),
        starts_at: z.string().datetime().optional(),
        ends_at: z.string().datetime().nullable().optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      title: data.title,
      body: data.body,
      kind: data.kind,
      published: data.published,
      pinned: data.pinned ?? false,
      starts_at: data.starts_at ?? new Date().toISOString(),
      ends_at: data.ends_at ?? null,
    };
    const q = data.id
      ? context.supabase.from("announcements").update(payload).eq("id", data.id)
      : context.supabase.from("announcements").insert({ ...payload, created_by: context.userId });
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("announcements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Site details ---------------- */

export const upsertSiteDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        label: z.string().trim().min(1).max(120),
        value: z.string().trim().min(1).max(1000),
        category: z.string().trim().min(1).max(60),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = { label: data.label, value: data.value, category: data.category };
    const q = data.id
      ? context.supabase.from("site_details").update(payload).eq("id", data.id)
      : context.supabase.from("site_details").insert({ ...payload, created_by: context.userId });
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSiteDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("site_details").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Roles / jobs ---------------- */

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["moderator", "user"]),
        grant: z.boolean(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.grant) {
      const { error } = await context.supabase
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const enqueueAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({ url: z.string().url(), priority: z.number().int().min(1).max(9).optional() })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("audit_jobs").insert({
      user_id: context.userId,
      url: data.url,
      priority: data.priority ?? 5,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateJobStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z
      .object({
        jobId: z.string().uuid(),
        status: z.enum(["queued", "running", "completed", "failed", "cancelled"]),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("audit_jobs")
      .update({
        status: data.status,
        finished_at: ["completed", "failed", "cancelled"].includes(data.status)
          ? new Date().toISOString()
          : null,
      })
      .eq("id", data.jobId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
