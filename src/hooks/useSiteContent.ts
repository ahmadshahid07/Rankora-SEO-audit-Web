import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSiteDetails } from "@/lib/public.functions";

export type SiteContentKey =
  | "hero_badge"
  | "hero_title"
  | "hero_highlight"
  | "hero_title_end"
  | "hero_subtitle"
  | "hero_cta"
  | "footer_tagline";

export const SITE_CONTENT_FIELDS: { key: SiteContentKey; label: string; fallback: string }[] = [
  {
    key: "hero_badge",
    label: "Hero badge",
    fallback: "10 specialized AI agents · Live SEO analysis",
  },
  { key: "hero_title", label: "Hero headline (start)", fallback: "The world's most" },
  { key: "hero_highlight", label: "Hero headline (highlighted word)", fallback: "intelligent" },
  { key: "hero_title_end", label: "Hero headline (end)", fallback: "AI SEO automation platform." },
  {
    key: "hero_subtitle",
    label: "Hero subheadline",
    fallback:
      "Paste your URL. Rankora crawls, audits, scores, fixes, and writes — like an entire SEO engineering team compressed into an agent swarm.",
  },
  { key: "hero_cta", label: "Hero button label", fallback: "Analyze" },
  { key: "footer_tagline", label: "Footer tagline", fallback: "Rankora — AI SEO automation" },
];

/** Live, admin-editable website copy (stored in site details, category "content"). */
export function useSiteContent() {
  const fetchDetails = useServerFn(listSiteDetails);
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => fetchDetails(),
    staleTime: 60_000,
  });

  const map = new Map<string, string>();
  for (const d of (data ?? []) as any[]) {
    if (d.category === "content") map.set(d.label, d.value);
  }

  return (key: SiteContentKey) => {
    const field = SITE_CONTENT_FIELDS.find((f) => f.key === key);
    return map.get(key) ?? field?.fallback ?? "";
  };
}
