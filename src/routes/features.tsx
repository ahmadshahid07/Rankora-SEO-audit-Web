import { createFileRoute } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Check } from "lucide-react";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Rankora AI SEO Automation" },
      {
        name: "description",
        content:
          "Explore Rankora's SEO automation features: audits, technical SEO, on-page, off-page, content, keywords, competitors, and reports.",
      },
      { property: "og:title", content: "Rankora Features" },
      { property: "og:description", content: "The complete AI SEO automation feature set." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/features` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/features` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Features", item: `${SITE}/features` },
          ],
        }),
      },
    ],
  }),
  component: Features,
});

const groups = [
  {
    title: "SEO Audit",
    items: ["Instant score", "Website health", "Issue detection", "AI explanations", "Auto-fixes"],
  },
  {
    title: "Technical SEO",
    items: [
      "Robots & sitemaps",
      "Core Web Vitals",
      "Structured data",
      "Mobile & HTTPS",
      "Redirect chains",
    ],
  },
  {
    title: "On-Page SEO",
    items: ["Titles & meta", "Headings", "Alt tags", "Content structure", "Semantic HTML"],
  },
  {
    title: "Off-Page SEO",
    items: ["Backlinks", "Authority", "Guest posting", "Outreach", "Disavow suggestions"],
  },
  {
    title: "Keyword Intelligence",
    items: ["Volume & difficulty", "Intent", "Topic clusters", "LSI", "Questions"],
  },
  {
    title: "Competitors",
    items: ["Rankings", "Traffic", "Keyword gap", "Top pages", "SEO strength"],
  },
  { title: "AI Content", items: ["SEO blogs", "Landing pages", "Meta rewriting", "Schema", "FAQ"] },
  {
    title: "Reports",
    items: ["PDF exports", "Charts", "Priority score", "Estimated traffic gain", "Roadmap"],
  },
];

function Features() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-6xl px-4">
        <SiteHeader />
        <section className="mt-20 text-center">
          <h1 className="font-display text-5xl font-semibold md:text-6xl">
            Everything an SEO team does. <span className="text-gradient">Automated.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Rankora ships every SEO workflow — technical, on-page, off-page, content, and reporting
            — under one AI roof.
          </p>
        </section>
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">Every SEO workflow, grouped</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {groups.map((g) => (
              <div key={g.title} className="glass rounded-2xl p-6">
                <h3 className="font-semibold">{g.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {g.items.map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-emerald" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <SiteFooter />
      </div>
    </div>
  );
}
