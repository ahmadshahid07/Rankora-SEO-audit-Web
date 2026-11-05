import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Link2, Play, Wrench } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { AuroraBackground } from "@/components/AuroraBackground";
import { runAgent } from "@/lib/agents.functions";

export const Route = createFileRoute("/_authenticated/backlinks")({
  head: () => ({
    meta: [
      { title: "Backlink Analysis — Rankora" },
      {
        name: "description",
        content:
          "Analyze internal links, anchors, authority signals, and link-building opportunities with Backlink Beast.",
      },
      { property: "og:title", content: "Rankora Backlink Analysis" },
      {
        property: "og:description",
        content: "Find link gaps and practical authority-building opportunities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BacklinksPage,
});

function BacklinksPage() {
  const fn = useServerFn(runAgent);
  const [url, setUrl] = useState("");
  const analysis = useMutation({
    mutationFn: (target: string) => fn({ data: { agent: "backlink-beast", url: target } }),
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    analysis.mutate(target);
  };
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <BrandLogo />
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
        <h1 className="font-display text-3xl font-semibold">Backlink opportunity lab</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect link architecture, anchors, authority signals, and realistic outreach
          opportunities.
        </p>
        <form
          onSubmit={submit}
          className="glass-strong gradient-border mt-6 flex flex-wrap gap-2 rounded-2xl p-5"
        >
          <input
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-site.com"
            className="min-w-0 flex-1 rounded-xl border border-border bg-input/60 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            disabled={analysis.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            <Play className="h-4 w-4" /> {analysis.isPending ? "Analyzing…" : "Analyze links"}
          </button>
        </form>
        {analysis.isError && (
          <p className="mt-4 text-sm text-destructive">{(analysis.error as Error).message}</p>
        )}
        {analysis.data && (
          <div className="mt-8 grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
            <section className="glass rounded-2xl p-6">
              <p className="text-xs uppercase text-muted-foreground">Authority score</p>
              <p className="mt-2 text-6xl font-semibold text-emerald">{analysis.data.score}</p>
              <p className="mt-4 text-sm">{analysis.data.summary}</p>
            </section>
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold">
                <Link2 className="h-4 w-4 text-primary" /> Link findings
              </h2>
              {analysis.data.findings.map((f, i) => (
                <article key={i} className="glass rounded-xl p-4">
                  <p className="text-xs uppercase text-muted-foreground">{f.severity}</p>
                  <h3 className="mt-1 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.detail}</p>
                </article>
              ))}
            </section>
            <section className="lg:col-span-2">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <Wrench className="h-4 w-4 text-emerald" /> Recommended link actions
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {analysis.data.fixes.map((f, i) => (
                  <article key={i} className="glass rounded-xl p-4">
                    <div className="flex justify-between gap-3">
                      <h3 className="font-semibold">{f.title}</h3>
                      <span className="text-xs text-muted-foreground">{f.effort} effort</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{f.action}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
