import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AgentIdSchema = z.enum(["atlas", "spiderx", "optimus", "backlink-beast", "writermind"]);

export const runAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw: unknown) =>
    z
      .object({
        agent: AgentIdSchema,
        url: z.string().url(),
        siteUrl: z.string().optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data, context }) => {
    const { runAgentAnalysis, AGENTS } = await import("./agents.server");

    let digest: string | undefined;
    if (data.siteUrl) {
      try {
        const { fetchPerformance, performanceDigest } = await import("./gsc.server");
        digest = performanceDigest(await fetchPerformance(data.siteUrl, 28));
      } catch {
        digest = undefined;
      }
    }

    const { output, durationMs, model } = await runAgentAnalysis(data.agent, data.url, digest);

    const { data: row, error } = await context.supabase
      .from("agent_runs")
      .insert({
        user_id: context.userId,
        agent: AGENTS[data.agent].name,
        url: data.url,
        status: "completed",
        score: output.score,
        summary: output.summary,
        findings: output.findings,
        fixes: output.fixes,
        duration_ms: durationMs,
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(`Failed to save agent run: ${error.message}`);

    await context.supabase.from("ai_usage").insert({
      user_id: context.userId,
      agent: AGENTS[data.agent].name,
      model,
      latency_ms: durationMs,
      success: true,
    });

    return {
      id: row.id,
      createdAt: row.created_at,
      agent: data.agent,
      agentName: AGENTS[data.agent].name,
      url: data.url,
      durationMs,
      ...output,
    };
  });

export const listAgentRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("agent_runs")
      .select("id, agent, url, score, summary, duration_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
