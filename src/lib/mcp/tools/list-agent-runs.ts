import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_agent_runs",
  title: "List agent runs",
  description:
    "List recent Rankora AI agent runs (Atlas AI, SpiderX, Optimus, Backlink Beast, WriterMind) with scores and summaries.",
  inputSchema: {
    agent: z.string().trim().optional().describe("Optional agent name filter, e.g. 'SpiderX'."),
    limit: z.number().int().optional().describe("How many runs to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ agent, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("agent_runs")
      .select("id, agent, url, score, status, summary, findings, fixes, duration_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(take);
    if (agent) query = query.eq("agent", agent);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { runs: data ?? [] },
    };
  },
});
