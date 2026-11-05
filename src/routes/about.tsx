import { createFileRoute } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Rankora — The SEO Engine" },
      {
        name: "description",
        content:
          "Rankora's mission: give every founder, agency, and eCommerce brand an AI SEO engineering team on demand.",
      },
      { property: "og:title", content: "About Rankora" },
      { property: "og:description", content: "The story and mission behind Rankora." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/about` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/about` }],
  }),
  component: About,
});

function About() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-4xl px-4">
        <SiteHeader />
        <section className="mt-20">
          <h1 className="font-display text-5xl font-semibold md:text-6xl">
            SEO shouldn't be <span className="text-gradient">a full-time job</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Rankora exists to compress an entire SEO engineering team into a swarm of specialized AI
            agents. Paste a URL, get a scored audit, and let Atlas AI orchestrate SpiderX, Optimus,
            Backlink Beast and the rest to ship real, prioritized fixes and a growth roadmap.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { k: "10", v: "Specialized AI agents" },
              { k: "100+", v: "Signals per audit" },
              { k: "0", v: "Manual setup steps" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-gradient">{s.k}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </section>
        <SiteFooter />
      </div>
    </div>
  );
}
