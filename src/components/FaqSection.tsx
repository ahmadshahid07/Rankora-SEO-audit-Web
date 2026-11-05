import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/Reveal";

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Rankora?",
    a: "Rankora is an AI SEO automation platform. You paste a URL, and a team of specialized AI agents crawls the site, scores it, explains every issue it finds, and generates the fixes plus a prioritized growth roadmap.",
  },
  {
    q: "How long does an SEO audit take?",
    a: "Most audits finish in under a minute. Rankora fetches the page, extracts metadata, headings, links and content signals, then runs the AI analysis and returns a score with ranked issues.",
  },
  {
    q: "Do I need technical SEO knowledge to use it?",
    a: "No. Every issue comes with a plain-language explanation of why it matters and a concrete fix — including the code snippet where relevant — so non-technical founders can act on it directly.",
  },
  {
    q: "Can I connect Google Search Console?",
    a: "Yes. You can connect Search Console, import verified properties, and Rankora uses your real clicks, impressions and query data to sharpen its recommendations.",
  },
  {
    q: "What do the AI agents actually do?",
    a: "Each agent owns one surface: SpiderX handles technical SEO, Optimus on-page, Backlink Beast off-page authority, Keyword Hunter keyword intelligence, WriterMind AI content, and Atlas AI orchestrates them all.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan includes three audits per month with the SEO score, Core Web Vitals and basic issue detection — no card required.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mt-32" aria-labelledby="faq-heading">
      <Reveal>
        <h2
          id="faq-heading"
          className="text-center font-display text-3xl font-semibold md:text-4xl"
        >
          Frequently asked <span className="text-gradient">questions</span>
        </h2>
      </Reveal>
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 60}>
              <div className="glass rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <h3 className="text-sm font-semibold md:text-base">{f.q}</h3>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden px-5 transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="min-h-0 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
