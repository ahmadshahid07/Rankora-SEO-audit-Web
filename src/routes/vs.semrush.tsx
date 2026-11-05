import { createFileRoute } from "@tanstack/react-router";
import { ComparisonPage, type ComparisonRow } from "@/components/ComparisonPage";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/vs/semrush")({
  head: () => ({
    meta: [
      { title: "Rankora vs Semrush — AI SEO Automation Compared (2026)" },
      {
        name: "description",
        content:
          "Rankora vs Semrush: how an AI agent platform that audits, prioritises and writes the fixes compares to a classic keyword and reporting suite.",
      },
      { property: "og:title", content: "Rankora vs Semrush" },
      {
        property: "og:description",
        content: "AI agents that fix your SEO versus a traditional research suite.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE}/vs/semrush` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/vs/semrush` }],
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
              name: "Rankora vs Semrush",
              item: `${SITE}/vs/semrush`,
            },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <ComparisonPage
      rival="Semrush"
      headline="Rankora vs Semrush"
      intro="Semrush tells you what is wrong. Rankora's AI agents tell you what is wrong, rank it by impact, and write the fix."
      rows={ROWS}
      paragraphs={PARAS}
    />
  ),
});

const ROWS: ComparisonRow[] = [
  { feature: "Automated site audit", rankora: true, rival: true },
  { feature: "Specialised AI agents that act on findings", rankora: "10 agents", rival: false },
  { feature: "AI-written fixes (titles, meta, content)", rankora: true, rival: "Add-on" },
  { feature: "Google Search Console integration", rankora: true, rival: true },
  { feature: "Backlink analysis", rankora: true, rival: true },
  { feature: "Free instant tools, no signup", rankora: true, rival: false },
  { feature: "Agent performance analytics over time", rankora: true, rival: false },
  { feature: "Learning curve", rankora: "Minutes", rival: "Weeks" },
  { feature: "Entry price", rankora: "Free tier", rival: "Paid only" },
];

const PARAS = [
  {
    h: "Research suite versus execution engine",
    p: "Semrush is built around databases: keywords, domains, and competitor positions. That is genuinely powerful if you have an SEO team to interpret it. Rankora starts from the opposite end — you give it a URL, and ten specialised agents crawl, score, diagnose and produce the exact changes to make, in priority order.",
  },
  {
    h: "Time to first meaningful action",
    p: "Most teams spend their first weeks in a traditional suite learning where things live. With Rankora the first audit finishes in under a minute and hands you a ranked task list, so the work starts on day one rather than after onboarding.",
  },
  {
    h: "Who should still pick Semrush",
    p: "If your core need is deep keyword databases, PPC research and competitor position tracking at agency scale, a mature research suite remains the stronger fit. Many teams run both: one for research, Rankora for continuous automated fixing.",
  },
  {
    h: "Who should pick Rankora",
    p: "Founders, small teams and in-house marketers who need their site to actually improve — not another dashboard to read. If nobody on your team wants to be the full-time SEO analyst, the agent model does that job.",
  },
];
