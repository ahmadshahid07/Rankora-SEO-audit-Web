import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Gauge,
  Globe,
  LogOut,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  FolderKanban,
  Link2,
} from "lucide-react";
import { runAudit, listAudits, type AuditResult } from "@/lib/audit.functions";
import { supabase } from "@/integrations/supabase/client";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Rankora" },
      {
        name: "description",
        content: "Your Rankora AI SEO dashboard: audits, scores, and recommendations.",
      },
      { property: "og:title", content: "Rankora Dashboard" },
      { property: "og:description", content: "AI SEO audits, scores, and recommendations." },
    ],
  }),
  component: Dashboard,
});

const stages = [
  "Connecting to your website",
  "Crawling pages & sitemap",
  "Extracting keywords & entities",
  "Checking metadata & schema",
  "Measuring Core Web Vitals",
  "Scanning backlinks & authority",
  "Running AI recommendations",
  "Calculating your SEO score",
];

function scoreColor(s: number) {
  if (s >= 85) return "text-emerald";
  if (s >= 65) return "text-primary";
  if (s >= 45) return "text-yellow-400";
  return "text-destructive";
}

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const runFn = useServerFn(runAudit);
  const listFn = useServerFn(listAudits);
  const [url, setUrl] = useState("");
  const [stageIndex, setStageIndex] = useState<number | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const audits = useQuery({
    queryKey: ["audits"],
    queryFn: () => listFn(),
  });

  const mutation = useMutation({
    mutationFn: (target: string) => runFn({ data: { url: target } }),
    onSuccess: (data) => {
      setResult(data);
      qc.invalidateQueries({ queryKey: ["audits"] });
    },
    onSettled: () => {
      if (stageTimer.current) clearInterval(stageTimer.current);
      setStageIndex(null);
    },
  });

  useEffect(() => {
    const pending = sessionStorage.getItem("rankora:pendingUrl");
    if (pending) {
      sessionStorage.removeItem("rankora:pendingUrl");
      setUrl(pending);
      startAudit(pending);
    }
    return () => {
      if (stageTimer.current) clearInterval(stageTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAudit(target: string) {
    let t = target.trim();
    if (!/^https?:\/\//i.test(t)) t = "https://" + t;
    setResult(null);
    setStageIndex(0);
    if (stageTimer.current) clearInterval(stageTimer.current);
    stageTimer.current = setInterval(() => {
      setStageIndex((i) => (i === null ? 0 : Math.min(i + 1, stages.length - 1)));
    }, 900);
    mutation.mutate(t);
  }

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <BrandLogo />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <FolderKanban className="h-3.5 w-3.5" /> Projects
            </Link>
            <Link
              to="/agent-hub"
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Agent Hub
            </Link>
            <Link
              to="/agent-analytics"
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Agent Analytics
            </Link>
            <Link
              to="/search-console"
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Search Console
            </Link>
            <Link
              to="/backlinks"
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" /> Backlinks
              </span>
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>

        {/* URL input */}
        <div className="glass-strong rounded-3xl p-6 gradient-border">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Paste any URL to run a full AI SEO audit
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!url.trim()) return;
              startAudit(url);
            }}
            className="flex flex-wrap gap-2"
          >
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="flex-1 rounded-xl border border-border bg-input/60 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-violet px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg disabled:opacity-60"
            >
              Run audit <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {stageIndex !== null && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Rankora is thinking…</span>
                <span>
                  {Math.min(stageIndex + 1, stages.length)}/{stages.length}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full shimmer"
                  style={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
                />
              </div>
              <div className="mt-3 text-sm text-muted-foreground">→ {stages[stageIndex]}</div>
            </div>
          )}

          {mutation.isError && (
            <p className="mt-4 text-sm text-destructive">{(mutation.error as Error).message}</p>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="glass rounded-2xl p-6 md:col-span-1">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                SEO Score
              </div>
              <div className={`mt-2 text-7xl font-bold ${scoreColor(result.score)}`}>
                {result.score}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">out of 100</div>
              <p className="mt-4 text-sm">{result.summary}</p>
              <div className="mt-6 text-xs text-muted-foreground break-all">{result.url}</div>
            </div>

            <div className="glass rounded-2xl p-6 md:col-span-2">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Gauge className="h-4 w-4 text-primary" /> Page metrics
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <Metric label="Load" value={`${result.metrics.loadTimeMs} ms`} />
                <Metric label="Size" value={`${result.metrics.sizeKb} KB`} />
                <Metric label="Words" value={result.metrics.wordCount.toString()} />
                <Metric label="H1s" value={result.metrics.h1Count.toString()} />
                <Metric label="Images" value={result.metrics.imageCount.toString()} />
                <Metric label="Missing alt" value={result.metrics.imagesMissingAlt.toString()} />
                <Metric label="Internal links" value={result.metrics.internalLinks.toString()} />
                <Metric label="External" value={result.metrics.externalLinks.toString()} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Flag ok={result.metrics.isHttps} label="HTTPS" />
                <Flag ok={result.metrics.hasViewport} label="Viewport" />
                <Flag ok={result.metrics.hasCanonical} label="Canonical" />
                <Flag ok={result.metrics.hasOpenGraph} label="Open Graph" />
                <Flag ok={result.metrics.hasStructuredData} label="Structured data" />
              </div>
            </div>

            <div className="glass rounded-2xl p-6 md:col-span-2">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-yellow-400" /> Detected issues
              </div>
              {result.issues.length === 0 ? (
                <p className="text-sm text-muted-foreground">No issues found. Beautiful.</p>
              ) : (
                <ul className="space-y-3">
                  {result.issues.map((i, idx) => (
                    <li key={idx} className="rounded-xl border border-border/60 bg-card/50 p-4">
                      <div className="flex items-center gap-2 text-xs">
                        <SeverityPill severity={i.severity} />
                        <span className="text-muted-foreground">{i.category}</span>
                      </div>
                      <div className="mt-1 font-medium">{i.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{i.description}</div>
                      <div className="mt-2 text-sm">
                        <span className="text-emerald">Fix: </span>
                        {i.fix}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass rounded-2xl p-6 md:col-span-1">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-emerald" /> AI recommendations
              </div>
              {result.recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recommendations.</p>
              ) : (
                <ul className="space-y-3">
                  {result.recommendations.map((r, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl border border-border/60 bg-card/50 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{r.agent}</span>
                        <PriorityPill p={r.priority} />
                      </div>
                      <div className="mt-1 font-medium">{r.title}</div>
                      <div className="mt-1 text-muted-foreground">{r.detail}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-12">
          <div className="mb-4 text-sm font-semibold text-muted-foreground">Recent audits</div>
          {audits.isLoading ? (
            <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">Loading…</div>
          ) : (audits.data ?? []).length === 0 ? (
            <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
              No audits yet. Run your first one above.
            </div>
          ) : (
            <div className="grid gap-2">
              {(audits.data ?? []).map((a) => (
                <div key={a.id} className="glass flex items-center justify-between rounded-xl p-4">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{a.url}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(a.created_at as string).toLocaleString()}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${scoreColor(a.score ?? 0)}`}>{a.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
        ok
          ? "border-emerald/40 bg-emerald/10 text-emerald"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
    >
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <Info className="h-3 w-3" />}
      {label}
    </span>
  );
}

function SeverityPill({ severity }: { severity: "critical" | "warning" | "info" }) {
  const map = {
    critical: "bg-destructive/15 text-destructive border-destructive/40",
    warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
    info: "bg-primary/15 text-primary border-primary/40",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 uppercase ${map[severity]}`}>{severity}</span>
  );
}

function PriorityPill({ p }: { p: "high" | "medium" | "low" }) {
  const map = {
    high: "text-destructive",
    medium: "text-yellow-400",
    low: "text-muted-foreground",
  };
  return <span className={`uppercase ${map[p]}`}>{p}</span>;
}
