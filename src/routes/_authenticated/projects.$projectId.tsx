import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bot, CheckCircle2, Gauge } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { AuroraBackground } from "@/components/AuroraBackground";
import { getProjectDetail } from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project Progress — Rankora" },
      {
        name: "description",
        content:
          "Review SEO audit history, agent progress, findings, and fixes for a Rankora project.",
      },
      { property: "og:title", content: "Rankora Project Progress" },
      {
        property: "og:description",
        content: "SEO audit history, agent progress, findings, and fixes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const detailFn = useServerFn(getProjectDetail);
  const q = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => detailFn({ data: { id: projectId } }),
  });
  const data = q.data;

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <BrandLogo />
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Projects
          </Link>
        </div>
        {q.isLoading ? (
          <p className="text-sm text-muted-foreground">Opening project…</p>
        ) : q.isError ? (
          <p className="text-sm text-destructive">{(q.error as Error).message}</p>
        ) : (
          data && (
            <>
              <div className="glass-strong gradient-border rounded-2xl p-6">
                <p className="text-xs uppercase text-muted-foreground">SEO project</p>
                <h1 className="mt-2 font-display text-3xl font-semibold">{data.project.name}</h1>
                <p className="mt-1 break-all text-sm text-muted-foreground">{data.project.url}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/agent-hub"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                  >
                    <Bot className="h-4 w-4" /> Run agents
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-accent"
                  >
                    <Gauge className="h-4 w-4" /> Run audit
                  </Link>
                </div>
              </div>
              <section className="mt-8">
                <h2 className="text-lg font-semibold">Agent progress</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {data.runs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No agent work recorded for this project yet.
                    </p>
                  ) : (
                    data.runs.map((run) => (
                      <article key={run.id} className="glass rounded-2xl p-5">
                        <div className="flex items-center justify-between gap-3">
                          <strong>{run.agent}</strong>
                          <span className="text-xl font-semibold text-emerald">
                            {run.score ?? "—"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{run.summary}</p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {new Date(run.created_at).toLocaleString()}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </section>
              <section className="mt-8">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-emerald" /> Completed audits
                </h2>
                <div className="mt-4 space-y-3">
                  {data.audits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No completed audits linked to this project yet.
                    </p>
                  ) : (
                    data.audits.map((audit) => (
                      <article
                        key={audit.id}
                        className="glass flex items-center justify-between gap-4 rounded-2xl p-5"
                      >
                        <div>
                          <p className="text-sm font-medium">{audit.summary || audit.url}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(audit.created_at).toLocaleString()}
                          </p>
                        </div>
                        <strong className="text-2xl text-emerald">{audit.score ?? "—"}</strong>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </>
          )
        )}
      </main>
    </div>
  );
}
