# Rankora — Growth, SEO & Polish Upgrade

A review of the live site found real gaps in search visibility, trust content, and motion polish. Here is what to add.

## What's missing today (verified in the code)

- The home page has **no page-specific title/description** — it falls back to the sitewide default, the weakest possible setup for the most important page.
- **No canonical URL and no `og:url`** on any page. Crawlers can't tell which URL is authoritative.
- **No social share image.** Links to Rankora on X/LinkedIn/WhatsApp render as a bare grey box.
- **The sitemap is broken**: `BASE_URL` is an empty string, so every `<loc>` is a relative path — invalid per the sitemap spec, so Google will reject it.
- **No content surface at all**: no blog, no guides, no free tools, no FAQ, no testimonials, no comparison pages. Nothing for search engines to rank besides 5 marketing pages.
- Animation is good on the home page but **static below the fold** — no scroll-reveal, no counters, no live product demo.

## Phase 1 — SEO foundations (highest impact, do first)

1. Per-route `head()` on the home page with a keyword-led title and description.
2. Self-referencing `canonical` + `og:url` on every public leaf route.
3. Generate a branded OG share image (1200x630, Rankora logo on the aurora gradient) and wire `og:image` / `twitter:image` on home, features, pricing.
4. Fix the sitemap base URL to the real published domain and add `<lastmod>`.
5. Add JSON-LD per page type: `SoftwareApplication` + `Offer` on pricing, `BreadcrumbList` on inner pages, `FAQPage` on the new FAQ block.

## Phase 2 — Content that actually pulls traffic

6. **Free tool pages** (best traffic-per-effort for an SEO product): `/tools/meta-tag-checker`, `/tools/robots-txt-tester`, `/tools/schema-validator`. Each is a real working mini-tool using the existing audit backend — these rank and convert.
7. **Blog** at `/blog` and `/blog/$slug`, backed by a `posts` table with an admin editor in the existing admin panel. Ships with proper `Article` JSON-LD, author, dates, and reading time.
8. **FAQ section** on the home and pricing pages (answers real search queries + earns rich results).
9. **Comparison pages**: `/vs/semrush`, `/vs/ahrefs` — high commercial intent, low competition for a new brand.

## Phase 3 — Conversion & trust

10. Social proof strip: logos, metrics, and testimonials (**you supply the real quotes — I will not invent them**).
11. Live interactive product demo on the home page: an animated fake audit that scores a sample site, so visitors see value before signing up.
12. Sticky "Analyze your site" CTA bar that appears on scroll.
13. Newsletter capture in the footer, stored in the database.

## Phase 4 — Animation & performance polish

14. Scroll-reveal for every section (staggered fade + rise, respects `prefers-reduced-motion`).
15. Animated number counters for the stats, magnetic hover on primary buttons, 3D tilt on agent cards.
16. Marquee logo/agent rail, animated gradient mesh behind the CTA.
17. Performance: preload the display font, lazy-mount the chat widget and cursor glow, defer below-fold sections — protects your 0.4s target while adding motion.

## Technical notes

- All head tags use the TanStack `head()` route option; canonical goes on leaf routes only (never `__root`) to avoid duplicate tags.
- New tool pages reuse `safeFetchText` from `src/lib/safe-fetch.server.ts` so the SSRF hardening still applies.
- Blog posts get a `posts` table with public read of published rows plus admin-only write, with GRANTs and RLS.
- Animations use CSS/Tailwind keyframes and IntersectionObserver rather than a heavy animation dependency.

## Suggested order

Phase 1 alone in the first pass (fast, fixes what's actively broken), then Phase 4 for the visual lift, then Phase 2 content, then Phase 3.
