import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Finding = { severity?: string; title?: string };

type Run = {
  id: string;
  agent: string;
  url: string;
  score: number | null;
  status: string | null;
  duration_ms: number | null;
  findings: Finding[] | null;
  created_at: string;
};

export type AgentAnalytics = {
  agent: string;
  runs: number;
  successRate: number;
  avgDurationMs: number;
  avgScore: number;
  firstScore: number | null;
  latestScore: number | null;
  scoreDelta: number;
  criticalFindings: number;
  trend: { date: string; score: number }[];
  topIssues: { title: string; count: number; severity: string }[];
  lastRunAt: string | null;
};

export const getAgentAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("agent_runs")
      .select("id, agent, url, score, status, duration_ms, findings, created_at")
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Run[];
    const byAgent = new Map<string, Run[]>();
    for (const r of rows) {
      const list = byAgent.get(r.agent) ?? [];
      list.push(r);
      byAgent.set(r.agent, list);
    }

    const agents: AgentAnalytics[] = [...byAgent.entries()].map(([agent, list]) => {
      const scored = list.filter((r) => typeof r.score === "number");
      const durations = list.filter((r) => typeof r.duration_ms === "number");
      const issues = new Map<string, { count: number; severity: string }>();
      let criticalFindings = 0;

      for (const r of list) {
        for (const f of r.findings ?? []) {
          const title = (f.title ?? "").trim();
          if (!title) continue;
          const severity = f.severity ?? "info";
          if (severity === "critical") criticalFindings += 1;
          const key = title.toLowerCase();
          const prev = issues.get(key);
          issues.set(key, {
            count: (prev?.count ?? 0) + 1,
            severity: prev?.severity === "critical" ? "critical" : severity,
          });
        }
      }

      const firstScore = scored.length > 0 ? (scored[0]!.score as number) : null;
      const latestScore = scored.length > 0 ? (scored[scored.length - 1]!.score as number) : null;

      return {
        agent,
        runs: list.length,
        successRate:
          list.length > 0
            ? list.filter((r) => (r.status ?? "completed") === "completed").length / list.length
            : 0,
        avgDurationMs:
          durations.length > 0
            ? Math.round(
                durations.reduce((a, r) => a + (r.duration_ms as number), 0) / durations.length,
              )
            : 0,
        avgScore:
          scored.length > 0
            ? Math.round(scored.reduce((a, r) => a + (r.score as number), 0) / scored.length)
            : 0,
        firstScore,
        latestScore,
        scoreDelta: firstScore !== null && latestScore !== null ? latestScore - firstScore : 0,
        criticalFindings,
        trend: scored.slice(-20).map((r) => ({ date: r.created_at, score: r.score as number })),
        topIssues: [...issues.entries()]
          .map(([title, v]) => ({ title, count: v.count, severity: v.severity }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6),
        lastRunAt: list.length > 0 ? list[list.length - 1]!.created_at : null,
      };
    });

    agents.sort((a, b) => b.runs - a.runs);

    return {
      agents,
      totals: {
        runs: rows.length,
        avgDurationMs:
          rows.length > 0
            ? Math.round(rows.reduce((a, r) => a + (r.duration_ms ?? 0), 0) / rows.length)
            : 0,
        avgScore:
          rows.length > 0
            ? Math.round(
                rows
                  .filter((r) => typeof r.score === "number")
                  .reduce((a, r) => a + (r.score as number), 0) /
                  Math.max(1, rows.filter((r) => typeof r.score === "number").length),
              )
            : 0,
      },
    };
  });
