import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UrlSchema = z.object({ url: z.string().min(4).max(2000) });

function normalizeUrl(raw: string): string {
  const t = raw.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export type MetaCheck = {
  label: string;
  value: string | null;
  status: "good" | "warn" | "bad";
  advice: string;
};

export const checkMetaTags = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => UrlSchema.parse(raw))
  .handler(async ({ data }) => {
    const { safeFetchText } = await import("./safe-fetch.server");
    const { text, finalUrl } = await safeFetchText(normalizeUrl(data.url));

    const pick = (re: RegExp) => {
      const m = re.exec(text);
      return m ? m[1].trim().replace(/\s+/g, " ") : null;
    };

    const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    const canonical = pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);
    const twitter = pick(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)["']/i);
    const viewport = pick(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i);
    const robots = pick(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
    const h1s = [...text.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, "").trim(),
    );
    const imgs = [...text.matchAll(/<img\b[^>]*>/gi)];
    const missingAlt = imgs.filter((m) => !/\balt\s*=/.test(m[0])).length;

    const checks: MetaCheck[] = [
      {
        label: "Title tag",
        value: title,
        status: !title ? "bad" : title.length < 20 || title.length > 60 ? "warn" : "good",
        advice: !title
          ? "Add a <title> with your primary keyword."
          : `${title.length} characters. Aim for 20–60 so it is not truncated in search results.`,
      },
      {
        label: "Meta description",
        value: description,
        status: !description
          ? "bad"
          : description.length < 70 || description.length > 160
            ? "warn"
            : "good",
        advice: !description
          ? "Add a meta description — it drives click-through rate."
          : `${description.length} characters. Aim for 70–160.`,
      },
      {
        label: "Canonical URL",
        value: canonical,
        status: canonical ? "good" : "warn",
        advice: canonical
          ? "Canonical present."
          : "Add a self-referencing canonical to avoid duplicate-content dilution.",
      },
      {
        label: "Open Graph title",
        value: ogTitle,
        status: ogTitle ? "good" : "warn",
        advice: ogTitle ? "Social title present." : "Add og:title so shared links render properly.",
      },
      {
        label: "Open Graph image",
        value: ogImage,
        status: ogImage ? "good" : "warn",
        advice: ogImage
          ? "Share image present."
          : "Add a 1200x630 og:image — shared links get far more clicks with one.",
      },
      {
        label: "Twitter card",
        value: twitter,
        status: twitter ? "good" : "warn",
        advice: twitter ? "Twitter card present." : "Add twitter:card = summary_large_image.",
      },
      {
        label: "Viewport",
        value: viewport,
        status: viewport ? "good" : "bad",
        advice: viewport
          ? "Mobile viewport set."
          : "Add a responsive viewport meta tag — required for mobile ranking.",
      },
      {
        label: "Robots meta",
        value: robots ?? "index, follow (default)",
        status: robots && /noindex/i.test(robots) ? "bad" : "good",
        advice:
          robots && /noindex/i.test(robots)
            ? "This page is blocked from indexing. Remove noindex if it should rank."
            : "Page is indexable.",
      },
      {
        label: "H1 headings",
        value: h1s.length ? h1s.join(" | ") : null,
        status: h1s.length === 1 ? "good" : "warn",
        advice:
          h1s.length === 0
            ? "No H1 found — add exactly one descriptive H1."
            : h1s.length === 1
              ? "Exactly one H1. Perfect."
              : `${h1s.length} H1 tags found. Keep only one.`,
      },
      {
        label: "Image alt text",
        value: `${imgs.length - missingAlt}/${imgs.length} images have alt text`,
        status: missingAlt === 0 ? "good" : missingAlt > 5 ? "bad" : "warn",
        advice:
          missingAlt === 0 ? "All images described." : `${missingAlt} images are missing alt text.`,
      },
    ];

    const score = Math.round(
      (checks.reduce((a, c) => a + (c.status === "good" ? 1 : c.status === "warn" ? 0.5 : 0), 0) /
        checks.length) *
        100,
    );

    return { finalUrl, score, checks };
  });

