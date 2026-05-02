import type { AIFilters } from "@/types";
import { nurseries } from "@/lib/data";

const AREAS = ["Morningside", "Leith", "Bruntsfield", "Newington", "Stockbridge", "Corstorphine"] as const;

// EH10 is ambiguous (covers Morningside + Bruntsfield) so excluded from prefix map
// Full postcode lookup handles EH10 correctly via nursery data
const DISTRICT_MAP: Record<string, string> = {
  "eh6":  "Leith",
  "eh9":  "Newington",
  "eh3":  "Stockbridge",
  "eh12": "Corstorphine",
};

export const THINKING_STEPS = [
  "Reading your search...",
  "Identifying what you need...",
  "Matching nurseries...",
  "Almost there...",
] as const;

// ─── Resolvers ────────────────────────────────────────────────────────────────

function resolveArea(q: string): string | null {
  // 1. Named area
  const byName = AREAS.find((a) => q.includes(a.toLowerCase()));
  if (byName) return byName;

  // 2. Full postcode — match directly against nursery data (handles EH10 4HR vs EH10 4BX)
  const fullPostcode = q.match(/\beh\d+\s+\d[a-z]{2}\b/)?.[0]
    ?.toUpperCase()
    .replace(/\s+/, " ");
  if (fullPostcode) {
    const match = nurseries.find((n) => n.postcode === fullPostcode);
    if (match) return match.area;
  }

  // 3. District prefix (EH6, EH9, EH3, EH12)
  const district = q.match(/\beh\d+\b/)?.[0]?.toLowerCase();
  if (district) return DISTRICT_MAP[district] ?? null;

  return null;
}

function resolveAge(q: string): { minAge: number | null; maxAge: number | null } {
  if (/\b(baby|babies|infant|newborn|under[\s-]?1)\b/.test(q)) {
    return { minAge: 0, maxAge: 0.9 };
  }
  if (/\btoddler/.test(q)) {
    return { minAge: 1, maxAge: 2.9 };
  }
  if (/\b(preschool|pre-school|[345][\s-]?year)/.test(q)) {
    return { minAge: 3, maxAge: 5 };
  }
  // "X months old" e.g. "my son is 8 months old"
  const months = q.match(/(\d+)\s*months?\s*old/);
  if (months) {
    const ageYears = Number(months[1]) / 12;
    return { minAge: 0, maxAge: ageYears + 0.25 };
  }
  return { minAge: null, maxAge: null };
}

function resolvePrice(q: string): number | null {
  const explicit = q.match(
    /(?:under|less\s+than|max|below|up\s+to)\s*£?(\d+)|£?(\d+)\s*(?:a\s+day|per\s+day|\/day)/
  );
  if (explicit) return Number(explicit[1] ?? explicit[2]);
  if (/\b(cheap|affordable|budget)\b/.test(q)) return 52;
  return null;
}

function resolveAvailability(q: string): AIFilters["availFilter"] {
  if (/\b(available|spaces?\s+available|immediate|right\s+now)\b/.test(q)) return "available";
  if (/\b(waitlist|waiting\s+list)\b/.test(q)) return "waitlist";
  return "any";
}

function resolveTags(q: string): string[] {
  const tags: string[] = [];
  if (/\b(outdoor|forest\s+school)\b/.test(q))  tags.push("Outdoor Learning");
  if (/\bnature\b/.test(q))                       tags.push("Nature Play");
  if (/\bgarden\b/.test(q))                       tags.push("Garden");
  if (/\b(bilingual|french)\b/.test(q))           tags.push("Bilingual");
  if (/\b(stem|science|technology)\b/.test(q))    tags.push("STEM Focus");
  if (/\b(arts?|craft|creative)\b/.test(q))       tags.push("Arts & Crafts");
  if (/\b(funded|free\s+hours?)\b/.test(q))       tags.push("Funded Places");
  if (/\bflexible\b/.test(q))                     tags.push("Flexible Hours");
  if (/\byoga\b/.test(q))                         tags.push("Yoga");
  if (/\b(large|big)\s+setting\b/.test(q))        tags.push("Large Setting");
  return tags;
}

function resolveOfsted(q: string): AIFilters["ofsted"] {
  if (/\boutstanding\b/.test(q))        return "Outstanding";
  if (/requires\s+improvement/.test(q)) return "Requires Improvement";
  if (/\bgood\b/.test(q))               return "Good";
  return null;
}

function buildExplanation(f: Omit<AIFilters, "explanation">): string {
  const parts: string[] = [];
  if (f.ofsted) parts.push(f.ofsted);
  parts.push("nurseries");
  if (f.area) parts.push(`in ${f.area}`);
  if (f.maxAge !== null && f.maxAge < 1)                                      parts.push("for babies");
  else if (f.minAge !== null && f.minAge >= 1 && f.maxAge !== null && f.maxAge < 3) parts.push("for toddlers");
  else if (f.minAge !== null && f.minAge >= 3)                                parts.push("for preschoolers");
  if (f.maxPrice)                       parts.push(`under £${f.maxPrice}/day`);
  if (f.availFilter === "available")    parts.push("with spaces available");
  if (f.availFilter === "waitlist")     parts.push("on waitlist only");
  if (f.tags.length > 0)               parts.push(`with ${f.tags.join(" & ").toLowerCase()}`);
  return parts.join(" ");
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function parseQuery(query: string): AIFilters {
  const q = query.toLowerCase().trim();

  const filters = {
    area:        resolveArea(q),
    ofsted:      resolveOfsted(q),
    maxPrice:    resolvePrice(q),
    availFilter: resolveAvailability(q),
    tags:        resolveTags(q),
    ...resolveAge(q),
  };

  return { ...filters, explanation: buildExplanation(filters) };
}