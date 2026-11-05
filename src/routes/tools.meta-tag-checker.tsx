import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { ToolLayout, UrlForm } from "@/components/ToolLayout";
import { checkMetaTags } from "@/lib/tools.functions";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/tools/meta-tag-checker")({
  head: () => ({
    meta: [
      { title: "Free Meta Tag Checker — Title, Description & OG | Rankora" },
      {
        name: "description",
        content:
          "Check any page's title, meta description, canonical, Open Graph, H1s and image alt text instantly. Free meta tag checker with fix advice.",
      },
      { property: "og:title", content: "Free Meta Tag Checker" },
      {
        property: "og:description",
        content: "Instantly audit title, description, canonical and social tags on any URL.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/tools/meta-tag-checker` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/tools/meta-tag-checker` }],
  }),
  component: MetaTagChecker,
});

const ICON = {
  good: <CheckCircle2 className="h-4 w-4 text-emerald" />,
  warn: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  bad: <XCircle className="h-4 w-4 text-destructive" />,
};

function MetaTagChecker() {
  const run = useServerFn(checkMetaTags);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof checkMetaTags>> | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await run({ data: { url } }));
    } catch (e) {
      setError((e as Error).message || "Could not analyze that URL.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout
      kicker="Meta tags"
      title={
        <>
          Meta Tag <span className="text-gradient">Checker</span>
        </>
      }
      intro="Paste a URL and see exactly how search engines and social networks read your page — with specific advice for every tag."
      about={
        <>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Why meta tags still matter
          </h2>
          <p>
            Your title tag is the single strongest on-page ranking signal you fully control, and
            your meta description decides whether a searcher clicks you or your competitor. Open
            Graph tags control how your link looks when it is shared — a missing og:image can cut
            social click-through in half.
          </p>
          <h2 className="font-display text-xl font-semibold text-foreground">
            What this tool checks
          </h2>
          <p>
            Title length, meta description length, canonical URL, og:title, og:image, twitter:card,
            mobile viewport, robots directives, H1 structure and image alt coverage — then scores
            the page out of 100.
          </p>
        </>
      }
    >
      <UrlForm value={url} onChange={setUrl} onSubmit={submit} busy={busy} />

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-4 rounded-2xl glass-strong p-5">
            <div className="font-display text-4xl font-semibold text-gradient">{result.score}</div>
            <div className="text-sm text-muted-foreground">
              Meta score out of 100 for
              <span className="ml-1 break-all text-foreground">{result.finalUrl}</span>
            </div>
          </div>
          <ul className="space-y-3">
            {result.checks.map((c) => (
              <li key={c.label} className="rounded-2xl border border-border/60 bg-card/40 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {ICON[c.status]} {c.label}
                </div>
                {c.value && <p className="mt-2 break-all text-sm text-foreground/90">{c.value}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{c.advice}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ToolLayout>
  );
}
