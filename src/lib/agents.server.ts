// Server-only multi-agent engine.

export type AgentId = "atlas" | "spiderx" | "optimus" | "backlink-beast" | "writermind";

export const AGENTS: Record<
  AgentId,
  { id: AgentId; name: string; role: string; focus: string; prompt: string }
> = {
  atlas: {
    id: "atlas",
    name: "Atlas AI",
    role: "Lead SEO strategist",
    focus: "Overall strategy, priorities, and scoring",
    prompt:
      "You are Atlas AI, the lead SEO strategist. Synthesize the page into a strategic plan: what matters most, in what order, and what impact each change has.",
  },
  spiderx: {
    id: "spiderx",
    name: "SpiderX",
    role: "Technical crawler",
    focus: "Crawlability, indexation, metadata, structured data",
    prompt:
      "You are SpiderX, the technical crawl agent. Focus purely on crawlability, indexability, canonical/robots/meta signals, structured data, sitemaps and heading structure.",
  },
  optimus: {
    id: "optimus",
    name: "Optimus",
    role: "Performance engineer",
    focus: "Speed, Core Web Vitals, page weight",
    prompt:
      "You are Optimus, the performance agent. Focus on page weight, render-blocking assets, image optimization, caching and Core Web Vitals.",
  },
  "backlink-beast": {
    id: "backlink-beast",
    name: "Backlink Beast",
    role: "Authority analyst",
    focus: "Link profile, internal linking, authority",
    prompt:
      "You are Backlink Beast, the authority agent. Focus on internal linking architecture, anchor text, outbound link quality and realistic link-earning opportunities for this page.",
  },
  writermind: {
    id: "writermind",
    name: "WriterMind",
    role: "Content strategist",
    focus: "Copy, intent match, semantic depth",
    prompt:
      "You are WriterMind, the content agent. Focus on search intent match, semantic coverage, readability, headline quality and content gaps.",
  },
};

export const AGENT_LIST = Object.values(AGENTS);

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildLocalAgentOutput(
  agentId: AgentId,
  facts: {
    sizeKb: number;
    wordCount: number;
    title?: string;
    h1Count: number;
    imageCount: number;
    imagesMissingAlt: number;
    scripts: number;
    stylesheets: number;
    links: number;
    hasCanonical: boolean;
    hasStructuredData: boolean;
    hasOpenGraph: boolean;
    hasViewport: boolean;
  },
): AgentOutput {
  const findings: AgentFinding[] = [];
  const fixes: AgentFix[] = [];
  const add = (
    severity: AgentFinding["severity"],
    title: string,
    detail: string,
    action: string,
    effort: AgentFix["effort"] = "low",
  ) => {
    findings.push({ severity, title, detail });
    fixes.push({ title, action, effort });
  };

  if (!facts.title)
    add(
      "critical",
      "Missing page title",
      "No title element was found in the fetched HTML.",
      "Add a unique, descriptive title element, ideally around 30-60 characters.",
    );
  if (facts.h1Count === 0)
    add(
      "warning",
      "No H1 heading",
      "The page has no detectable primary heading.",
      "Add one descriptive H1 that states the page's main topic.",
    );
  if (facts.h1Count > 1)
    add(
      "info",
      "Multiple H1 headings",
      `Found ${facts.h1Count} H1 headings.`,
      "Keep one primary H1 and use H2 headings for sections.",
    );
  if (!facts.hasCanonical)
    add(
      "warning",
      "No canonical URL",
      "No canonical link element was found.",
      "Add a canonical link to the preferred version of this page.",
    );
  if (!facts.hasViewport)
    add(
      "warning",
      "No viewport metadata",
      "A viewport declaration was not found in the page head.",
      "Add a responsive viewport meta tag and verify the mobile layout.",
    );
  if (!facts.hasStructuredData)
    add(
      "info",
      "No structured data detected",
      "No JSON-LD structured data was found in the fetched HTML.",
      "Add valid JSON-LD that matches the page content and type.",
      "medium",
    );
  if (!facts.hasOpenGraph)
    add(
      "info",
      "Open Graph metadata missing",
      "No Open Graph property was detected.",
      "Add og:title, og:description, and og:image for share previews.",
    );
  if (facts.imagesMissingAlt > 0)
    add(
      "warning",
      "Images missing alt text",
      `${facts.imagesMissingAlt} of ${facts.imageCount} images have no alt attribute.`,
      'Write concise alt text for informative images; use alt="" for decorative images.',
    );
  if (facts.wordCount < 300)
    add(
      "info",
      "Limited readable page content",
      `Only ${facts.wordCount} words were extracted from the HTML.`,
      "Add useful, original content that answers the page's target search intent.",
      "medium",
    );
  if (facts.sizeKb > 1500)
    add(
      "warning",
      "Large HTML document",
      `The fetched HTML is about ${facts.sizeKb} KB.`,
      "Reduce rendered HTML where possible and defer nonessential page content.",
      "medium",
    );
  if (facts.scripts > 20)
    add(
      "info",
      "Many script elements",
      `Found ${facts.scripts} script elements; this is a source-level count, not a performance measurement.`,
      "Audit third-party scripts and defer those not needed for initial rendering.",
      "medium",
    );

  const score = Math.max(
    0,
    100 -
      findings.reduce(
        (sum, item) =>
          sum + (item.severity === "critical" ? 18 : item.severity === "warning" ? 9 : 3),
        0,
      ),
  );
  let summary = findings.length
    ? `Local HTML checks found ${findings.length} potential SEO improvement${findings.length === 1 ? "" : "s"}. This checks fetched markup, not live rankings or off-site backlink data.`
    : "No issues were detected by the available local HTML checks. This is not a ranking or off-site backlink assessment.";

  if (agentId === "backlink-beast") {
    summary = `On-page link context: ${facts.links} links detected. External backlink counts and domain authority require a separate backlink data provider; they are not inferred here.`;
    if (facts.links === 0)
      add(
        "warning",
        "No links detected in page markup",
        "No anchor links were found in the fetched HTML.",
        "Add useful internal links to related pages and cite trustworthy external sources where relevant.",
      );
    else
      add(
        "info",
        "On-page links detected",
        `Found ${facts.links} anchor links in the fetched HTML; this does not measure inbound backlinks.`,
        "Review link destinations and anchor text, then use Search Console or a backlink provider for off-site link data.",
      );
  }

  return { score, summary, findings, fixes };
}

