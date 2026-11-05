import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Bot,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getAgentAnalytics } from "@/lib/analytics.functions";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/_authenticated/agent-analytics")({
  head: () => ({
    meta: [
      { title: "Agent Analytics — Rankora" },
      {
        name: "description",
        content:
          "Per-agent SEO analytics: run counts, average runtime, success rate, score movement and recurring issues over time.",
      },
      { property: "og:title", content: "Rankora Agent Analytics" },
      {
        property: "og:description",
        content: "Track how each AI SEO agent performs across every run.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgentAnalyticsPage,
});

function ms(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${n}ms`;
}

function scoreColor(s: number) {
  if (s >= 85) return "text-emerald";
  if (s >= 65) return "text-primary";
  if (s >= 45) return "text-yellow-400";
  return "text-destructive";
}

function AgentAnalyticsPage() {
  const fn = useServerFn(getAgentAnalytics);
  const q = useQuery({ queryKey: ["agent-analytics"], queryFn: () => fn() });

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <BrandLogo />
        </div>
        <Link
          to="/dashboard"
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <h1 className="font-display text-2xl font-semibold">Agent Analytics</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          How each specialist agent is performing — volume, speed, reliability, score movement and
          the issues they keep finding.
        </p>

        {q.isLoading ? (
          <p className="text-sm text-muted-foreground">Crunching your agent history…</p>
        ) : q.isError ? (
          <p className="text-sm text-destructive">{(q.error as Error).message}</p>
        ) : (q.data?.agents ?? []).length === 0 ? (
          <div className="glass-strong gradient-border rounded-3xl p-8 text-center">
            <Bot className="mx-auto mb-3 h-6 w-6 text-primary" />
            <p className="text-sm text-muted-foreground">
              No agent runs yet. Run your first analysis in the{" "}
              <Link to="/agent-hub" className="text-primary hover:underline">
                Multi-Agent Hub
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat
                icon={<Activity className="h-4 w-4 text-primary" />}
                label="Total runs"
                value={String(q.data!.totals.runs)}
              />
              <Stat
                icon={<Timer className="h-4 w-4 text-violet" />}
                label="Avg runtime"
                value={ms(q.data!.totals.avgDurationMs)}
              />
              <Stat
                icon={<TrendingUp className="h-4 w-4 text-emerald" />}
                label="Avg score"
                value={String(q.data!.totals.avgScore)}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {q.data!.agents.map((a) => (
                <div key={a.agent} className="glass-strong gradient-border rounded-3xl p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-display text-lg font-semibold">
                        <Bot className="h-4 w-4 text-primary" /> {a.agent}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.runs} run{a.runs === 1 ? "" : "s"}
                        {a.lastRunAt ? ` · last ${new Date(a.lastRunAt).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-semibold ${scoreColor(a.avgScore)}`}>
                        {a.avgScore}
                      </div>
                      <div className="text-[11px] text-muted-foreground">avg score</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <Mini label="Avg time" value={ms(a.avgDurationMs)} />
                    <Mini label="Success" value={`${Math.round(a.successRate * 100)}%`} />
                    <Mini
                      label="Score change"
                      value={`${a.scoreDelta > 0 ? "+" : ""}${a.scoreDelta}`}
                      tone={a.scoreDelta > 0 ? "up" : a.scoreDelta < 0 ? "down" : "flat"}
                    />
                  </div>

                  {a.trend.length > 1 && <Sparkline points={a.trend.map((t) => t.score)} />}

                  <div className="mt-5">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" /> Top recurring issues
                      <span className="ml-auto font-normal">
                        {a.criticalFindings} critical total
                      </span>
                    </div>
                    {a.topIssues.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No findings recorded yet.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {a.topIssues.map((i) => (
                          <li key={i.title} className="flex items-center gap-2 text-sm">
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                i.severity === "critical"
                                  ? "bg-destructive"
                                  : i.severity === "warning"
                                    ? "bg-yellow-400"
                                    : "bg-primary"
                              }`}
                            />
                            <span className="flex-1 truncate capitalize">{i.title}</span>
                            <span className="text-xs text-muted-foreground">×{i.count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down" | "flat";
}) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 inline-flex items-center gap-1 text-sm font-semibold ${
          tone === "up" ? "text-emerald" : tone === "down" ? "text-destructive" : ""
        }`}
      >
        {tone === "up" && <TrendingUp className="h-3.5 w-3.5" />}
        {tone === "down" && <TrendingDown className="h-3.5 w-3.5" />}
        {value}
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 320;
  const h = 48;
  const max = Math.max(...points, 100);
  const min = Math.min(...points, 0);
  const span = Math.max(1, max - min);
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-4 h-12 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
    </svg>
  );
}
