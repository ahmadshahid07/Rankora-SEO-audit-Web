import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Link2,
  MousePointerClick,
  RefreshCw,
  Search,
  Star,
  Trash2,
  TriangleAlert,
  TrendingUp,
} from "lucide-react";
import {
  listSearchConsoleSites,
  getSearchConsolePerformance,
  checkSearchConsoleConnection,
  listSavedProperties,
  setPrimaryProperty,
  removeSavedProperty,
} from "@/lib/gsc.functions";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/_authenticated/search-console")({
  head: () => ({
    meta: [
      { title: "Search Console — Rankora" },
      {
        name: "description",
        content:
          "Import Google Search Console performance data into Rankora to sharpen AI SEO recommendations.",
      },
      { property: "og:title", content: "Rankora × Google Search Console" },
      {
        property: "og:description",
        content: "Clicks, impressions, CTR and position data feeding your AI agents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchConsolePage,
});

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function SearchConsolePage() {
  const qc = useQueryClient();
  const sitesFn = useServerFn(listSearchConsoleSites);
  const perfFn = useServerFn(getSearchConsolePerformance);
  const healthFn = useServerFn(checkSearchConsoleConnection);
  const savedFn = useServerFn(listSavedProperties);
  const primaryFn = useServerFn(setPrimaryProperty);
  const removeFn = useServerFn(removeSavedProperty);

  const [selected, setSelected] = useState("");
  const [days, setDays] = useState(28);

  const health = useQuery({ queryKey: ["gsc-health"], queryFn: () => healthFn(), retry: false });
  const sites = useQuery({ queryKey: ["gsc-sites"], queryFn: () => sitesFn(), retry: false });
  const saved = useQuery({ queryKey: ["gsc-saved"], queryFn: () => savedFn() });

  const perf = useMutation({
    mutationFn: (siteUrl: string) => perfFn({ data: { siteUrl, days } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gsc-saved"] }),
  });

  const makePrimary = useMutation({
    mutationFn: (siteUrl: string) => primaryFn({ data: { siteUrl } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gsc-saved"] }),
  });

  const detach = useMutation({
    mutationFn: (siteUrl: string) => removeFn({ data: { siteUrl } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gsc-saved"] }),
  });

  function refreshAll() {
    qc.invalidateQueries({ queryKey: ["gsc-health"] });
    qc.invalidateQueries({ queryKey: ["gsc-sites"] });
    qc.invalidateQueries({ queryKey: ["gsc-saved"] });
  }

  const connected = health.data?.ok === true;

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <BrandLogo />
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
        <h1 className="font-display text-2xl font-semibold">Google Search Console</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Import real query, click and ranking data — your agents use it to sharpen every
          recommendation.
        </p>

        <div className="glass-strong gradient-border mb-6 rounded-3xl p-6">
          <div className="flex flex-wrap items-center gap-3">
            {health.isLoading ? (
              <span className="text-sm text-muted-foreground">Checking connection…</span>
            ) : connected ? (
              <span className="inline-flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald" />
                Connected — {health.data?.propertyCount} verified propert
                {health.data?.propertyCount === 1 ? "y" : "ies"} available
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-yellow-400">
                <TriangleAlert className="h-4 w-4" /> Access problem —{" "}
                {health.data?.error ?? (health.error as Error)?.message}
              </span>
            )}
            <button
              onClick={refreshAll}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm hover:border-primary"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${health.isFetching ? "animate-spin" : ""}`} />{" "}
              Refresh access
            </button>
          </div>
          {!connected && !health.isLoading && (
            <p className="mt-3 text-xs text-muted-foreground">
              If refreshing doesn't restore access, re-authorize the Google Search Console
              connection in your workspace connector settings, then refresh here. Your imported
              history stays intact.
            </p>
          )}
        </div>

        <div className="glass-strong gradient-border rounded-3xl p-6">
          {sites.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your verified properties…</p>
          ) : sites.isError ? (
            <p className="text-sm text-destructive">{(sites.error as Error).message}</p>
          ) : (sites.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No verified properties found on the connected Google account.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-input/60 px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Select a property…</option>
                {(sites.data ?? []).map((s) => (
                  <option key={s.siteUrl} value={s.siteUrl}>
                    {s.siteUrl} {s.permissionLevel ? `(${s.permissionLevel})` : ""}
                  </option>
                ))}
              </select>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                aria-label="Performance date range"
                className="rounded-xl border border-border bg-input/60 px-3 py-3 text-sm outline-none focus:border-primary"
              >
                <option value={7}>Last 7 days</option>
                <option value={28}>Last 28 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 180 days</option>
              </select>
              <button
                disabled={!selected || perf.isPending}
                onClick={() => perf.mutate(selected)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-violet px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg disabled:opacity-60"
              >
                <Search className="h-4 w-4" /> Import data
              </button>
            </div>
          )}
          {perf.isError && (
            <p className="mt-4 text-sm text-destructive">{(perf.error as Error).message}</p>
          )}
        </div>

        <div className="glass-strong mt-6 rounded-3xl p-6">
          <div className="mb-3 text-sm font-semibold">Your properties</div>
          {saved.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (saved.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Import a property above to manage it here.
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {(saved.data ?? []).map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate text-sm">
                      {p.is_primary && (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-current text-yellow-400" />
                      )}
                      <span className="truncate">{p.site_url}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.import_count} import{p.import_count === 1 ? "" : "s"}
                      {p.last_synced_at
                        ? ` · last ${new Date(p.last_synced_at).toLocaleString()}`
                        : ""}
                      {p.permission_level ? ` · ${p.permission_level}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => perf.mutate(p.site_url)}
                      disabled={perf.isPending}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary disabled:opacity-60"
                    >
                      Re-import
                    </button>
                    {!p.is_primary && (
                      <button
                        onClick={() => makePrimary.mutate(p.site_url)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary"
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      onClick={() => detach.mutate(p.site_url)}
                      title="Remove property (imported history is kept)"
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Switching or removing a property never deletes past audits or agent runs.
          </p>
        </div>

        {perf.data && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                icon={<MousePointerClick className="h-4 w-4 text-primary" />}
                label="Clicks"
                value={perf.data.totals.clicks.toLocaleString()}
              />
              <Stat
                icon={<BarChart3 className="h-4 w-4 text-violet" />}
                label="Impressions"
                value={perf.data.totals.impressions.toLocaleString()}
              />
              <Stat
                icon={<TrendingUp className="h-4 w-4 text-emerald" />}
                label="Avg CTR"
                value={pct(perf.data.totals.ctr)}
              />
              <Stat
                icon={<Link2 className="h-4 w-4 text-yellow-400" />}
                label="Avg position"
                value={perf.data.totals.position.toFixed(1)}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Table title="Top queries" rows={perf.data.queries} />
              <Table title="Top pages" rows={perf.data.pages} />
            </div>

            <div className="mt-6 glass rounded-2xl p-6 text-sm text-muted-foreground">
              This property is now available in the{" "}
              <Link to="/agent-hub" className="text-primary hover:underline">
                Multi-Agent Hub
              </Link>{" "}
              — select it there so agents factor real search data into their fixes.
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

function Table({
  title,
  rows,
}: {
  title: string;
  rows: { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data for this range.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-2">Key</th>
                <th className="pb-2 text-right">Clicks</th>
                <th className="pb-2 text-right">Impr</th>
                <th className="pb-2 text-right">CTR</th>
                <th className="pb-2 text-right">Pos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border/50">
                  <td className="max-w-[220px] truncate py-2">{r.keys?.[0]}</td>
                  <td className="py-2 text-right">{r.clicks}</td>
                  <td className="py-2 text-right">{r.impressions}</td>
                  <td className="py-2 text-right">{pct(r.ctr)}</td>
                  <td className="py-2 text-right">{r.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
