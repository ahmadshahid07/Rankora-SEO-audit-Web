import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Activity,
  BadgeDollarSign,
  Cpu,
  FolderKanban,
  Info,
  ListChecks,
  Mail,
  Megaphone,
  Radio,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import {
  getMyRoles,
  getAdminOverview,
  setUserRole,
  updateJobStatus,
  replyToMessage,
  setMessageStatus,
  upsertAnnouncement,
  deleteAnnouncement,
  upsertSiteDetail,
  deleteSiteDetail,
} from "@/lib/admin.functions";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BrandLogo } from "@/components/BrandLogo";
import { SITE_CONTENT_FIELDS } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Control Center — Rankora" },
      {
        name: "description",
        content:
          "Rankora owner console: revenue, live users, projects, support inbox, announcements, site details, AI usage and the audit job queue.",
      },
      { property: "og:title", content: "Rankora Admin Control Center" },
      {
        property: "og:description",
        content: "Revenue, users, projects, messages and announcements in one console.",
      },
    ],
  }),
  component: AdminPanel,
});

const TABS = [
  "Overview",
  "Revenue",
  "Users",
  "Live now",
  "Projects",
  "Messages",
  "Announcements",
  "Website content",
  "Site details",
  "AI usage",
  "Audits",
  "Job queue",
] as const;
type Tab = (typeof TABS)[number];

