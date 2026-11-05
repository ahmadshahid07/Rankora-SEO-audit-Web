import { createFileRoute } from "@tanstack/react-router";
import { ComparisonPage, type ComparisonRow } from "@/components/ComparisonPage";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/vs/ahrefs")({
  head: () => ({
    meta: [
      { title: "Rankora vs Ahrefs — Which SEO Platform Fits You? (2026)" },
      {
        name: "description",
        content:
          "Rankora vs Ahrefs: backlink-first research versus AI agents that audit your site, prioritise issues and write the fixes automatically.",
      },
      { property: "og:title", content: "Rankora vs Ahrefs" },
      {
        property: "og:description",
        content: "Backlink-first research versus AI agents that fix your SEO for you.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE}/vs/ahrefs` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/vs/ahrefs` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            {
              "@type": "ListItem",
              position: 2,
              name: "Rankora vs Ahrefs",
              item: `${SITE}/vs/ahrefs`,
            },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <ComparisonPage
      rival="Ahrefs"
      headline="Rankora vs Ahrefs"
      intro="Ahrefs is the reference for backlink data. Rankora is the engine that turns your whole site's SEO problems into finished fixes."
      rows={ROWS}
      paragraphs={PARAS}
    />
  ),
});

const ROWS: ComparisonRow[] = [
  { feature: "Backlink index depth", rankora: "Good", rival: "Best in class" },
  { feature: "Specialised AI agents", rankora: "10 agents", rival: false },
  { feature: "AI-written on-page fixes", rankora: true, rival: false },
  { feature: "Technical site audit", rankora: true, rival: true },
  { feature: "Search Console import & insights", rankora: true, rival: true },
  { feature: "Free tools without an account", rankora: true, rival: "Limited" },
  { feature: "Prioritised, scored action plan", rankora: true, rival: "Manual" },
  { feature: "Setup time", rankora: "Under a minute", rival: "Hours" },
  { feature: "Entry price", rankora: "Free tier", rival: "Paid only" },
];

const PARAS = [
  {
    h: "Different centre of gravity",
    p: "Ahrefs was built around the largest independent backlink crawler on the market, and that remains its strongest card. Rankora is built around agents: each one owns a domain — crawling, technical health, content, keywords, backlinks, speed, security and growth — and reports fixes rather than raw data.",
  },
  {
    h: "Data you read versus work that gets done",
    p: "A backlink index answers 'who links to my competitor?'. An agent answers 'what should I change on my site this week, and here is the rewritten title tag'. Those solve different problems, and most sites lose more traffic to unfixed on-page issues than to link gaps.",
  },
  {
    h: "Who should still pick Ahrefs",
    p: "Link builders, digital PR teams and agencies whose entire workflow is prospecting and outreach will want the deepest possible link index. Nothing in Rankora replaces that specialism.",
  },
  {
    h: "Who should pick Rankora",
    p: "Teams that want their site continuously audited and improved without hiring an analyst. Start with a free audit, see your score, and let the agents do the tedious part.",
  },
];
