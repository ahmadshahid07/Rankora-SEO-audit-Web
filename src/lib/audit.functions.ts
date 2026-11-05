import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLovableAI } from "./ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  url: z.string().url(),
});

export type AuditIssue = {
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  fix: string;
};

export type AuditRecommendation = {
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  agent: string;
};

export type AuditResult = {
  id?: string;
  url: string;
  score: number;
  summary: string;
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
  metrics: {
    title?: string;
    description?: string;
    h1Count: number;
    imageCount: number;
    imagesMissingAlt: number;
    internalLinks: number;
    externalLinks: number;
    wordCount: number;
    hasViewport: boolean;
    hasCanonical: boolean;
    hasOpenGraph: boolean;
    hasStructuredData: boolean;
    isHttps: boolean;
    loadTimeMs: number;
    sizeKb: number;
  };
  createdAt?: string;
};

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function match(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m?.[1]?.trim();
}

function crawlAndParse(url: string, html: string, loadTimeMs: number, sizeKb: number) {
  const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = match(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  );
  const h1s = html.match(/<h1[\s>][\s\S]*?<\/h1>/gi) ?? [];
  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  const imagesMissingAlt = images.filter((i) => !/\balt\s*=/i.test(i)).length;
  const links = html.match(/<a\b[^>]*href=["']([^"']+)["']/gi) ?? [];
  const host = new URL(url).host;
  let internal = 0,
    external = 0;
  for (const l of links) {
    const href = l.match(/href=["']([^"']+)["']/i)?.[1] ?? "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
      continue;
    try {
      const u = href.startsWith("http") ? new URL(href) : new URL(href, url);
      if (u.host === host) internal++;
      else external++;
    } catch {
      /* noop */
    }
  }
  const text = stripTags(html);
  const wordCount = text.split(" ").filter(Boolean).length;
  return {
    title,
    description,
    h1Count: h1s.length,
    imageCount: images.length,
    imagesMissingAlt,
    internalLinks: internal,
    externalLinks: external,
    wordCount,
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasCanonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    hasOpenGraph: /<meta[^>]+property=["']og:/i.test(html),
    hasStructuredData: /application\/ld\+json/i.test(html),
    isHttps: url.startsWith("https://"),
    loadTimeMs,
    sizeKb,
  };
}

function buildLocalAudit(metrics: AuditResult["metrics"]) {
  const issues: AuditIssue[] = [];
  const recommendations: AuditRecommendation[] = [];

  if (!metrics.title) {
    issues.push({
      severity: "critical",
      category: "Metadata",
      title: "Missing title tag",
      description: "Search engines may not have a clear title for this page.",
      fix: "Add one concise, descriptive title tag between 30 and 60 characters.",
    });
  }
  if (!metrics.description) {
    issues.push({
      severity: "warning",
      category: "Metadata",
      title: "Missing meta description",
      description: "The page does not define a search snippet description.",
      fix: "Add a unique meta description of roughly 120 to 160 characters.",
    });
  }
  if (metrics.h1Count === 0) {
    issues.push({
      severity: "warning",
      category: "Content",
      title: "No H1 heading found",
      description: "The primary topic of the page is not clearly marked.",
      fix: "Add one descriptive H1 that matches the page's main intent.",
    });
  } else if (metrics.h1Count > 1) {
    issues.push({
      severity: "info",
      category: "Content",
      title: "Multiple H1 headings",
      description: "Multiple H1 elements can make the page hierarchy less clear.",
      fix: "Keep one primary H1 and use H2 headings for the remaining sections.",
    });
  }
  if (metrics.imagesMissingAlt > 0) {
    issues.push({
      severity: "warning",
      category: "Accessibility",
      title: "Images missing alt text",
      description: `${metrics.imagesMissingAlt} image${metrics.imagesMissingAlt === 1 ? " is" : "s are"} missing alternative text.`,
      fix: "Add concise alt text to informative images and empty alt attributes to decorative images.",
    });
  }
  if (!metrics.hasViewport) {
    issues.push({
      severity: "warning",
      category: "Technical SEO",
      title: "Missing viewport metadata",
      description: "Mobile browsers may not size the page correctly.",
      fix: "Add a responsive viewport meta tag.",
    });
  }
  if (!metrics.hasCanonical) {
    issues.push({
      severity: "info",
      category: "Technical SEO",
      title: "Missing canonical URL",
      description: "Search engines are not given a preferred URL for this page.",
      fix: "Add a canonical link pointing to the preferred URL.",
    });
  }
  if (!metrics.hasOpenGraph) {
    issues.push({
      severity: "info",
      category: "Social",
      title: "Missing Open Graph metadata",
      description: "Social platforms may generate incomplete link previews.",
      fix: "Add og:title, og:description, and og:image metadata.",
    });
  }
  if (!metrics.hasStructuredData) {
    issues.push({
      severity: "info",
      category: "Structured data",
      title: "No structured data found",
      description: "The page does not expose schema markup for enhanced search results.",
      fix: "Add JSON-LD appropriate to the page type.",
    });
  }
  if (!metrics.isHttps) {
    issues.push({
      severity: "critical",
      category: "Security",
      title: "Page is not using HTTPS",
      description: "Unencrypted pages can lose trust and search visibility.",
      fix: "Serve the page over HTTPS and redirect HTTP requests.",
    });
  }
  if (metrics.wordCount < 300) {
    issues.push({
      severity: "info",
      category: "Content",
      title: "Thin page content",
      description: "The page contains relatively little readable content.",
      fix: "Expand useful, original content to fully answer the visitor's intent.",
    });
  }

  const deductions = issues.reduce(
    (total, issue) =>
      total + (issue.severity === "critical" ? 18 : issue.severity === "warning" ? 9 : 3),
    0,
  );
  const score = Math.max(0, Math.min(100, 100 - deductions));
  recommendations.push({
    priority: "high",
    title: "Resolve the highest-impact technical issues",
    detail:
      issues
        .filter((issue) => issue.severity === "critical")
        .map((issue) => issue.title)
        .join(", ") || "Maintain the current technical baseline.",
    agent: "Atlas AI",
  });
  recommendations.push({
    priority: "medium",
    title: "Improve page metadata and structure",
    detail:
      "Review the title, description, headings, canonical URL, and structured data identified above.",
    agent: "Atlas AI",
  });

  return {
    score,
    summary:
      issues.length === 0
        ? "This page has a strong baseline across the checks available locally."
        : `Found ${issues.length} SEO improvement${issues.length === 1 ? "" : "s"} from a local technical and content analysis.`,
    issues,
    recommendations,
  };
}

export const runAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => InputSchema.parse(raw))
  .handler(async ({ data, context }): Promise<AuditResult> => {
    // 1) Fetch the page
    const started = Date.now();
    let html = "";
    let sizeKb = 0;
    try {
      const { safeFetchText } = await import("./safe-fetch.server");
      const res = await safeFetchText(data.url, 15000);
      html = res.text;
      sizeKb = Math.round(html.length / 1024);
    } catch (err) {
      throw new Error(`Could not fetch ${data.url}: ${(err as Error).message}`);
    }
    const loadTimeMs = Date.now() - started;
    const metrics = crawlAndParse(data.url, html, loadTimeMs, sizeKb);

    // 2) Ask AI to grade & explain
    const excerpt = stripTags(html).slice(0, 4000);
    const system =
      "You are Atlas AI, Rankora's lead SEO engineer. Return STRICT JSON with keys: score (0-100 integer), summary (string, <=280 chars), issues (array), recommendations (array). issues[]: {severity: 'critical'|'warning'|'info', category, title, description, fix}. recommendations[]: {priority: 'high'|'medium'|'low', title, detail, agent}. Agent is one of: Atlas AI, SpiderX, Optimus, WriterMind, Keyword Hunter, Shadow Scan, Velocity, Guardian, Backlink Beast, GrowthPilot. Be specific and actionable.";
    const user = `Audit this page.\nURL: ${data.url}\nMetrics: ${JSON.stringify(metrics)}\nContent excerpt: ${excerpt}`;

    let parsed: {
      score: number;
      summary: string;
      issues: AuditIssue[];
      recommendations: AuditRecommendation[];
    };
    if (process.env.LOVABLE_API_KEY) {
      let raw = await callLovableAI({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) raw = jsonMatch[0];
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = buildLocalAudit(metrics);
      }
    } else {
      parsed = buildLocalAudit(metrics);
    }
    const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 60)));

    // 3) Persist
    const { data: inserted, error } = await context.supabase
      .from("audits")
      .insert({
        user_id: context.userId,
        url: data.url,
        score,
        status: "completed",
        summary: parsed.summary ?? "",
        issues: parsed.issues ?? [],
        recommendations: parsed.recommendations ?? [],
        metrics,
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(`Failed to save audit: ${error.message}`);

    return {
      id: inserted.id,
      createdAt: inserted.created_at,
      url: data.url,
      score,
      summary: parsed.summary ?? "",
      issues: parsed.issues ?? [],
      recommendations: parsed.recommendations ?? [],
      metrics,
    };
  });

export const listAudits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("audits")
      .select("id, url, score, summary, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
