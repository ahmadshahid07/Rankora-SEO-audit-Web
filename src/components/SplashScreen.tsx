import { useEffect, useState } from "react";

const KEY = "rankora-splash-seen";

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<"playing" | "leaving">("playing");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      onComplete?.();
      return;
    }
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      // The animation should still complete when storage is unavailable.
    }
    const t1 = setTimeout(() => setPhase("leaving"), 1700);
    const t2 = setTimeout(() => onComplete?.(), 2350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-background transition-all duration-600 ${
        phase === "leaving" ? "pointer-events-none opacity-0 scale-[1.06] blur-sm" : "opacity-100"
      }`}
    >
      {/* aurora wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/3 -top-1/3 h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--royal)_38%,transparent),transparent_65%)] blur-3xl animate-aurora" />
        <div className="absolute -bottom-1/3 -right-1/3 h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--violet)_34%,transparent),transparent_65%)] blur-3xl animate-aurora [animation-delay:-6s]" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* radar / scanner */}
        <div className="relative grid h-32 w-32 place-items-center">
          <span className="splash-ring absolute inset-0 rounded-full border border-primary/30" />
          <span className="splash-ring absolute inset-0 rounded-full border border-violet/30 [animation-delay:.45s]" />
          <span className="splash-ring absolute inset-0 rounded-full border border-emerald/25 [animation-delay:.9s]" />
          <span className="splash-sweep absolute inset-2 rounded-full" />
          <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-royal via-primary to-violet text-primary-foreground shadow-2xl neon-glow">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.15 3.1a2 2 0 0 1-1.18 1.18L6.5 8.5l3.17 1.22a2 2 0 0 1 1.18 1.18L12 14l1.15-3.1a2 2 0 0 1 1.18-1.18L17.5 8.5l-3.17-1.22a2 2 0 0 1-1.18-1.18L12 3Z" />
              <path d="M5 14.5 4.35 16a1.7 1.7 0 0 1-.85.85L2 17.5l1.5.65a1.7 1.7 0 0 1 .85.85L5 20.5 5.65 19a1.7 1.7 0 0 1 .85-.85L8 17.5l-1.5-.65a1.7 1.7 0 0 1-.85-.85L5 14.5Z" />
              <path d="M19 2v4M17 4h4" />
            </svg>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald ring-2 ring-background" />
          </span>
        </div>

        <div className="mt-7 flex overflow-hidden font-display text-3xl font-semibold tracking-tight">
          {"RANKORA".split("").map((c, i) => (
            <span key={i} className="splash-letter" style={{ animationDelay: `${180 + i * 65}ms` }}>
              {c}
            </span>
          ))}
        </div>
        <p className="splash-tag mt-2 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
          AI SEO Automation
        </p>

        <div className="mt-6 h-[3px] w-52 overflow-hidden rounded-full bg-border/60">
          <span className="splash-bar block h-full rounded-full bg-gradient-to-r from-royal via-primary to-emerald" />
        </div>
      </div>
    </div>
  );
}
