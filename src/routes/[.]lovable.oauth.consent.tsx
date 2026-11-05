import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BrandLogo } from "@/components/BrandLogo";

type OAuthDetails = {
  client?: { name?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: Error | null }>;
  approveAuthorization: (id: string) => Promise<{ data: OAuthDetails | null; error: Error | null }>;
  denyAuthorization: (id: string) => Promise<{ data: OAuthDetails | null; error: Error | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { redirect: next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="grid min-h-screen place-items-center p-6 text-sm text-muted-foreground">
      Could not load this authorization request: {String((error as Error)?.message ?? error)}
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "this app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
        <div className="glass-strong gradient-border w-full rounded-3xl p-8">
          <BrandLogo />
          <h1 className="mt-6 font-display text-xl font-semibold">
            Connect {clientName} to your Rankora account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {clientName} will be able to read your SEO projects, audits and agent runs, create
            projects and run agents — acting as you.
          </p>
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <button
              disabled={busy}
              onClick={() => decide(true)}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-violet px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg disabled:opacity-60"
            >
              {busy ? "Working…" : "Approve"}
            </button>
            <button
              disabled={busy}
              onClick={() => decide(false)}
              className="flex-1 rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-60"
            >
              Deny
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
