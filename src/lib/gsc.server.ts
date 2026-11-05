// Server-only Google Search Console access via the Lovable connector gateway.
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

function keys() {
  const lovable = process.env.LOVABLE_API_KEY;
  const conn = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lovable || !conn) {
    throw new Error("Search Console is not connected for this project yet.");
  }
  return { lovable, conn };
}

async function gsc<T>(path: string, init?: RequestInit): Promise<T> {
  const { lovable, conn } = keys();
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovable}`,
      "X-Connection-Api-Key": conn,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Search Console request failed [${res.status}]: ${body.slice(0, 400)}`);
  }
  return (await res.json()) as T;
}

export type GscSite = { siteUrl: string; permissionLevel?: string };

export async function fetchSites(): Promise<GscSite[]> {
  const json = await gsc<{ siteEntry?: GscSite[] }>("/webmasters/v3/sites");
  return json.siteEntry ?? [];
}

export type GscRow = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscPerformance = {
  siteUrl: string;
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  queries: GscRow[];
  pages: GscRow[];
  days: GscRow[];
};

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function query(siteUrl: string, dimensions: string[], days: number, rowLimit: number) {
  const end = new Date();
  const start = new Date(Date.now() - days * 86400000);
  const json = await gsc<{ rows?: GscRow[] }>(
    `/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      body: JSON.stringify({
        startDate: iso(start),
        endDate: iso(end),
        dimensions,
        rowLimit,
      }),
    },
  );
  return json.rows ?? [];
}

export async function fetchPerformance(siteUrl: string, days = 28): Promise<GscPerformance> {
  const [queries, pages, dayRows] = await Promise.all([
    query(siteUrl, ["query"], days, 25),
    query(siteUrl, ["page"], days, 25),
    query(siteUrl, ["date"], days, 90),
  ]);

  const clicks = dayRows.reduce((a, r) => a + (r.clicks ?? 0), 0);
  const impressions = dayRows.reduce((a, r) => a + (r.impressions ?? 0), 0);
  const position =
    dayRows.length > 0 ? dayRows.reduce((a, r) => a + (r.position ?? 0), 0) / dayRows.length : 0;

  return {
    siteUrl,
    totals: {
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : 0,
      position,
    },
    queries,
    pages,
    days: dayRows,
  };
}

export function performanceDigest(perf: GscPerformance): string {
  const top = perf.queries
    .slice(0, 12)
    .map(
      (r) =>
        `${r.keys?.[0]}: ${r.clicks} clicks / ${r.impressions} impr, CTR ${(r.ctr * 100).toFixed(1)}%, pos ${r.position.toFixed(1)}`,
    )
    .join("\n");
  return `Search Console (last 28d) for ${perf.siteUrl}\nTotals: ${perf.totals.clicks} clicks, ${perf.totals.impressions} impressions, avg position ${perf.totals.position.toFixed(1)}\nTop queries:\n${top}`;
}