const money = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function AdminPanel() {
  const qc = useQueryClient();
  const rolesFn = useServerFn(getMyRoles);
  const overviewFn = useServerFn(getAdminOverview);
  const setRoleFn = useServerFn(setUserRole);
  const jobFn = useServerFn(updateJobStatus);
  const replyFn = useServerFn(replyToMessage);
  const msgStatusFn = useServerFn(setMessageStatus);
  const annFn = useServerFn(upsertAnnouncement);
  const annDelFn = useServerFn(deleteAnnouncement);
  const detFn = useServerFn(upsertSiteDetail);
  const detDelFn = useServerFn(deleteSiteDetail);

  const [tab, setTab] = useState<Tab>("Overview");

  const me = useQuery({ queryKey: ["my-roles"], queryFn: () => rolesFn() });
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn(),
    enabled: !!me.data?.isAdmin,
    retry: false,
    refetchInterval: 60_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-overview"] });

  const roleMutation = useMutation({
    mutationFn: (v: { userId: string; role: "moderator" | "user"; grant: boolean }) =>
      setRoleFn({ data: v }),
    onSuccess: invalidate,
  });
  const jobMutation = useMutation({
    mutationFn: (v: {
      jobId: string;
      status: "queued" | "running" | "completed" | "failed" | "cancelled";
    }) => jobFn({ data: v }),
    onSuccess: invalidate,
  });
  const reply = useMutation({
    mutationFn: (v: { id: string; reply: string }) => replyFn({ data: v }),
    onSuccess: invalidate,
  });
  const msgStatus = useMutation({
    mutationFn: (v: { id: string; status: "open" | "replied" | "closed" }) =>
      msgStatusFn({ data: v }),
    onSuccess: invalidate,
  });
  const saveAnn = useMutation({
    mutationFn: (v: any) => annFn({ data: v }),
    onSuccess: invalidate,
  });
  const delAnn = useMutation({
    mutationFn: (v: { id: string }) => annDelFn({ data: v }),
    onSuccess: invalidate,
  });
  const saveDet = useMutation({
    mutationFn: (v: any) => detFn({ data: v }),
    onSuccess: invalidate,
  });
  const delDet = useMutation({
    mutationFn: (v: { id: string }) => detDelFn({ data: v }),
    onSuccess: invalidate,
  });

  if (me.isLoading) {
    return (
      <Shell>
        <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
          Verifying owner credentials…
        </div>
      </Shell>
    );
  }

  if (!me.data?.isAdmin) {
    return (
      <Shell>
        <div className="glass-strong gradient-border mx-auto max-w-lg rounded-3xl p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 h-7 w-7 text-primary" />
          <h2 className="font-display text-xl font-semibold">Restricted area</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The Rankora control center is reserved for the single owner account. Sign in with the
            owner credentials to continue — no other account can see or open this panel.
          </p>
          <p className="mt-6 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
            This account does not have owner access.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block text-xs text-primary hover:underline">
            Back to dashboard
          </Link>
        </div>
      </Shell>
    );
  }

  const data = overview.data;

  return (
    <Shell>
      {overview.isLoading || !data ? (
        <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
          Loading platform data…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <Stat
              icon={<BadgeDollarSign className="h-4 w-4 text-emerald" />}
              label="Revenue (month)"
              value={money(data.revenue.month)}
            />
            <Stat
              icon={<Users className="h-4 w-4 text-primary" />}
              label="Users"
              value={data.stats.totalUsers}
            />
            <Stat
              icon={<Radio className="h-4 w-4 text-emerald" />}
              label="Online now"
              value={data.stats.onlineNow}
            />
            <Stat
              icon={<FolderKanban className="h-4 w-4 text-violet" />}
              label="Projects"
              value={data.stats.totalProjects}
            />
            <Stat
              icon={<Mail className="h-4 w-4 text-yellow-400" />}
              label="Open messages"
              value={data.stats.openMessages}
            />
            <Stat
              icon={<Cpu className="h-4 w-4 text-primary" />}
              label="AI calls"
              value={data.stats.aiCalls}
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full border px-4 py-1.5 text-xs transition ${
                  tab === t
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border/60 text-muted-foreground hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 glass rounded-2xl p-6">
            {tab === "Overview" && <OverviewTab data={data} />}
            {tab === "Revenue" && <RevenueTab data={data} />}
            {tab === "Users" && <UsersTab data={data} roleMutation={roleMutation} />}
            {tab === "Live now" && <LiveTab data={data} />}
            {tab === "Projects" && <ProjectsTab data={data} />}
            {tab === "Messages" && <MessagesTab data={data} reply={reply} msgStatus={msgStatus} />}
            {tab === "Announcements" && (
              <AnnouncementsTab data={data} save={saveAnn} remove={delAnn} />
            )}
            {tab === "Website content" && <ContentTab data={data} save={saveDet} />}
            {tab === "Site details" && <DetailsTab data={data} save={saveDet} remove={delDet} />}
            {tab === "AI usage" && <UsageTab data={data} />}
            {tab === "Audits" && <AuditsTab data={data} />}
            {tab === "Job queue" && <JobsTab data={data} jobMutation={jobMutation} />}
          </div>
          {overview.isError && (
            <p className="mt-4 text-sm text-destructive">{(overview.error as Error).message}</p>
          )}
        </>
      )}
    </Shell>
  );
}

/* ---------------- Tabs ---------------- */

function OverviewTab({ data }: { data: any }) {
  const recentUsers = data.users.slice(0, 6);
  const recentMsgs = data.messages.slice(0, 5);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <SectionTitle
          icon={<BadgeDollarSign className="h-4 w-4 text-emerald" />}
          title="Revenue snapshot"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mini label="Today" value={money(data.revenue.today)} />
          <Mini label="This month" value={money(data.revenue.month)} />
          <Mini label="This year" value={money(data.revenue.year)} />
          <Mini label="All time" value={money(data.revenue.allTime)} />
        </div>
        <div className="mt-5">
          <Bars series={data.revenue.monthly} />
        </div>
      </div>
      <div>
        <SectionTitle icon={<Users className="h-4 w-4 text-primary" />} title="Newest users" />
        <ul className="space-y-2">
          {recentUsers.map((u: any) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2 text-sm"
            >
              <span className="truncate">{u.full_name ?? u.email ?? "—"}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
          {recentUsers.length === 0 && <Empty>No users yet.</Empty>}
        </ul>
        <div className="mt-6">
          <SectionTitle
            icon={<Mail className="h-4 w-4 text-yellow-400" />}
            title="Latest messages"
          />
          <ul className="space-y-2">
            {recentMsgs.map((m: any) => (
              <li key={m.id} className="rounded-xl border border-border/50 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{m.subject}</span>
                  <Badge tone={m.status === "open" ? "warn" : "ok"}>{m.status}</Badge>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{m.body}</p>
              </li>
            ))}
            {recentMsgs.length === 0 && <Empty>No messages yet.</Empty>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RevenueTab({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Mini label="Today" value={money(data.revenue.today)} />
        <Mini label="This month" value={money(data.revenue.month)} />
        <Mini label="This year" value={money(data.revenue.year)} />
        <Mini label="All time" value={money(data.revenue.allTime)} />
      </div>
      <div>
        <SectionTitle icon={<Activity className="h-4 w-4 text-primary" />} title="Last 12 months" />
        <Bars series={data.revenue.monthly} />
      </div>
      <div>
        <SectionTitle icon={<Activity className="h-4 w-4 text-emerald" />} title="Last 14 days" />
        <Bars series={data.revenue.daily} tone="emerald" />
      </div>
      <div className="overflow-x-auto">
        <SectionTitle
          icon={<BadgeDollarSign className="h-4 w-4 text-violet" />}
          title="Recent payments"
        />
        <table className="w-full text-sm">
          <Head cols={["Plan", "Amount", "Status", "When"]} />
          <tbody>
            {data.payments.slice(0, 25).map((p: any) => (
              <tr key={p.id} className="border-t border-border/50">
                <td className="py-2">{p.plan}</td>
                <td className="py-2 font-medium">{money((p.amount_cents ?? 0) / 100)}</td>
                <td className="py-2 text-xs">{p.status}</td>
                <td className="py-2 text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.payments.length === 0 && (
          <Empty>
            No payments recorded yet. Revenue will appear here as soon as billing records land.
          </Empty>
        )}
      </div>
    </div>
  );
}

function UsersTab({ data, roleMutation }: { data: any; roleMutation: any }) {
  const [q, setQ] = useState("");
  const rolesByUser = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const r of data.roles ?? []) m.set(r.user_id, [...(m.get(r.user_id) ?? []), r.role]);
    return m;
  }, [data.roles]);

  const projectsByUser = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of data.projects ?? []) m.set(p.user_id, (m.get(p.user_id) ?? 0) + 1);
    return m;
  }, [data.projects]);

  const rows = (data.users ?? []).filter((u: any) =>
    `${u.full_name ?? ""} ${u.email ?? ""} ${u.phone ?? ""} ${u.city ?? ""}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, email, phone or city…"
        className="mb-4 w-full max-w-sm rounded-xl border border-border bg-input/60 px-4 py-2 text-sm outline-none focus:border-primary"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <Head cols={["User", "Contact", "Location", "Projects", "Roles", "Joined", "Actions"]} />
          <tbody>
            {rows.map((u: any) => {
              const roles = rolesByUser.get(u.id) ?? [];
              const isMod = roles.includes("moderator");
              return (
                <tr key={u.id} className="border-t border-border/50 align-top">
                  <td className="py-3">
                    <div className="font-medium">{u.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="py-3 text-xs">
                    {u.phone ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {[u.address, u.city, u.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="py-3">{projectsByUser.get(u.id) ?? 0}</td>
                  <td className="py-3 text-xs">
                    {roles.includes("admin") ? (
                      <Badge tone="ok">owner</Badge>
                    ) : roles.length ? (
                      roles.join(", ")
                    ) : (
                      "user"
                    )}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    {!roles.includes("admin") && (
                      <button
                        disabled={roleMutation.isPending}
                        onClick={() =>
                          roleMutation.mutate({ userId: u.id, role: "moderator", grant: !isMod })
                        }
                        className="rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-accent disabled:opacity-50"
                      >
                        {isMod ? "Revoke moderator" : "Make moderator"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No users match that search.</Empty>}
        {roleMutation.isError && (
          <p className="mt-3 text-sm text-destructive">{(roleMutation.error as Error).message}</p>
        )}
      </div>
      <p className="mt-4 flex items-start gap-2 rounded-xl border border-border/50 bg-card/30 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Admin rights are permanently locked to the Rankora owner account and cannot be granted to
        anyone else.
      </p>
    </div>
  );
}

function LiveTab({ data }: { data: any }) {
  const cutoff = Date.now() - 15 * 60 * 1000;
  const profiles = new Map<string, any>((data.users ?? []).map((u: any) => [u.id, u]));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <Head cols={["User", "Status", "Device", "Provider", "Last seen"]} />
        <tbody>
          {(data.logins ?? []).map((l: any) => {
            const online = new Date(l.last_seen_at).getTime() >= cutoff;
            const p = profiles.get(l.user_id);
            return (
              <tr key={l.id} className="border-t border-border/50">
                <td className="py-2">
                  <div className="font-medium">{p?.full_name ?? l.email ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{l.email}</div>
                </td>
                <td className="py-2">
                  <Badge tone={online ? "ok" : "muted"}>{online ? "online" : "offline"}</Badge>
                </td>
                <td className="max-w-[260px] truncate py-2 text-xs text-muted-foreground">
                  {l.user_agent ?? "—"}
                </td>
                <td className="py-2 text-xs">{l.provider ?? "—"}</td>
                <td className="py-2 text-xs text-muted-foreground">
                  {new Date(l.last_seen_at).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {(data.logins ?? []).length === 0 && <Empty>No sign-in activity recorded yet.</Empty>}
    </div>
  );
}

function ProjectsTab({ data }: { data: any }) {
  const profiles = new Map<string, any>((data.users ?? []).map((u: any) => [u.id, u]));
  const runsByProject = new Map<string, number>();
  for (const r of data.agentRuns ?? []) {
    if (r.user_id) runsByProject.set(r.user_id, (runsByProject.get(r.user_id) ?? 0) + 1);
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {(data.projects ?? []).map((p: any) => {
        const owner = profiles.get(p.user_id);
        return (
          <div key={p.id} className="rounded-2xl border border-border/50 bg-card/30 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-medium">{p.name}</div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-xs text-primary hover:underline"
                >
                  {p.url}
                </a>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-lg font-semibold">{p.last_audit_score ?? "—"}</div>
                <div className="text-[10px] uppercase text-muted-foreground">score</div>
              </div>
            </div>
            {p.description && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge tone="muted">{p.status}</Badge>
              <span>{owner?.full_name ?? owner?.email ?? "unknown owner"}</span>
              <span>·</span>
              <span>{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        );
      })}
      {(data.projects ?? []).length === 0 && <Empty>No projects created yet.</Empty>}
    </div>
  );
}

function MessagesTab({ data, reply, msgStatus }: { data: any; reply: any; msgStatus: any }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const profiles = new Map<string, any>((data.users ?? []).map((u: any) => [u.id, u]));

  return (
    <div className="space-y-3">
      {(data.messages ?? []).map((m: any) => {
        const u = profiles.get(m.user_id);
        const open = openId === m.id;
        return (
          <div key={m.id} className="rounded-2xl border border-border/50 bg-card/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium">{m.subject}</div>
                <div className="text-xs text-muted-foreground">
                  {u?.full_name ?? "—"} · {u?.email ?? ""} ·{" "}
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={m.status === "open" ? "warn" : m.status === "replied" ? "ok" : "muted"}
                >
                  {m.status}
                </Badge>
                <button
                  onClick={() => {
                    setOpenId(open ? null : m.id);
                    setText(m.admin_reply ?? "");
                  }}
                  className="rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-accent"
                >
                  {open ? "Close" : "Read & reply"}
                </button>
              </div>
            </div>
            {open && (
              <div className="mt-4 space-y-3">
                <p className="whitespace-pre-wrap rounded-xl border border-border/50 bg-background/40 p-3 text-sm">
                  {m.body}
                </p>
                {m.admin_reply && (
                  <p className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">
                    <span className="text-xs font-medium text-primary">Your reply</span>
                    <br />
                    {m.admin_reply}
                  </p>
                )}
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a reply to this user…"
                  className="w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={reply.isPending || !text.trim()}
                    onClick={() => reply.mutate({ id: m.id, reply: text.trim() })}
                    className="rounded-xl bg-gradient-to-r from-primary to-violet px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {reply.isPending ? "Sending…" : "Send reply"}
                  </button>
                  <button
                    onClick={() => msgStatus.mutate({ id: m.id, status: "closed" })}
                    className="rounded-xl border border-border/60 px-4 py-2 text-xs hover:bg-accent"
                  >
                    Mark closed
                  </button>
                </div>
                {reply.isError && (
                  <p className="text-xs text-destructive">{(reply.error as Error).message}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
      {(data.messages ?? []).length === 0 && <Empty>No user messages yet.</Empty>}
    </div>
  );
}

const EMPTY_ANN = {
  id: undefined as string | undefined,
  title: "",
  body: "",
  kind: "announcement",
  published: true,
  pinned: true,
  days: 7,
  hours: 0,
  startNow: true,
  starts_at: "",
};

function AnnouncementsTab({ data, save, remove }: { data: any; save: any; remove: any }) {
  const [form, setForm] = useState(EMPTY_ANN);
  const reset = () => setForm(EMPTY_ANN);

  function submit() {
    const start = form.startNow || !form.starts_at ? new Date() : new Date(form.starts_at);
    const durationMs = (Number(form.days) || 0) * 86400000 + (Number(form.hours) || 0) * 3600000;
    const ends = durationMs > 0 ? new Date(start.getTime() + durationMs).toISOString() : null;
    save.mutate(
      {
        id: form.id,
        title: form.title,
        body: form.body,
        kind: form.kind,
        published: form.published,
        pinned: form.pinned,
        starts_at: start.toISOString(),
        ends_at: ends,
      },
      { onSuccess: reset },
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="rounded-2xl border border-border/50 bg-card/30 p-4">
        <SectionTitle
          icon={<Megaphone className="h-4 w-4 text-primary" />}
          title={form.id ? "Edit entry" : "Trigger an announcement"}
        />
        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <textarea
            rows={5}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="What's new?"
            className="w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="flex items-center gap-2">
            <select
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
              className="rounded-xl border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="announcement">Announcement</option>
              <option value="feature">Feature</option>
              <option value="update">Update</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              />
              Banner
            </label>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Display timer</div>
            <label className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={form.startNow}
                onChange={(e) => setForm({ ...form, startNow: e.target.checked })}
              />
              Start immediately
            </label>
            {!form.startNow && (
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="mb-2 w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            )}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="mb-1 text-[11px] text-muted-foreground">Days</div>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-[11px] text-muted-foreground">Hours</div>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {Number(form.days) + Number(form.hours) > 0
                ? `Visible for ${form.days}d ${form.hours}h, then it disappears automatically.`
                : "No timer — stays visible until you unpublish it."}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              disabled={save.isPending || !form.title.trim() || !form.body.trim()}
              onClick={submit}
              className="rounded-xl bg-gradient-to-r from-primary to-violet px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {save.isPending ? "Saving…" : form.id ? "Update" : "Publish"}
            </button>
            {form.id && (
              <button
                onClick={reset}
                className="rounded-xl border border-border/60 px-4 py-2 text-xs hover:bg-accent"
              >
                Cancel
              </button>
            )}
          </div>
          {save.isError && (
            <p className="text-xs text-destructive">{(save.error as Error).message}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {(data.announcements ?? []).map((a: any) => {
          const live =
            a.published &&
            new Date(a.starts_at ?? a.created_at).getTime() <= Date.now() &&
            (!a.ends_at || new Date(a.ends_at).getTime() > Date.now());
          return (
            <div key={a.id} className="rounded-2xl border border-border/50 bg-card/30 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge tone="muted">{a.kind}</Badge>
                    <Badge tone={live ? "ok" : "warn"}>
                      {live ? "live" : a.published ? "scheduled/expired" : "draft"}
                    </Badge>
                    {a.pinned && <Badge tone="muted">banner</Badge>}
                    <span>
                      {new Date(a.starts_at ?? a.created_at).toLocaleString()}
                      {a.ends_at ? ` → ${new Date(a.ends_at).toLocaleString()}` : " → no end"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setForm({
                        ...EMPTY_ANN,
                        id: a.id,
                        title: a.title,
                        body: a.body,
                        kind: a.kind,
                        published: a.published,
                        pinned: !!a.pinned,
                        days: a.ends_at
                          ? Math.max(
                              0,
                              Math.floor(
                                (new Date(a.ends_at).getTime() -
                                  new Date(a.starts_at ?? a.created_at).getTime()) /
                                  86400000,
                              ),
                            )
                          : 0,
                        hours: 0,
                        startNow: true,
                      })
                    }
                    className="rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-accent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove.mutate({ id: a.id })}
                    className="grid h-7 w-7 place-items-center rounded-full border border-border/60 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>
            </div>
          );
        })}
        {(data.announcements ?? []).length === 0 && <Empty>Nothing published yet.</Empty>}
      </div>
    </div>
  );
}

function ContentTab({ data, save }: { data: any; save: any }) {
  const existing = new Map<string, any>();
  for (const d of (data.details ?? []) as any[])
    if (d.category === "content") existing.set(d.label, d);

  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of SITE_CONTENT_FIELDS) init[f.key] = existing.get(f.key)?.value ?? f.fallback;
    return init;
  });
  const [savedKey, setSavedKey] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card/30 p-4">
        <SectionTitle
          icon={<Info className="h-4 w-4 text-primary" />}
          title="Edit live website copy"
        />
        <p className="mb-4 text-xs text-muted-foreground">
          These fields render directly on the public website. Changes go live for every visitor.
        </p>
        <div className="space-y-4">
          {SITE_CONTENT_FIELDS.map((f) => (
            <div key={f.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">{f.label}</span>
                {savedKey === f.key && <span className="text-emerald">Saved</span>}
              </div>
              <textarea
                rows={f.key.includes("subtitle") ? 3 : 1}
                value={draft[f.key] ?? ""}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                className="w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                disabled={save.isPending}
                onClick={() =>
                  save.mutate(
                    {
                      id: existing.get(f.key)?.id,
                      label: f.key,
                      value: (draft[f.key] ?? "").trim() || f.fallback,
                      category: "content",
                    },
                    { onSuccess: () => setSavedKey(f.key) },
                  )
                }
                className="mt-2 rounded-lg bg-gradient-to-r from-primary to-violet px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                Save
              </button>
            </div>
          ))}
        </div>
        {save.isError && (
          <p className="mt-3 text-xs text-destructive">{(save.error as Error).message}</p>
        )}
      </div>
    </div>
  );
}

function DetailsTab({ data, save, remove }: { data: any; save: any; remove: any }) {
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    label: "",
    value: "",
    category: "general",
  });
  const reset = () => setForm({ id: undefined, label: "", value: "", category: "general" });

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="rounded-2xl border border-border/50 bg-card/30 p-4">
        <SectionTitle
          icon={<Info className="h-4 w-4 text-primary" />}
          title={form.id ? "Edit detail" : "Add website detail"}
        />
        <div className="space-y-3">
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Label (e.g. Support email)"
            className="w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Value"
            className="w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category"
            className="w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              disabled={save.isPending || !form.label.trim() || !form.value.trim()}
              onClick={() => save.mutate({ ...form }, { onSuccess: reset })}
              className="rounded-xl bg-gradient-to-r from-primary to-violet px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {save.isPending ? "Saving…" : form.id ? "Update" : "Add detail"}
            </button>
            {form.id && (
              <button
                onClick={reset}
                className="rounded-xl border border-border/60 px-4 py-2 text-xs hover:bg-accent"
              >
                Cancel
              </button>
            )}
          </div>
          {save.isError && (
            <p className="text-xs text-destructive">{(save.error as Error).message}</p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <Head cols={["Label", "Value", "Category", ""]} />
          <tbody>
            {(data.details ?? []).map((d: any) => (
              <tr key={d.id} className="border-t border-border/50">
                <td className="py-2 font-medium">{d.label}</td>
                <td className="max-w-[320px] truncate py-2 text-muted-foreground">{d.value}</td>
                <td className="py-2 text-xs">{d.category}</td>
                <td className="py-2">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        setForm({ id: d.id, label: d.label, value: d.value, category: d.category })
                      }
                      className="rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-accent"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove.mutate({ id: d.id })}
                      className="grid h-7 w-7 place-items-center rounded-full border border-border/60 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data.details ?? []).length === 0 && <Empty>No website details added yet.</Empty>}
      </div>
    </div>
  );
}

function UsageTab({ data }: { data: any }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <Head cols={["Agent", "Model", "Tokens", "Latency", "OK", "When"]} />
        <tbody>
          {data.usage.map((u: any) => (
            <tr key={u.id} className="border-t border-border/50">
              <td className="py-2">{u.agent ?? "—"}</td>
              <td className="py-2 text-xs text-muted-foreground">{u.model}</td>
              <td className="py-2">{u.total_tokens ?? 0}</td>
              <td className="py-2">{u.latency_ms ? `${u.latency_ms} ms` : "—"}</td>
              <td className="py-2">{u.success ? "✓" : "✗"}</td>
              <td className="py-2 text-xs text-muted-foreground">
                {new Date(u.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.usage.length === 0 && <Empty>No AI usage recorded yet.</Empty>}
    </div>
  );
}

function AuditsTab({ data }: { data: any }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <Head cols={["URL", "Score", "Status", "When"]} />
        <tbody>
          {data.audits.map((a: any) => (
            <tr key={a.id} className="border-t border-border/50">
              <td className="max-w-[320px] truncate py-2">{a.url}</td>
              <td className="py-2 font-semibold">{a.score}</td>
              <td className="py-2 text-xs">{a.status}</td>
              <td className="py-2 text-xs text-muted-foreground">
                {new Date(a.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.audits.length === 0 && <Empty>No audits yet.</Empty>}
    </div>
  );
}

function JobsTab({ data, jobMutation }: { data: any; jobMutation: any }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <Head cols={["URL", "Status", "Priority", "Attempts", "Actions"]} />
        <tbody>
          {data.jobs.map((j: any) => (
            <tr key={j.id} className="border-t border-border/50">
              <td className="max-w-[280px] truncate py-2">{j.url}</td>
              <td className="py-2 text-xs">{j.status}</td>
              <td className="py-2">{j.priority}</td>
              <td className="py-2">{j.attempts}</td>
              <td className="py-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => jobMutation.mutate({ jobId: j.id, status: "running" })}
                    className="rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-accent"
                  >
                    Run
                  </button>
                  <button
                    onClick={() => jobMutation.mutate({ jobId: j.id, status: "cancelled" })}
                    className="rounded-full border border-border/60 px-3 py-1 text-xs hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.jobs.length === 0 && <Empty>The queue is empty.</Empty>}
    </div>
  );
}

/* ---------------- UI atoms ---------------- */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <BrandLogo />
        </div>
        <div className="mb-2 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
        <h1 className="font-display text-2xl font-semibold">Control center</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Revenue, users, projects, support inbox, announcements, website details, AI usage and the
          audit queue.
        </p>
        {children}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/30 px-3 py-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Bars({
  series,
  tone = "primary",
}: {
  series: { label: string; total: number }[];
  tone?: "primary" | "emerald";
}) {
  const max = Math.max(1, ...series.map((s) => s.total));
  return (
    <div className="flex h-36 items-end gap-1.5">
      {series.map((s, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
          <div className="relative flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-t-md ${tone === "emerald" ? "bg-gradient-to-t from-emerald/30 to-emerald" : "bg-gradient-to-t from-primary/25 to-violet"}`}
              style={{ height: `${Math.max(2, (s.total / max) * 100)}%` }}
              title={`${s.label}: ${money(s.total)}`}
            />
          </div>
          <span className="text-[9px] text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
      {icon}
      {title}
    </div>
  );
}

function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "ok" | "warn" | "muted";
}) {
  const cls =
    tone === "ok"
      ? "border-emerald/40 bg-emerald/10 text-emerald"
      : tone === "warn"
        ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
        : "border-border/60 text-muted-foreground";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-4 text-sm text-muted-foreground">{children}</p>;
}

function Head({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="text-left text-xs text-muted-foreground">
        {cols.map((c) => (
          <th key={c} className="pb-2">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}
