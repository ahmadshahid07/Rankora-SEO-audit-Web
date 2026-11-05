import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AuroraBackground } from "@/components/AuroraBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { Sparkles } from "lucide-react";

const search = z.object({ redirect: z.string().optional() });

/** Owner accounts — signing in with these emails lands straight in the admin panel. */
const ADMIN_EMAILS = ["admin@rankora.com", "ahmadshahid.45612@gmail.com"];
const isAdminEmail = (e?: string | null) => ADMIN_EMAILS.includes((e ?? "").trim().toLowerCase());

export const Route = createFileRoute("/auth")({
  validateSearch: (raw) => search.parse(raw),
  head: () => ({
    meta: [
      { title: "Sign in — Rankora" },
      {
        name: "description",
        content: "Sign in or create your Rankora account to run AI SEO audits.",
      },
      { property: "og:title", content: "Sign in — Rankora" },
      { property: "og:description", content: "Access the Rankora AI SEO dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /** Same-origin relative path (may carry a query string), or null. */
  const safeRedirect =
    typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//")
      ? redirect
      : null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      if (safeRedirect) {
        window.location.replace(safeRedirect);
        return;
      }
      const isOwner = isAdminEmail(data.session.user.email);
      navigate({ to: isOwner ? "/admin" : "/dashboard" });
    });
  }, [navigate, safeRedirect]);

  function goAfterAuth(signedInEmail: string) {
    if (safeRedirect) {
      window.location.replace(safeRedirect);
      return;
    }
    if (isAdminEmail(signedInEmail)) {
      navigate({ to: "/admin" });
      return;
    }
    navigate({ to: "/dashboard" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + (safeRedirect ?? ""),
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      goAfterAuth(email);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setErr(null);
    setNotice(null);
    setBusy(true);
    try {
      const callbackUrl = new URL("/auth", window.location.origin);
      if (safeRedirect) callbackUrl.searchParams.set("redirect", safeRedirect);

      const host = window.location.hostname;
      const lovablePreviewZones = [
        "lovableproject.com",
        "lovableproject-dev.com",
        "lovable.app",
        "gpt-eng.com",
        "gptengineer.run",
      ];
      const isLovablePreview = lovablePreviewZones.some(
        (zone) => host === zone || host.endsWith(`.${zone}`),
      );

      if (isLovablePreview) {
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: callbackUrl.toString(),
          extraParams: { prompt: "select_account" },
        });
        if (result.error) throw result.error;
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { prompt: "select_account" },
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error("Google sign-in did not return an authorization URL.");

      // Supabase returns provider configuration errors as JSON from the authorize
      // endpoint. Check that response before navigating away from the login form.
      try {
        const preflight = await fetch(data.url, { credentials: "omit", redirect: "manual" });
        if (preflight.status >= 400) {
          const payload = (await preflight.json()) as { msg?: string };
          throw new Error(payload.msg ?? `Google sign-in failed (${preflight.status}).`);
        }
      } catch (preflightError) {
        if (
          preflightError instanceof Error &&
          preflightError.message.includes("missing OAuth secret")
        ) {
          throw preflightError;
        }
        // A browser may hide a valid cross-origin redirect; let the OAuth
        // navigation handle that case instead of blocking sign-in.
      }
      window.location.assign(data.url);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setErr(
        message.includes("missing OAuth secret")
          ? "Google login is not enabled yet. In Supabase, open Authentication > Providers > Google, add your Google OAuth Client ID and Client Secret, then save."
          : message || "Google sign-in could not be started.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="mx-auto max-w-6xl px-4">
        <SiteHeader />
        <div className="mx-auto mt-24 max-w-md">
          <div className="glass-strong rounded-3xl p-8 gradient-border">
            <div className="mb-6 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h1 className="text-lg font-semibold">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>
                <div className="text-xs text-muted-foreground">Rankora — AI SEO Automation</div>
              </div>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={handleGoogle}
              className="mb-4 w-full rounded-xl border border-border/70 bg-card/50 px-4 py-2.5 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Connecting…" : "Continue with Google"}
            </button>
            <p className="mb-4 text-center text-[11px] text-muted-foreground">
              Google will always ask which account you want to use.
            </p>

            <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or use email
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-border bg-input/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              )}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-border bg-input/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-border bg-input/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              {err && <p className="text-sm text-destructive">{err}</p>}
              {notice && <p className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}
              <button
                disabled={busy}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-violet px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg disabled:opacity-60"
              >
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
