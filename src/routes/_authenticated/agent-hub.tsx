import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bot, Play, Wrench, AlertTriangle, ArrowLeft, Timer } from "lucide-react";
import { runAgent, listAgentRuns } from "@/lib/agents.functions";
import { listSearchConsoleSites } from "@/lib/gsc.functions";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/_authenticated/agent-hub")({
  head: () => ({
    meta: [
      { title: "Multi-Agent Hub — Rankora" },
      {
        name: "description",
        content:
          "Run Atlas AI, SpiderX, Optimus, Backlink Beast and WriterMind on any URL and see each agent's own findings and fixes.",
      },
      { property: "og:title", content: "Rankora Multi-Agent Hub" },
      {
        property: "og:description",
        content: "Five specialist SEO agents, each with their own findings and fixes.",
      },
    ],
  }),
  component: AgentHub,
});

const AGENTS = [
  { id: "atlas", name: "Atlas AI", role: "Lead strategist", focus: "Priorities, impact, roadmap" },
  {
    id: "spiderx",
    name: "SpiderX",
    role: "Technical crawler",
    focus: "Crawlability, indexation, schema",
  },
  {
    id: "optimus",
    name: "Optimus",
    role: "Performance engineer",
    focus: "Speed, weight, Core Web Vitals",
  },
  {
    id: "backlink-beast",
    name: "Backlink Beast",
    role: "Authority analyst",
    focus: "Links, anchors, authority",
  },
  {
    id: "writermind",
    name: "WriterMind",
    role: "Content strategist",
    focus: "Intent, depth, readability",
  },
] as const;

type AgentId = (typeof AGENTS)[number]["id"];
type AgentResult = Awaited<ReturnType<typeof runAgent>>;

function scoreColor(s: number) {
  if (s >= 85) return "text-emerald";
  if (s >= 65) return "text-primary";
  if (s >= 45) return "text-yellow-400";
  return "text-destructive";
}

function AgentHub() {
  const runFn = useServerFn(runAgent);
  const listFn = useServerFn(listAgentRuns);
  const sitesFn = useServerFn(listSearchConsoleSites);

  const [url, setUrl] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [results, setResults] = useState<Partial<Record<AgentId, AgentResult>>>({});
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const runs = useQuery({ queryKey: ["agent-runs"], queryFn: () => listFn() });
  const sites = useQuery({ queryKey: ["gsc-sites"], queryFn: () => sitesFn(), retry: false });

  const mutation = useMutation({
    mutationFn: (v: { agent: AgentId; url: string }) =>
      runFn({ data: { agent: v.agent, url: v.url, siteUrl: siteUrl || undefined } }),
  });

  function normalized() {
    let t = url.trim();
    if (!t) return "";
    if (!/^https?:\/\//i.test(t)) t = "https://" + t;
    return t;
  }

  async function launch(agent: AgentId) {
    const target = normalized();
    if (!target) return;
    setRunning((r) => ({ ...r, [agent]: true }));
    setErrors((e) => ({ ...e, [agent]: "" }));
    try {
      const res = await mutation.mutateAsync({ agent, url: target });
      setResults((r) => ({ ...r, [agent]: res }));
      runs.refetch();
    } catch (err) {
      setErrors((e) => ({ ...e, [agent]: (err as Error).message }));
    } finally {
      setRunning((r) => ({ ...r, [agent]: false }));
    }
  }

  async function launchAll() {
    for (const a of AGENTS) await launch(a.id);
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <BrandLogo />
          <div>
            <Link
              to="/dashboard"
              className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <h1 className="font-display text-2xl font-semibold">Multi-Agent Hub</h1>
            <p className="text-sm text-muted-foreground">
              Five specialists. Each runs on its own and reports its own fixes.
            </p>
          </div>
        </div>

        <div className="glass-strong gradient-border rounded-3xl p-6">
          <div className="flex flex-wrap gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="flex-1 rounded-xl border border-border bg-input/60 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <select
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="rounded-xl border border-border bg-input/60 px-3 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">No Search Console data</option>
              {(sites.data ?? []).map((s) => (
                <option key={s.siteUrl} value={s.siteUrl}>
                  {s.siteUrl}
                </option>
              ))}
            </select>
            <button
              onClick={launchAll}
              disabled={!url.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-violet px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg disabled:opacity-60"
            >
              <Play className="h-4 w-4" /> Run all agents
            </button>
          </div>
          {sites.isError && (
            <p className="mt-3 text-xs text-muted-foreground">
              Search Console data unavailable —{" "}
              <Link to="/search-console" className="text-primary hover:underline">
                connect a property
              </Link>
              .
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {AGENTS.map((a) => {
            const res = results[a.id];
            const busy = running[a.id];
            return (
              <div key={a.id} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet text-white">
                      <Bot className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.role} · {a.focus}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => launch(a.id)}
                    disabled={busy || !url.trim()}
                    className="rounded-full border border-border/60 px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
                  >
                    {busy ? "Running…" : "Run"}
                  </button>
                </div>

                {busy && (
                  <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-2/3 shimmer" />
                  </div>
                )}

                {errors[a.id] && <p className="mt-4 text-sm text-destructive">{errors[a.id]}</p>}

                {res && (
                  <div className="mt-5">
                    <div className="flex items-end gap-3">
                      <div className={`text-4xl font-bold ${scoreColor(res.score)}`}>
                        {res.score}
                      </div>
                      <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Timer className="h-3 w-3" /> {(res.durationMs / 1000).toFixed(1)}s
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{res.summary}</p>

                    {res.findings.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" /> Findings
                        </div>
                        <ul className="space-y-2">
                          {res.findings.map((f, i) => (
                            <li
                              key={i}
                              className="rounded-xl border border-border/60 bg-card/50 p-3 text-sm"
                            >
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                {f.severity}
                              </div>
                              <div className="font-medium">{f.title}</div>
                              <div className="text-muted-foreground">{f.detail}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {res.fixes.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Wrench className="h-3.5 w-3.5 text-emerald" /> Fixes
                        </div>
                        <ul className="space-y-2">
                          {res.fixes.map((f, i) => (
                            <li
                              key={i}
                              className="rounded-xl border border-emerald/25 bg-emerald/5 p-3 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{f.title}</span>
                                <span className="text-[10px] uppercase text-muted-foreground">
                                  {f.effort} effort
                                </span>
                              </div>
                              <div className="text-muted-foreground">{f.action}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12">
          <div className="mb-4 text-sm font-semibold text-muted-foreground">Recent agent runs</div>
          {(runs.data ?? []).length === 0 ? (
            <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
              No agent runs yet.
            </div>
          ) : (
            <div className="grid gap-2">
              {(runs.data ?? []).map((r) => (
                <div
                  key={r.id}
                  className="glass flex items-center justify-between gap-4 rounded-xl p-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {r.agent} · {r.url}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.created_at as string).toLocaleString()}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${scoreColor(r.score ?? 0)}`}>{r.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
