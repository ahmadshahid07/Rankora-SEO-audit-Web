import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowRight } from "lucide-react";

export function ToolLayout({
  title,
  kicker,
  intro,
  children,
  about,
}: {
  title: ReactNode;
  kicker: string;
  intro: string;
  children: ReactNode;
  about?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-4xl px-4">
        <SiteHeader />
        <section className="mt-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
            Free tool · {kicker}
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold md:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{intro}</p>
        </section>

        <div className="mt-10">{children}</div>

        {about && (
          <div className="mt-16 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {about}
          </div>
        )}

        <div className="mt-16 rounded-3xl glass-strong gradient-border p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">Want the full picture?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Rankora's AI agents audit your whole site, score it and write the fixes for you — not
            just one tag at a time.
          </p>
          <Link
            to="/auth"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-royal via-primary to-violet px-6 py-3 text-sm font-medium text-white magnetic-btn"
          >
            Run a full AI audit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <nav className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
          <Link to="/tools" className="text-muted-foreground hover:text-foreground">
            All free tools
          </Link>
          <Link
            to="/tools/meta-tag-checker"
            className="text-muted-foreground hover:text-foreground"
          >
            Meta tag checker
          </Link>
          <Link
            to="/tools/robots-txt-tester"
            className="text-muted-foreground hover:text-foreground"
          >
            Robots.txt tester
          </Link>
          <Link
            to="/tools/schema-validator"
            className="text-muted-foreground hover:text-foreground"
          >
            Schema validator
          </Link>
        </nav>
        <SiteFooter />
      </div>
    </div>
  );
}

export function UrlForm({
  value,
  onChange,
  onSubmit,
  busy,
  placeholder = "https://yourwebsite.com",
  cta = "Check",
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
  placeholder?: string;
  cta?: string;
  children?: ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-2xl glass-strong gradient-border p-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Website URL"
          className="flex-1 rounded-xl bg-input/50 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        {children}
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="rounded-xl bg-gradient-to-r from-royal via-primary to-violet px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Checking…" : cta}
        </button>
      </div>
    </form>
  );
}