export const testRobotsTxt = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    UrlSchema.extend({ path: z.string().max(500).optional() }).parse(raw),
  )
  .handler(async ({ data }) => {
    const { safeFetchText } = await import("./safe-fetch.server");
    const origin = new URL(normalizeUrl(data.url)).origin;
    const testPath = (data.path || "/").trim() || "/";

    let body = "";
    let found = true;
    try {
      const res = await safeFetchText(`${origin}/robots.txt`);
      body = res.text.slice(0, 20000);
      if (res.status >= 400 || /<html/i.test(body)) found = false;
    } catch {
      found = false;
    }

    // Parse groups for the generic user-agent and Googlebot
    const lines = body
      .split(/\r?\n/)
      .map((l) => l.replace(/#.*$/, "").trim())
      .filter(Boolean);
    const rules: { agent: string; type: "allow" | "disallow"; path: string }[] = [];
    const sitemaps: string[] = [];
    let agents: string[] = [];
    for (const line of lines) {
      const [rawKey, ...rest] = line.split(":");
      const key = rawKey.toLowerCase().trim();
      const val = rest.join(":").trim();
      if (key === "user-agent")
        agents = [...(rules.length && agents.length ? [] : agents), val.toLowerCase()];
      else if (key === "sitemap") sitemaps.push(val);
      else if (key === "allow" || key === "disallow") {
        for (const a of agents.length ? agents : ["*"])
          rules.push({ agent: a, type: key, path: val });
      }
    }

    const match = (pattern: string, path: string) => {
      if (!pattern) return false;
      const re = new RegExp(
        "^" +
          pattern
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*")
            .replace(/\$$/, "$"),
      );
      return re.test(path);
    };

    const applicable = rules.filter((r) => r.agent === "*" || r.agent.includes("googlebot"));
    const hits = applicable.filter((r) => match(r.path, testPath));
    hits.sort((a, b) => b.path.length - a.path.length);
    const decisive = hits[0];
    const allowed = !found ? true : !decisive ? true : decisive.type === "allow";

    return {
      origin,
      found,
      body: body.slice(0, 8000),
      sitemaps,
      testPath,
      allowed,
      reason: !found
        ? "No robots.txt found — everything is crawlable, but adding one lets you point crawlers at your sitemap."
        : decisive
          ? `Matched rule: ${decisive.type === "allow" ? "Allow" : "Disallow"}: ${decisive.path}`
          : "No matching rule — crawling is allowed by default.",
      ruleCount: rules.length,
    };
  });

export const validateSchema = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => UrlSchema.parse(raw))
  .handler(async ({ data }) => {
    const { safeFetchText } = await import("./safe-fetch.server");
    const { text, finalUrl } = await safeFetchText(normalizeUrl(data.url));

    const blocks = [
      ...text.matchAll(
        /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ].map((m) => m[1]);

    const results = blocks.map((raw, i) => {
      try {
        const parsed = JSON.parse(raw.trim());
        const nodes = Array.isArray(parsed)
          ? parsed
          : parsed["@graph"]
            ? parsed["@graph"]
            : [parsed];
        const types = nodes
          .map((n: any) => n?.["@type"])
          .filter(Boolean)
          .flat();
        const issues: string[] = [];
        for (const n of nodes) {
          if (!n?.["@context"] && !parsed["@context"])
            issues.push("Missing @context (should be https://schema.org).");
          if (!n?.["@type"]) issues.push("A node is missing @type.");
        }
        return {
          index: i + 1,
          valid: true,
          types,
          issues,
          pretty: JSON.stringify(parsed, null, 2).slice(0, 4000),
        };
      } catch (e) {
        return {
          index: i + 1,
          valid: false,
          types: [] as string[],
          issues: [`Invalid JSON: ${(e as Error).message}`],
          pretty: raw.trim().slice(0, 2000),
        };
      }
    });

    const microdata = /itemscope/i.test(text);
    const found = results.flatMap((r) => r.types);
    const recommended = [
      "Organization",
      "WebSite",
      "BreadcrumbList",
      "FAQPage",
      "Article",
      "Product",
    ];
    const missing = recommended.filter((t) => !found.includes(t));

    return { finalUrl, blocks: results, microdata, missing };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    z
      .object({ email: z.string().email().max(200), source: z.string().max(60).optional() })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        { email: data.email.toLowerCase(), source: data.source ?? "footer" },
        { onConflict: "email" },
      );
    if (error) throw new Error("Could not save your email. Please try again.");
    return { ok: true };
  });
