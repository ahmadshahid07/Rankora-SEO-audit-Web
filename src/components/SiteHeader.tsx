import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [
  { to: "/features", label: "Features" },
  { to: "/agents", label: "AI Agents" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full glass px-5 py-2.5">
        <BrandLogo />
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground transition hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {signedIn ? (
            <Link
              to="/dashboard"
              className="rounded-full bg-gradient-to-r from-primary to-violet px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg transition hover:brightness-110"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="rounded-full bg-gradient-to-r from-primary to-violet px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg transition hover:brightness-110"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
