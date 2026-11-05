import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { subscribeNewsletter } from "@/lib/tools.functions";

function Newsletter() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setState("busy");
        try {
          await subscribe({ data: { email, source: "footer" } });
          setState("done");
          setEmail("");
        } catch {
          setState("error");
        }
      }}
      className="w-full max-w-sm"
    >
      <label htmlFor="footer-email" className="text-xs text-muted-foreground">
        SEO tips, product updates. No spam.
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="footer-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="min-w-0 flex-1 rounded-xl bg-input/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={state === "busy"}
          className="rounded-xl bg-gradient-to-r from-royal via-primary to-violet px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {state === "busy" ? "…" : "Subscribe"}
        </button>
      </div>
      {state === "done" && <p className="mt-2 text-xs text-emerald">You're on the list.</p>}
      {state === "error" && (
        <p className="mt-2 text-xs text-destructive">Something went wrong. Try again.</p>
      )}
    </form>
  );
}

export function SiteFooter() {
  const c = useSiteContent();
  return (
    <footer className="mt-32 border-t border-border/50 py-10 text-sm text-muted-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald animate-pulse-glow" />
            <span>{c("footer_tagline")}</span>
          </div>
          <div className="mt-5">
            <Newsletter />
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <span className="text-foreground">Product</span>
          <Link to="/features" className="hover:text-foreground">
            Features
          </Link>
          <Link to="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link to="/agents" className="hover:text-foreground">
            Agents
          </Link>
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
        </nav>

        <nav className="flex flex-col gap-2">
          <span className="text-foreground">Free tools</span>
          <Link to="/tools" className="hover:text-foreground">
            All tools
          </Link>
          <Link to="/tools/meta-tag-checker" className="hover:text-foreground">
            Meta tag checker
          </Link>
          <Link to="/tools/robots-txt-tester" className="hover:text-foreground">
            Robots.txt tester
          </Link>
          <Link to="/tools/schema-validator" className="hover:text-foreground">
            Schema validator
          </Link>
          <Link to="/vs/semrush" className="hover:text-foreground">
            Rankora vs Semrush
          </Link>
          <Link to="/vs/ahrefs" className="hover:text-foreground">
            Rankora vs Ahrefs
          </Link>
        </nav>
      </div>
      <div className="mx-auto mt-10 max-w-6xl px-6 text-xs">
        © {new Date().getFullYear()} Rankora
      </div>
    </footer>
  );
}
