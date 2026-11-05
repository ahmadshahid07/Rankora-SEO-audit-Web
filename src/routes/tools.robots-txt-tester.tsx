import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ToolLayout, UrlForm } from "@/components/ToolLayout";
import { testRobotsTxt } from "@/lib/tools.functions";

const SITE = "https://ai-rank-ace-29.lovable.app";

export const Route = createFileRoute("/tools/robots-txt-tester")({
  head: () => ({
    meta: [
      { title: "Free Robots.txt Tester — Is Your Page Crawlable? | Rankora" },
      {
        name: "description",
        content:
          "Fetch any site's robots.txt and test whether a specific path is allowed for Googlebot. Free robots.txt tester with sitemap detection.",
      },
      { property: "og:title", content: "Free Robots.txt Tester" },
      {
        property: "og:description",
        content: "Test whether Google can crawl any path on your site.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/tools/robots-txt-tester` },
      { property: "og:image", content: `${SITE}/og-rankora.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE}/og-rankora.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/tools/robots-txt-tester` }],
  }),
  component: RobotsTester,
});

function RobotsTester() {
  const run = useServerFn(testRobotsTxt);
  const [url, setUrl] = useState("");
  const [path, setPath] = useState("/");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof testRobotsTxt>> | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await run({ data: { url, path } }));
    } catch (e) {
      setError((e as Error).message || "Could not read that robots.txt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolLayout
      kicker="Crawlability"
      title={
        <>
          Robots.txt <span className="text-gradient">Tester</span>
        </>
      }
      intro="Fetch a site's robots.txt, see every rule and test whether Googlebot is allowed to crawl a specific path."
      about={
        <>
          <h2 className="font-display text-xl font-semibold text-foreground">
            How robots.txt affects rankings
          </h2>
          <p>
            A single stray <code>Disallow: /</code> can wipe a site out of Google. Robots.txt
            controls crawling, not indexing — so blocked pages can still appear in results without a
            description. Use it to keep crawl budget on pages that matter, and point crawlers at
            your sitemap.
          </p>
          <h2 className="font-display text-xl font-semibold text-foreground">Test any path</h2>
          <p>
            Enter a path such as <code>/blog/my-post</code> to see which rule wins. The longest
            matching rule takes precedence, and wildcards are supported.
          </p>
        </>
      }
    >
      <UrlForm value={url} onChange={setUrl} onSubmit={submit} busy={busy} cta="Test">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          aria-label="Path to test"
          placeholder="/path-to-test"
          className="rounded-xl bg-input/50 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground sm:w-48"
        />
      </UrlForm>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {result && (
        <div className="mt-8 space-y-5">
          <div className="flex items-start gap-3 rounded-2xl glass-strong p-5">
            {result.allowed ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
            )}
            <div className="text-sm">
              <p className="font-medium">
                {result.allowed ? "Allowed" : "Blocked"} — Googlebot{" "}
                {result.allowed ? "can" : "cannot"} crawl{" "}
                <span className="break-all">
                  {result.origin}
                  {result.testPath}
                </span>
              </p>
              <p className="mt-1 text-muted-foreground">{result.reason}</p>
            </div>
          </div>

          {result.sitemaps.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4 text-sm">
              <p className="font-medium">Sitemaps declared</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {result.sitemaps.map((s) => (
                  <li key={s} className="break-all">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.found && (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
              <p className="text-sm font-medium">robots.txt ({result.ruleCount} rules)</p>
              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {result.body}
              </pre>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
