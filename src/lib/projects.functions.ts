import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select(
        "id, name, url, description, status, is_primary, last_audit_score, created_at, updated_at",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(120),
        url: z.string().trim().url("Enter a full URL including https://").max(500),
        description: z.string().trim().max(500).optional().or(z.literal("")),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("projects")
      .insert({
        user_id: context.userId,
        name: data.name,
        url: data.url,
        description: data.description || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("projects")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getProjectDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: project, error } = await context.supabase
      .from("projects")
      .select("id, name, url, description, status, last_audit_score, created_at")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!project) throw new Error("Project not found.");

    const [runs, audits] = await Promise.all([
      context.supabase
        .from("agent_runs")
        .select("id, agent, url, score, summary, findings, fixes, duration_ms, status, created_at")
        .or(`project_id.eq.${data.id},url.eq.${project.url}`)
        .order("created_at", { ascending: false })
        .limit(60),
      context.supabase
        .from("audits")
        .select("id, url, score, summary, issues, recommendations, metrics, created_at")
        .or(`project_id.eq.${data.id},url.eq.${project.url}`)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    if (runs.error) throw new Error(runs.error.message);
    if (audits.error) throw new Error(audits.error.message);

    return { project, runs: runs.data ?? [], audits: audits.data ?? [] };
  });
