import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function serverPublicSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listAnnouncements = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await serverPublicSupabase();
  const nowIso = new Date().toISOString();
  const { data, error } = await sb
    .from("announcements")
    .select("id, title, body, kind, pinned, starts_at, ends_at, created_at")
    .eq("published", true)
    .lte("starts_at", nowIso)
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return [];
  return data ?? [];
});

export const listSiteDetails = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await serverPublicSupabase();
  const { data, error } = await sb
    .from("site_details")
    .select("id, label, value, category, sort_order")
    .order("sort_order", { ascending: true })
    .limit(100);
  if (error) return [];
  return data ?? [];
});

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

const SYSTEM_PROMPT = `You are "Rank", the official AI guide for Rankora — an AI SEO automation platform.

About Rankora:
- Users paste a website URL and Rankora crawls it, scores it (0-100), finds issues and generates fixes.
- Specialized AI agents: Atlas AI (strategy & overall SEO), SpiderX (technical crawl & indexation), Optimus (on-page optimisation), Backlink Beast (off-page & authority), WriterMind (content & copy).
- Key areas of the app: Dashboard (run an audit, see score + recommendations), Projects (add a website, watch agent progress live, read the finished audit), Agent Hub (run individual agents), Agent Analytics (run counts, avg time, success rate, score trends, recurring issues), Search Console (connect Google Search Console, import performance data), Support (message the team).
- Pricing and plans are on the /pricing page. Marketing pages: /features, /agents, /about.

How to behave:
- Read the entire conversation and answer the user's latest request directly. Do not guess what they meant.
- If the request is ambiguous, ask one focused clarifying question before giving advice.
- Be warm, clear and practical. Give enough detail for a beginner to follow: explain what the step does, where to find it, and what result to expect. Use short paragraphs, headings, numbered steps, and bullet lists instead of one dense wall of text.
- Use 1-3 natural emojis when they improve readability; never replace important words with emojis.
- Guide the user to the right screen for what they want, and explain exactly what to click.
- If asked SEO questions, give specific, actionable advice (titles, meta descriptions, headings, internal links, Core Web Vitals, schema, backlinks, content depth, search intent).
- Separate known facts from assumptions. Never claim an action succeeded unless the user or a tool confirms it.
- If you don't know something Rankora-specific, say so and suggest sending a message to the team from the Support page.
- Never invent prices, never claim to perform actions yourself, never ask for passwords.
- Answer in the user's language.`;

function localRankReply(messages: z.infer<typeof ChatSchema>["messages"]): string {
  const latest = messages[messages.length - 1]?.content.trim().toLowerCase() ?? "";

  if (!latest) return "Please tell me what you would like help with. 🙂";
  if (
    latest.includes("hello") ||
    latest.includes("hi ") ||
    latest === "hi" ||
    latest.includes("hey")
  ) {
    return "Hi! 👋 I can help with audits, SEO fixes, projects, AI agents, and Google Search Console. What would you like to do?";
  }
  if (latest.includes("search console") || latest.includes("google")) {
    return "Open **Search Console** from the dashboard, connect your Google property, and import performance data. You will need access to the Google account that owns the property. 🔎";
  }
  if (latest.includes("audit") || latest.includes("crawl")) {
    return "To audit a website, open **Dashboard**, paste the full URL including `https://`, and select **Run audit**. Rankora checks metadata, headings, links, images, HTTPS, structured data, content depth, and page size. 🚀";
  }
  if (latest.includes("agent")) {
    return "Use **Atlas AI** for strategy, **SpiderX** for technical SEO, **Optimus** for on-page improvements, **Backlink Beast** for authority and links, and **WriterMind** for content and copy.";
  }
  if (latest.includes("score") || latest.includes("improve") || latest.includes("seo")) {
    return "Start with the highest-impact fixes: add a unique title and meta description, use one clear H1, add descriptive image alt text, improve internal links, enable HTTPS, and add relevant structured data. Run another audit after making changes.";
  }
  if (latest.includes("project")) {
    return "Open **Projects** to add and track a website. Projects keep audits, agent runs, and progress together so you can compare improvements over time.";
  }
  return "I can help with website audits, SEO scores, technical fixes, AI agents, projects, and Google Search Console. Ask me what you want to improve, or open **Dashboard** to run an audit.";
}

export const chatWithRankora = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => ChatSchema.parse(raw))
  .handler(async ({ data }) => {
    if (!process.env.LOVABLE_API_KEY) {
      return { reply: localRankReply(data.messages) };
    }

    try {
      const { callLovableAI } = await import("./ai-gateway.server");
      const reply = await callLovableAI({
        model: "google/gemini-3.6-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      });
      return { reply: reply || localRankReply(data.messages) };
    } catch {
      return { reply: localRankReply(data.messages) };
    }
  });
