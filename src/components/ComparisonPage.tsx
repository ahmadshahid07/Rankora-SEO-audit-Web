import { Link } from "@tanstack/react-router";
import { Check, X, ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";

export type ComparisonRow = { feature: string; rankora: boolean | string; rival: boolean | string };

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-emerald" />;
  if (v === false) return <X className="mx-auto h-4 w-4 text-muted-foreground/60" />;
  return <span className="text-xs text-muted-foreground">{v}</span>;
}

export function ComparisonPage({
  rival,
  headline,
  intro,
  rows,
  paragraphs,
}: {
  rival: string;
  headline: string;
  intro: string;
  rows: ComparisonRow[];
  paragraphs: { h: string; p: string }[];
}) {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-4xl px-4">
        <SiteHeader />

        <section className="mt-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            Comparison · Rankora vs {rival}
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold md:text-5xl">{headline}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{intro}</p>
        </section>

        <Reveal>
          <div className="mt-12 overflow-hidden rounded-3xl glass-strong gradient-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left">
                  <th className="p-4 font-medium">Capability</th>
                  <th className="p-4 text-center font-medium text-gradient">Rankora</th>
                  <th className="p-4 text-center font-medium text-muted-foreground">{rival}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature} className="border-b border-border/30 last:border-0">
                    <td className="p-4">{r.feature}</td>
                    <td className="p-4 text-center">
                      <Cell v={r.rankora} />
                    </td>
                    <td className="p-4 text-center">
                      <Cell v={r.rival} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <div className="mt-16 space-y-6 text-sm leading-relaxed text-muted-foreground">
          {paragraphs.map((s) => (
            <Reveal key={s.h}>
              <h2 className="font-display text-xl font-semibold text-foreground">{s.h}</h2>
              <p className="mt-2">{s.p}</p>
            </Reveal>
          ))}
          <p className="text-xs text-muted-foreground/70">
            Comparison based on each vendor's publicly documented features at the time of writing.{" "}
            {rival} is a trademark of its owner and is not affiliated with Rankora.
          </p>
        </div>

        <div className="mt-16 rounded-3xl glass-strong gradient-border p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">
            See the difference on your own site
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Run a full AI audit in under a minute — scored, prioritised and written as fixes you can
            ship today.
          </p>
          <Link
            to="/auth"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-royal via-primary to-violet px-6 py-3 text-sm font-medium text-white magnetic-btn"
          >
            Start free audit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}
