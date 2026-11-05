/**
 * SSRF-hardened fetch for user-supplied URLs.
 *
 * Only public http(s) endpoints may be fetched. Loopback, private, link-local,
 * carrier-grade NAT and cloud-metadata targets are rejected, redirects are
 * followed manually so every hop is re-validated, and the response body is
 * capped and time-limited.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "instance-data",
]);

const BLOCKED_SUFFIXES = [".localhost", ".local", ".internal", ".home.arpa", ".onion"];

function isBlockedIPv4(host: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if ([a, Number(m[2]), Number(m[3]), Number(m[4])].some((n) => n > 255)) return true;
  if (a === 0 || a === 10 || a === 127) return true; // this-network, private, loopback
  if (a === 169 && b === 254) return true; // link-local + cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 192 && b === 0) return true; // IETF protocol assignments
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function isBlockedIPv6(host: string): boolean {
  if (!host.includes(":")) return false;
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "::" || h === "::1") return true; // unspecified, loopback
  if (h.startsWith("fe8") || h.startsWith("fe9") || h.startsWith("fea") || h.startsWith("feb"))
    return true; // link-local
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique local
  if (h.startsWith("::ffff:")) return isBlockedIPv4(h.slice(7)); // IPv4-mapped
  return false;
}

/** Throws when the URL is not a fetchable public http(s) target. */
export function assertPublicHttpUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs can be analyzed.");
  }
  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not allowed.");
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host) throw new Error("Invalid URL host.");
  if (BLOCKED_HOSTNAMES.has(host) || BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new Error("That address is not a public website.");
  }
  if (isBlockedIPv4(host) || isBlockedIPv6(host)) {
    throw new Error("That address is not a public website.");
  }
  // Bare hostnames without a dot are internal network names.
  if (!host.includes(".") && !host.includes(":")) {
    throw new Error("That address is not a public website.");
  }
  return url;
}

const MAX_BYTES = 2_000_000; // 2 MB of HTML is plenty for an audit
const MAX_REDIRECTS = 3;

/** Fetches a user-supplied page safely and returns its (truncated) text body. */
export async function safeFetchText(
  rawUrl: string,
  timeoutMs = 15000,
): Promise<{ text: string; finalUrl: string; status: number }> {
  let current = assertPublicHttpUrl(rawUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current.toString(), {
      redirect: "manual",
      headers: { "User-Agent": "RankoraBot/1.0 (+https://rankora.app)" },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirect without a destination.");
      current = assertPublicHttpUrl(new URL(location, current).toString());
      continue;
    }

    const text = (await res.text()).slice(0, MAX_BYTES);
    return { text, finalUrl: current.toString(), status: res.status };
  }

  throw new Error("Too many redirects.");
}
