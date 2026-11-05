import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ToolLayout, UrlForm } from "@/components/ToolLayout";
import { validateSchema } from "@/lib/tools.functions";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/tools/schema-validator")({
  head: () => ({
    meta: [
      { title: "Free Schema Markup Validator — JSON-LD Checker | Rankora" },
      {
        name: "description",
        content:
          "Validate the JSON-LD structured data on any URL. See every schema type found, parsing errors and which rich-result types you are missing.",
      },
      { property: "og:title", content: "Free Schema Markup Validator" },
      {
        property: "og:description",
        content: "Check JSON-LD structured data and rich-result eligibility on any page.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/tools/schema-validator` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/tools/schema-validator` }],
  }),
  component: SchemaValidator,
});

function SchemaValidator() {
  const run = useServerFn(validateSchema);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof validateSchema>> | null>(null);

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
      kicker="Structured data"
      title={
        <>
          Schema <span className="text-gradient">Validator</span>
        </>
      }
      intro="Paste a URL to see every block of JSON-LD structured data on the page, whether it parses, and which rich-result types you are missing."
      about={
        <>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Why structured data wins clicks
          </h2>
          <p>
            Schema markup is how you tell search engines what your page actually is. Valid markup
            unlocks star ratings, FAQ drop-downs, breadcrumbs and product prices directly in the
            results — real estate that lifts click-through rate well beyond a plain blue link.
          </p>
          <h2 className="font-display text-xl font-semibold text-foreground">
            What this tool checks
          </h2>
          <p>
            Every <code>application/ld+json</code> block is parsed and reported with its schema
            types, JSON syntax errors and missing <code>@context</code> or <code>@type</code>{" "}
            fields. We also flag common high-value types you have not implemented yet.
          </p>
        </>
      }
    >
      <UrlForm value={url} onChange={setUrl} onSubmit={submit} busy={busy} cta="Validate" />

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl glass-strong p-5 text-sm text-muted-foreground">
            Found <span className="text-foreground">{result.blocks.length}</span> JSON-LD block
            {result.blocks.length === 1 ? "" : "s"} on{" "}
            <span className="break-all text-foreground">{result.finalUrl}</span>
            {result.microdata && " (plus inline microdata)"}.
          </div>

          {result.blocks.length === 0 && (
            <p className="rounded-2xl border border-border/60 bg-card/40 p-4 text-sm">
              No structured data found. Start with{" "}
              <span className="text-foreground">Organization</span> and{" "}
              <span className="text-foreground">WebSite</span> markup on your homepage.
            </p>
          )}

          {result.blocks.map((b) => (
            <div key={b.index} className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                {b.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                Block {b.index}
                {b.types.length > 0 && (
                  <span className="text-muted-foreground">— {b.types.join(", ")}</span>
                )}
              </div>
              {b.issues.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-amber-400">
                  {b.issues.map((i, k) => (
                    <li key={k}>{i}</li>
                  ))}
                </ul>
              )}
              <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-input/40 p-3 text-xs text-muted-foreground">
                {b.pretty}
              </pre>
            </div>
          ))}

          {result.missing.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4 text-sm">
              <p className="font-medium">Worth adding</p>
              <p className="mt-1 text-muted-foreground">{result.missing.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
