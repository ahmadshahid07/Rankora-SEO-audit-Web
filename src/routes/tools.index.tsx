import { createFileRoute, Link } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { Tags, Bot, Braces, ArrowRight } from "lucide-react";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "Free SEO Tools — Meta, Robots.txt & Schema | Rankora" },
      {
        name: "description",
        content:
          "Free instant SEO tools: check meta tags, test robots.txt rules and validate schema markup on any URL. No signup required.",
      },
      { property: "og:title", content: "Free SEO Tools by Rankora" },
      {
        property: "og:description",
        content: "Check meta tags, robots.txt and schema markup instantly — free.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/tools` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/tools` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Free SEO Tools", item: `${SITE}/tools` },
          ],
        }),
      },
    ],
  }),
  component: ToolsIndex,
});

const TOOLS = [
  {
    to: "/tools/meta-tag-checker" as const,
    icon: Tags,
    name: "Meta Tag Checker",
    desc: "Title, description, canonical, Open Graph, H1s and alt text — scored in seconds.",
  },
  {
    to: "/tools/robots-txt-tester" as const,
    icon: Bot,
    name: "Robots.txt Tester",
    desc: "See your robots.txt and test whether any path is crawlable by Google.",
  },
  {
    to: "/tools/schema-validator" as const,
    icon: Braces,
    name: "Schema Validator",
    desc: "Parse every JSON-LD block on a page, catch syntax errors and spot missing schema types.",
  },
];

function ToolsIndex() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-5xl px-4">
        <SiteHeader />
        <section className="mt-20 text-center">
          <h1 className="font-display text-5xl font-semibold md:text-6xl">
            Free <span className="text-gradient">SEO tools</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Instant checks on any public URL. No account, no credit card — powered by the same
            crawler behind Rankora's AI audits.
          </p>
        </section>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TOOLS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <Link
                to={t.to}
                className="tilt-card block h-full rounded-3xl glass-strong gradient-border p-6 transition hover:-translate-y-1"
              >
                <t.icon className="h-6 w-6 text-primary" />
                <h2 className="mt-4 font-display text-xl font-semibold">{t.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                  Open tool <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
