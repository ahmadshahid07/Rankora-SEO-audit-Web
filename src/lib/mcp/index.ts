import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProjects from "./tools/list-projects";
import createProject from "./tools/create-project";
import listAudits from "./tools/list-audits";
import getAudit from "./tools/get-audit";
import listAgentRuns from "./tools/list-agent-runs";
import runAgent from "./tools/run-agent";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "ai-rank-engine",
  title: "AI Rank Engine",
  version: "0.1.0",
  instructions:
    "Tools for Rankora, an AI SEO automation platform. Use list_projects / create_project to manage tracked websites, list_audits and get_audit to read SEO audit results, run_agent to run a specialist SEO agent on a URL, and list_agent_runs to review past agent output. All tools act as the signed-in Rankora user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProjects, createProject, listAudits, getAudit, listAgentRuns, runAgent],
});