export type AgentFinding = {
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
};
export type AgentFix = { title: string; action: string; effort: "low" | "medium" | "high" };

export type AgentOutput = {
  score: number;
  summary: string;
  findings: AgentFinding[];
  fixes: AgentFix[];
};

export async function runAgentAnalysis(
  agentId: AgentId,
  url: string,
  searchConsoleDigest?: string,
): Promise<{ output: AgentOutput; durationMs: number; model: string }> {
  const agent = AGENTS[agentId];
  const started = Date.now();

  let html = "";
  try {
    const { safeFetchText } = await import("./safe-fetch.server");
    html = (await safeFetchText(url, 15000)).text;
  } catch (err) {
    throw new Error(`Could not fetch ${url}: ${(err as Error).message}`);
  }

  const sizeKb = Math.round(html.length / 1024);
  const text = stripTags(html);
  const facts = {
    sizeKb,
    wordCount: text.split(" ").filter(Boolean).length,
    title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim(),
    h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
    imageCount: (html.match(/<img\b/gi) ?? []).length,
    imagesMissingAlt: (html.match(/<img\b[^>]*>/gi) ?? []).filter((i) => !/\balt\s*=/i.test(i))
      .length,
    scripts: (html.match(/<script\b/gi) ?? []).length,
    stylesheets: (html.match(/rel=["']stylesheet["']/gi) ?? []).length,
    links: (html.match(/<a\b[^>]*href=/gi) ?? []).length,
    hasCanonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    hasStructuredData: /application\/ld\+json/i.test(html),
    hasOpenGraph: /<meta[^>]+property=["']og:/i.test(html),
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
  };

  const model = "google/gemini-2.5-flash";
  const system = `${agent.prompt}\nReturn STRICT JSON: {"score": integer 0-100, "summary": string <=240 chars, "findings": [{"severity":"critical"|"warning"|"info","title":string,"detail":string}], "fixes": [{"title":string,"action":string,"effort":"low"|"medium"|"high"}]}. Stay strictly within your specialty. Be concrete and reference real evidence from the page.`;
  const user = [
    `URL: ${url}`,
    `Page facts: ${JSON.stringify(facts)}`,
    searchConsoleDigest ? `\n${searchConsoleDigest}` : "",
    `\nContent excerpt: ${text.slice(0, 3500)}`,
  ].join("\n");

  let output: AgentOutput;
  let modelUsed = model;
  if (process.env.LOVABLE_API_KEY) {
    try {
      const { callLovableAI } = await import("./ai-gateway.server");
      let raw = await callLovableAI({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) raw = m[0];
      const parsed = JSON.parse(raw) as Partial<AgentOutput>;
      output = {
        score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 60))),
        summary: parsed.summary ?? "",
        findings: Array.isArray(parsed.findings) ? parsed.findings : [],
        fixes: Array.isArray(parsed.fixes) ? parsed.fixes : [],
      };
    } catch {
      output = buildLocalAgentOutput(agentId, facts);
      modelUsed = "local-seo-rules";
    }
  } else {
    output = buildLocalAgentOutput(agentId, facts);
    modelUsed = "local-seo-rules";
  }

  return { output, durationMs: Date.now() - started, model: modelUsed };
}
