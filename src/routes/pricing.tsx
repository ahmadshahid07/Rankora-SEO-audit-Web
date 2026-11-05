import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Rankora AI SEO Platform" },
      {
        name: "description",
        content:
          "Simple, transparent pricing for Rankora AI SEO automation. Free, Starter, Professional, Agency, and Enterprise plans.",
      },
      { property: "og:title", content: "Rankora Pricing" },
      {
        property: "og:description",
        content: "Plans for founders, businesses, agencies, and enterprises.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/pricing` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/pricing` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Rankora",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: `${SITE}/`,
          description:
            "AI SEO automation platform: instant audits, technical fixes, keyword intelligence and an AI growth roadmap.",
          offers: [
            { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
            { "@type": "Offer", name: "Starter", price: "29", priceCurrency: "USD" },
            { "@type": "Offer", name: "Professional", price: "89", priceCurrency: "USD" },
            { "@type": "Offer", name: "Agency", price: "249", priceCurrency: "USD" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE}/pricing` },
          ],
        }),
      },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    tag: "Try Rankora",
    features: ["3 audits / month", "Basic SEO score", "Core Web Vitals", "Community support"],
  },
  {
    name: "Starter",
    monthly: 29,
    yearly: 290,
    tag: "Founders",
    features: ["50 audits / month", "AI recommendations", "Technical + on-page", "Email support"],
  },
  {
    name: "Professional",
    monthly: 89,
    yearly: 890,
    tag: "Popular",
    highlight: true,
    features: [
      "Unlimited audits",
      "All 10 AI agents",
      "Backlink analysis",
      "AI content",
      "Priority support",
    ],
  },
  {
    name: "Agency",
    monthly: 249,
    yearly: 2490,
    tag: "Teams",
    features: [
      "Multi-workspace",
      "Client reports",
      "White-label PDFs",
      "5 team seats",
      "API access",
    ],
  },
];

function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-6xl px-4">
        <SiteHeader />
        <section className="mt-20 text-center">
          <h1 className="font-display text-5xl font-semibold md:text-6xl">
            Simple, scalable <span className="text-gradient">pricing</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Pick a plan. Rankora scales from a solo founder to a full agency.
          </p>
          <div className="mt-6 inline-flex items-center gap-1 rounded-full glass p-1 text-xs">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 ${!yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-1.5 ${yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Yearly · save 17%
            </button>
          </div>
        </section>

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`glass rounded-2xl p-6 ${p.highlight ? "gradient-border neon-glow" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.name}</div>
                <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {p.tag}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  ${yearly ? Math.round(p.yearly / 12) : p.monthly}
                </span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={`mt-6 flex w-full items-center justify-center gap-1 rounded-xl px-4 py-2 text-sm font-medium ${
                  p.highlight
                    ? "bg-gradient-to-r from-primary to-violet text-primary-foreground shadow-lg"
                    : "border border-border/70 hover:bg-accent"
                }`}
              >
                Start {p.name} <Sparkles className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 glass rounded-2xl p-6 text-center">
          <div className="text-sm font-semibold">Enterprise</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Custom seats, SSO, dedicated agents, and SLAs. Talk to us.
          </p>
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
