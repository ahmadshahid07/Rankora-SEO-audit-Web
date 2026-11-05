import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const AGENT_IDS = ["atlas", "spiderx", "optimus", "backlink-beast", "writermind"] as const;

export default defineTool({
  name: "run_agent",
  title: "Run an SEO agent",
  description:
    "Run one Rankora specialist agent on a URL and save the result. atlas = strategy, spiderx = technical crawl, optimus = performance, backlink-beast = authority/links, writermind = content.",
  inputSchema: {
    agent: z.enum(AGENT_IDS).describe("Which specialist agent to run."),
    url: z.string().trim().url().describe("Full page URL to analyze, including https://"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async ({ agent, url }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { runAgentAnalysis, AGENTS } = await import("@/lib/agents.server");
    const { output, durationMs, model } = await runAgentAnalysis(agent, url);

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("agent_runs")
      .insert({
        user_id: ctx.getUserId(),
        agent: AGENTS[agent].name,
        url,
        status: "completed",
        score: output.score,
        summary: output.summary,
        findings: output.findings,
        fixes: output.fixes,
        duration_ms: durationMs,
      })
      .select("id, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    await supabase.from("ai_usage").insert({
      user_id: ctx.getUserId(),
      agent: AGENTS[agent].name,
      model,
      latency_ms: durationMs,
      success: true,
    });

    const result = { id: data.id, agent: AGENTS[agent].name, url, durationMs, ...output };
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: { run: result },
    };
  },
});
