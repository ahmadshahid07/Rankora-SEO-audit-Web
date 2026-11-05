import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Rankora home"
      className="group flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-royal via-primary to-violet text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
        <Sparkles className="h-4.5 w-4.5" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald ring-2 ring-background" />
      </span>
      {!compact && (
        <span>
          <span className="block font-display text-lg font-semibold leading-none">Rankora</span>
          <span className="mt-1 hidden text-[10px] text-muted-foreground sm:block">
            AI SEO command center
          </span>
        </span>
      )}
    </Link>
  );
}
