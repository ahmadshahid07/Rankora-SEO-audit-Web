import { createFileRoute } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  Bot,
  Gauge,
  Globe,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  FileText,
  Rocket,
  Zap,
} from "lucide-react";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "AI SEO Agents — Rankora" },
      {
        name: "description",
        content:
          "Meet Atlas, SpiderX, Optimus, Backlink Beast and the full Rankora AI SEO agent team.",
      },
      { property: "og:title", content: "Rankora AI Agents" },
      {
        property: "og:description",
        content: "Ten specialized AI agents automating your entire SEO workflow.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/agents` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/agents` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "AI Agents", item: `${SITE}/agents` },
          ],
        }),
      },
    ],
  }),
  component: AgentsPage,
});

const agents = [
  {
    name: "Atlas AI",
    role: "SEO Brain",
    icon: Sparkles,
    color: "from-royal to-violet",
    tasks: ["Website analysis", "Overall score", "AI recommendations", "Growth strategy"],
  },
  {
    name: "SpiderX",
    role: "Technical SEO Engineer",
    icon: Bot,
    color: "from-emerald to-royal",
    tasks: [
      "Broken links",
      "Sitemaps & robots",
      "Core Web Vitals",
      "Structured data",
      "Redirect chains",
    ],
  },
  {
    name: "Optimus",
    role: "On-Page Optimization",
    icon: FileText,
    color: "from-violet to-primary",
    tasks: ["Titles & descriptions", "Headings", "Alt tags", "Content structure", "Internal links"],
  },
  {
    name: "Backlink Beast",
    role: "Off-Page Automation",
    icon: Link2,
    color: "from-primary to-emerald",
    tasks: ["Backlink opportunities", "Authority score", "Guest posting", "Outreach automation"],
  },
  {
    name: "WriterMind",
    role: "AI Content",
    icon: Zap,
    color: "from-violet to-emerald",
    tasks: ["SEO blogs", "Landing pages", "Meta rewriting", "Schema", "FAQ"],
  },
  {
    name: "Keyword Hunter",
    role: "Keyword Intelligence",
    icon: Search,
    color: "from-royal to-primary",
    tasks: ["Volume & difficulty", "Intent analysis", "Topic clusters", "Long-tail & questions"],
  },
  {
    name: "Shadow Scan",
    role: "Competitor Tracker",
    icon: Globe,
    color: "from-primary to-violet",
    tasks: ["Rankings", "Traffic", "Backlinks", "Content strategy", "Keyword gap"],
  },
  {
    name: "Velocity",
    role: "Performance",
    icon: Gauge,
    color: "from-emerald to-primary",
    tasks: ["Lighthouse", "Core Web Vitals", "Image optimization", "Caching"],
  },
  {
    name: "Guardian",
    role: "Security",
    icon: ShieldCheck,
    color: "from-royal to-emerald",
    tasks: ["HTTPS", "Headers", "Vulnerabilities", "SSL", "Cookies"],
  },
  {
    name: "GrowthPilot",
    role: "Marketing",
    icon: Rocket,
    color: "from-violet to-royal",
    tasks: ["SEO campaigns", "Email marketing", "Content calendar", "Roadmap"],
  },
];

function AgentsPage() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-6xl px-4">
        <SiteHeader />
        <section className="mt-20 text-center">
          <h1 className="font-display text-5xl font-semibold md:text-6xl">
            Meet the <span className="text-gradient">Rankora agents</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A specialized team of AI engineers — each with its own memory, dashboard, and mandate.
          </p>
        </section>
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">The agent roster</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {agents.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.name}
                  className="glass rounded-2xl p-6 transition hover:-translate-y-1 hover:neon-glow"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${a.color} text-white shadow-lg`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{a.name}</h3>
                      <div className="text-xs text-muted-foreground">{a.role}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {a.tasks.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border/60 bg-card/50 px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <SiteFooter />
      </div>
    </div>
  );
}
