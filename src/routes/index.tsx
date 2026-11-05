import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Search,
  Gauge,
  Bot,
  ShieldCheck,
  Rocket,
  Zap,
  ArrowRight,
  Globe,
  Link2,
  FileText,
} from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { FaqSection, faqJsonLd } from "@/components/FaqSection";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rankora — AI SEO Audits & Automation" },
      {
        name: "description",
        content:
          "Paste any URL for an instant AI SEO audit: score, technical fixes, keyword intelligence and a prioritized growth roadmap from 10 specialized agents.",
      },
      { property: "og:title", content: "Rankora — AI SEO Audits & Automation" },
      {
        property: "og:description",
        content:
          "Instant AI SEO audits, automated fixes and an AI growth roadmap for your website.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(faqJsonLd) }],
  }),
  component: Home,
});

function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <div className="sticky-cta fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 print:hidden">
      <div className="glass-strong flex items-center gap-3 rounded-full px-4 py-2 shadow-2xl">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Ready to see your SEO score?
        </span>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="magnetic rounded-full bg-gradient-to-r from-primary to-violet px-4 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Analyze your site
        </button>
      </div>
    </div>
  );
}

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

const agents = [
  { name: "Atlas AI", role: "SEO Brain", icon: Sparkles, color: "from-royal to-violet" },
  { name: "SpiderX", role: "Technical SEO", icon: Bot, color: "from-emerald to-royal" },
  { name: "Optimus", role: "On-Page", icon: FileText, color: "from-violet to-primary" },
  { name: "Backlink Beast", role: "Off-Page", icon: Link2, color: "from-primary to-emerald" },
  { name: "WriterMind", role: "AI Content", icon: Zap, color: "from-violet to-emerald" },
  { name: "Keyword Hunter", role: "Keyword Intel", icon: Search, color: "from-royal to-primary" },
  { name: "Shadow Scan", role: "Competitors", icon: Globe, color: "from-primary to-violet" },
  { name: "Velocity", role: "Performance", icon: Gauge, color: "from-emerald to-primary" },
  { name: "Guardian", role: "Security", icon: ShieldCheck, color: "from-royal to-emerald" },
  { name: "GrowthPilot", role: "Marketing", icon: Rocket, color: "from-violet to-royal" },
];

function Home() {
  const navigate = useNavigate();
  const c = useSiteContent();
  const [url, setUrl] = useState("");
  const [stageIndex, setStageIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    let target = url.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) target = "https://" + target;
    try {
      new URL(target);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    // Route through auth if not signed in — save URL first
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      sessionStorage.setItem("rankora:pendingUrl", target);
      navigate({ to: "/auth", search: { redirect: "/dashboard" } as never });
      return;
    }

    // Simulate live stages while server function runs
    setStageIndex(0);
    const interval = setInterval(() => {
      setStageIndex((i) => (i === null ? 0 : Math.min(i + 1, stages.length - 1)));
    }, 700);
    sessionStorage.setItem("rankora:pendingUrl", target);
    // Give the animation a beat, then send to dashboard which triggers audit
    setTimeout(() => {
      clearInterval(interval);
      navigate({ to: "/dashboard" });
    }, 1200);
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-6xl px-4">
        <SiteHeader />

        {/* Hero */}
        <section className="relative mt-24 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse-glow" />
            {c("hero_badge")}
          </span>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            {c("hero_title")} <span className="text-gradient">{c("hero_highlight")}</span>
            <br />
            {c("hero_title_end")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{c("hero_subtitle")}</p>

          {/* URL input */}
          <form
            onSubmit={handleAnalyze}
            className="mt-10 flex w-full max-w-2xl items-center gap-2 rounded-full glass-strong p-2 pl-5 neon-glow"
          >
            <Globe className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              disabled={stageIndex !== null}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-violet px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition hover:brightness-110 disabled:opacity-60"
            >
              {c("hero_cta")} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          {stageIndex !== null && (
            <div className="mt-6 w-full max-w-2xl glass rounded-2xl p-5 text-left">
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
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
              <ul className="mt-4 space-y-1.5 text-sm">
                {stages.map((s, i) => (
                  <li
                    key={s}
                    className={i <= stageIndex ? "text-foreground" : "text-muted-foreground/50"}
                  >
                    {i < stageIndex ? "✓" : i === stageIndex ? "→" : "○"} {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>Built for teams shipping at</span>
            {["Vercel-grade sites", "Linear-fast apps", "Stripe-clean stores"].map((t) => (
              <span key={t} className="rounded-full border border-border/60 px-3 py-1">
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mt-24" aria-label="Platform stats">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { to: 10, suffix: "", label: "Specialized AI agents" },
              { to: 120, suffix: "+", label: "SEO signals checked" },
              { to: 60, suffix: "s", label: "Typical audit time" },
              { to: 99.9, suffix: "%", decimals: 1, label: "Audit uptime target" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="glass rounded-2xl p-5 text-center">
                  <div className="font-display text-3xl font-semibold text-gradient">
                    <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Agents grid */}
        <section className="mt-32">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-semibold">
                An AI agent for <span className="text-gradient">every SEO surface</span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                Not one chatbot. Ten specialists — each with memory, dashboards, and their own
                responsibilities.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
            {agents.map((a, i) => {
              const Icon = a.icon;
              return (
                <Reveal key={a.name} delay={(i % 5) * 70}>
                  <div className="group glass tilt-card h-full rounded-2xl p-4 hover:neon-glow">
                    <div
                      className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${a.color} text-white shadow-lg`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.role}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link to="/agents" className="text-sm text-muted-foreground hover:text-foreground">
              Meet every agent →
            </Link>
          </div>
        </section>

        {/* Marquee rail */}
        <section className="mt-20 marquee-mask overflow-hidden" aria-label="What Rankora checks">
          <div className="marquee-track gap-3">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex gap-3 pr-3">
                {[
                  "Core Web Vitals",
                  "Structured data",
                  "Meta & titles",
                  "Broken links",
                  "Robots & sitemaps",
                  "Backlink authority",
                  "Keyword gaps",
                  "Mobile usability",
                  "Image alt text",
                  "Canonical tags",
                ].map((t) => (
                  <span
                    key={t}
                    className="whitespace-nowrap rounded-full border border-border/60 px-4 py-1.5 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Feature preview */}
        <section className="mt-32">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-semibold md:text-4xl">
              What you get out of the box
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Gauge,
                title: "Instant SEO score",
                body: "AI-graded score, health, and issue count within seconds of pasting a URL.",
              },
              {
                icon: Bot,
                title: "Automated fixes",
                body: "SpiderX and Optimus explain each issue and generate the fix — code included.",
              },
              {
                icon: Rocket,
                title: "Growth roadmap",
                body: "GrowthPilot ships a prioritized roadmap with estimated traffic gains.",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 100}>
                  <div className="glass h-full rounded-2xl p-6 gradient-border">
                    <Icon className="h-6 w-6 text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <FaqSection />

        {/* CTA */}
        <section className="mt-32 mb-16">
          <Reveal>
            <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center gradient-border">
              <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 grid-bg" />
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Ready to rank like it's your unfair advantage?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Start free. Analyze any URL and watch Rankora work in real time.
              </p>
              <Link
                to="/auth"
                className="magnetic mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-violet px-6 py-3 text-sm font-medium text-primary-foreground shadow-xl"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>

        <StickyCta />
        <SiteFooter />
      </div>
    </div>
  );
}
