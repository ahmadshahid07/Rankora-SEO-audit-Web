import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_audits",
  title: "List SEO audits",
  description: "List the signed-in user's recent Rankora SEO audits with scores and summaries.",
  inputSchema: {
    url: z.string().trim().optional().describe("Optional exact URL filter."),
    limit: z.number().int().optional().describe("How many audits to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ url, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("audits")
      .select("id, url, score, status, summary, created_at")
      .order("created_at", { ascending: false })
      .limit(take);
    if (url) query = query.eq("url", url);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { audits: data ?? [] },
    };
  },
});
