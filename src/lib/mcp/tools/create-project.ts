import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_project",
  title: "Create SEO project",
  description: "Create a new Rankora SEO project for a website URL owned by the signed-in user.",
  inputSchema: {
    name: z.string().trim().min(2).describe("Project name."),
    url: z.string().trim().url().describe("Full website URL including https://"),
    description: z.string().trim().optional().describe("Optional short description."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, url, description }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: ctx.getUserId(), name, url, description: description || null })
      .select("id, name, url, status, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { project: data },
    };
  },
});
