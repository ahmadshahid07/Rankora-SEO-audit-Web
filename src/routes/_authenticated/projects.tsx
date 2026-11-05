import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight, FolderKanban, Gauge, Globe, Plus, Trash2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { AuroraBackground } from "@/components/AuroraBackground";
import { createProject, deleteProject, listProjects } from "@/lib/projects.functions";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "SEO Projects — Rankora" },
      {
        name: "description",
        content: "Open recent Rankora projects and track their SEO audits and agent work.",
      },
      { property: "og:title", content: "Rankora SEO Projects" },
      {
        property: "og:description",
        content: "Track audits, agent work, and SEO progress by project.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listProjects);
  const createFn = useServerFn(createProject);
  const deleteFn = useServerFn(deleteProject);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const projects = useQuery({ queryKey: ["projects"], queryFn: () => listFn() });
  const create = useMutation({
    mutationFn: () =>
      createFn({ data: { name, url: /^https?:\/\//i.test(url) ? url : `https://${url}` } }),
    onSuccess: () => {
      setName("");
      setUrl("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <BrandLogo />
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Your SEO projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reopen any site to review agent work, audits, and ranking progress.
            </p>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> New project
          </button>
        </div>

        {open && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate();
            }}
            className="glass-strong gradient-border mt-6 grid gap-3 rounded-2xl p-5 sm:grid-cols-[1fr_1.4fr_auto]"
          >
            <input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="rounded-xl border border-border bg-input/60 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com"
              className="rounded-xl border border-border bg-input/60 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              disabled={create.isPending}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Save project
            </button>
            {create.isError && (
              <p className="text-sm text-destructive sm:col-span-3">
                {(create.error as Error).message}
              </p>
            )}
          </form>
        )}

        {projects.isLoading ? (
          <div className="mt-8 text-sm text-muted-foreground">Loading projects…</div>
        ) : (projects.data ?? []).length === 0 ? (
          <div className="glass mt-8 rounded-2xl p-8 text-center">
            <FolderKanban className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Create your first project to keep every audit and agent result together.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {(projects.data ?? []).map((project) => (
              <article key={project.id} className="glass group rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">{project.name}</h2>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" /> {project.url}
                    </p>
                  </div>
                  <button
                    onClick={() => remove.mutate(project.id)}
                    aria-label={`Delete ${project.name}`}
                    className="rounded-lg p-2 text-muted-foreground opacity-70 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Gauge className="h-4 w-4 text-emerald" /> Latest score{" "}
                    <strong className="text-foreground">{project.last_audit_score ?? "—"}</strong>
                  </div>
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: project.id }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
