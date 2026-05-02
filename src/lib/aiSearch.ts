import type { AIFilters } from "@/types";
import { nurseries } from "@/lib/data";

const AREAS = ["Morningside", "Leith", "Bruntsfield", "Newington", "Stockbridge", "Corstorphine"] as const;

// EH10 is ambiguous (covers Morningside + Bruntsfield) — handled by full postcode lookup
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

// ─── Normalise ────────────────────────────────────────────────────────────────
// Lowercase, collapse whitespace, normalise apostrophes
// Run once at the top — all resolvers receive the cleaned string

function normalise(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[''`]/g, "'")   // curly apostrophes → straight
    .replace(/\s+/g, " ")     // collapse runs of whitespace
    .trim();
}

// ─── Area ─────────────────────────────────────────────────────────────────────

function resolveArea(q: string): string | null {
  // Strip punctuation that might follow an area name: "leith." "leith," "leith!"
  const stripped = q.replace(/[.,!?;:]+/g, " ");

  // 1. Named area — word-boundary match so "newington" doesn't catch "kenningtonewington"
  const byName = AREAS.find((a) =>
    new RegExp(`\\b${a.toLowerCase()}\\b`).test(stripped)
  );
  if (byName) return byName;

  // 2. Full postcode — handles:
  //    EH10 4HR   (space)
  //    EH104HR    (no space)
  //    EH10-4HR   (hyphen)
  //    EH10  4HR  (double space, normalised to single above)
  const postcodeMatch = q.match(/\b(eh\d{1,2})[\s\-]?(\d[a-z]{2})\b/i);
  if (postcodeMatch) {
    const formatted = `${postcodeMatch[1].toUpperCase()} ${postcodeMatch[2].toUpperCase()}`;
    const hit = nurseries.find((n) => n.postcode === formatted);
    if (hit) return hit.area;
  }

  // 3. District prefix only (EH6, EH9, EH3, EH12, EH10)
  const districtMatch = q.match(/\b(eh\d{1,2})\b/i);
  if (districtMatch) {
    const district = districtMatch[1].toLowerCase();
    if (DISTRICT_MAP[district]) return DISTRICT_MAP[district];
    // Ambiguous prefix (EH10) — return first nursery whose postcode starts with it
    const hit = nurseries.find((n) =>
      n.postcode.toLowerCase().startsWith(district + " ")
    );
    if (hit) return hit.area;
  }

  return null;
}

// ─── Age ──────────────────────────────────────────────────────────────────────

function resolveAge(q: string): { minAge: number | null; maxAge: number | null } {
  // Weeks → definite baby (e.g. "6 weeks old", "10 weeks")
  if (/\b\d+\s*weeks?(?:\s*old)?\b/.test(q)) {
    return { minAge: 0, maxAge: 0.9 };
  }

  // Months — "6 months", "6 months old", "6-month-old", "my son is 8 months"
  const monthsMatch = q.match(/\b(\d{1,2})[\s\-]months?(?:[\s\-]old)?\b/);
  if (monthsMatch) {
    const months = Number(monthsMatch[1]);
    if (months <= 12) return { minAge: 0, maxAge: 0.9 };
    if (months <= 36) return { minAge: 1, maxAge: 2.9 };
    return { minAge: 3, maxAge: 5 };
  }

  // Baby keywords
  if (/\b(baby|babies|infant|newborn|under[\s\-]?1)\b/.test(q)) {
    return { minAge: 0, maxAge: 0.9 };
  }

  // Toddler keywords
  if (/\btoddlers?\b/.test(q)) {
    return { minAge: 1, maxAge: 2.9 };
  }

  // Preschool keywords
  if (/\b(preschool|pre[\s\-]school|nursery\s*school)\b/.test(q)) {
    return { minAge: 3, maxAge: 5 };
  }

  // Natural age phrases — "2 year old", "2-year-old", "aged 3", "she's 4", "my 18 month old"
  // Only match ages 0–5 (valid nursery ages)
  const yearPhrases = q.match(
    /\b(?:aged?|my|is|she'?s|he'?s|turning|for\s+(?:a|my))?\s*([0-5])[\s\-]?years?(?:[\s\-]old)?\b/
  );
  if (yearPhrases) {
    const age = Number(yearPhrases[1]);
    if (age === 0) return { minAge: 0, maxAge: 0.9 };
    if (age <= 2)  return { minAge: Math.max(0, age - 0.5), maxAge: age + 0.9 };
    return { minAge: age - 0.5, maxAge: Math.min(5, age + 0.9) };
  }

  // "under X" where X is 1–5 — age context, not price
  // "under 50" is price; "under 5" is age
  const underAgeMatch = q.match(/\bunder\s+([1-5])\b/);
  if (underAgeMatch) {
    const age = Number(underAgeMatch[1]);
    return { minAge: 0, maxAge: age - 0.1 };
  }

  return { minAge: null, maxAge: null };
}

// ─── Price ────────────────────────────────────────────────────────────────────

function resolvePrice(q: string): number | null {
  // Range "£50-£60" or "£50 to £60" — use upper bound
  const rangeMatch = q.match(/£(\d+)\s*(?:[\-–]|to)\s*£?(\d+)/);
  if (rangeMatch) return Number(rangeMatch[2]);

  // "around/approximately/roughly £X" — add £5 buffer
  const aroundMatch = q.match(/\b(?:around|approximately|roughly|about)\s*£?(\d+)/);
  if (aroundMatch) return Number(aroundMatch[1]) + 5;

  // Explicit ceiling — only if value >= 20 to avoid catching age expressions
  // "under £55/day", "less than 60 a day", "max £70", "50 pounds a day"
  const ceilMatch = q.match(
    /\b(?:under|less\s+than|below|max(?:imum)?|up\s+to)\s*£?(\d{2,})|£?(\d{2,})\s*(?:a\s+day|per\s+day|\/day|p\.?d\.?)|(\d{2,})\s*pounds?(?:\s*a\s+day)?/
  );
  if (ceilMatch) {
    const val = Number(ceilMatch[1] ?? ceilMatch[2] ?? ceilMatch[3]);
    if (val >= 20) return val;
  }

  // Vague affordability
  if (/\b(cheap|affordable|budget|inexpensive|low[\s\-]cost)\b/.test(q)) return 52;

  return null;
}

// ─── Availability ─────────────────────────────────────────────────────────────
// Be specific — "outdoor spaces" must NOT trigger this

function resolveAvailability(q: string): AIFilters["availFilter"] {
  if (
    /\b(spaces?\s+available|available\s+(?:now|space|places?)|has\s+space|places?\s+available|immediate\s+start|start\s+(?:now|immediately|asap|right\s+away))\b/.test(q)
  ) return "available";

  if (/\b(waitlist|waiting[\s\-]list|wait[\s\-]list|on\s+the\s+wait)\b/.test(q)) return "waitlist";

  return "any";
}

// ─── Ofsted ───────────────────────────────────────────────────────────────────
// "good" alone is risky — "good for babies", "a good area", "good location"
// Only treat bare "good" as Ofsted if it's not followed by common adjective continuations

function resolveOfsted(q: string): AIFilters["ofsted"] {
  if (/\boutstanding\b/.test(q)) return "Outstanding";
  if (/\b(requires?\s+improvement|needs?\s+improvement)\b/.test(q)) return "Requires Improvement";

  // Explicit Ofsted-good signals
  if (/\b(good\s+(?:ofsted|rating|rated)|ofsted[\s\-]good|rated\s+good)\b/.test(q)) return "Good";

  // Bare "good" — only if not followed by words that make it a generic adjective
  if (
    /\bgood\b/.test(q) &&
    !/\bgood\s+(?:for|with|at|in|near|and|area|location|option|place|one|value|price)\b/.test(q)
  ) return "Good";

  return null;
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

function resolveTags(q: string): string[] {
  const tags: string[] = [];

  // Outdoor Learning
  if (/\b(outdoor|outdoors|outside|forest[\s\-]school|forest\s+sessions?|fresh\s+air)\b/.test(q))
    tags.push("Outdoor Learning");

  // Nature Play
  if (/\b(nature[\s\-](?:play|based|walk)|natural\s+play)\b/.test(q))
    tags.push("Nature Play");

  // Garden
  if (/\b(garden|gardening)\b/.test(q))
    tags.push("Garden");

  // Bilingual
  if (/\b(bilingual|dual[\s\-]language|two\s+languages?|french|français)\b/.test(q))
    tags.push("Bilingual");

  // STEM Focus
  if (/\b(stem|science|technology|engineering|coding|robotics|maths?\s+focus)\b/.test(q))
    tags.push("STEM Focus");

  // Arts & Crafts
  if (/\b(arts?\s+and\s+crafts?|arts?|crafts?|creative|painting|drawing)\b/.test(q))
    tags.push("Arts & Crafts");

  // Funded Places — also catches "15 hours" / "30 hours" (Scottish/UK funded childcare)
  if (/\b(funded[\s\-]place|funded\s+hours?|free\s+hours?|15\s+hours?|30\s+hours?|government\s+hours?|funding)\b/.test(q))
    tags.push("Funded Places");

  // Flexible Hours
  if (/\b(flexible(?:\s+hours?)?|part[\s\-]time|part\s+days?|sessional)\b/.test(q))
    tags.push("Flexible Hours");

  // Yoga
  if (/\byoga\b/.test(q))
    tags.push("Yoga");

  // Large Setting
  if (/\b(large[\s\-]setting|big[\s\-]setting|large\s+nursery|big\s+nursery)\b/.test(q))
    tags.push("Large Setting");

  // Nursery School
  if (/\b(nursery[\s\-]school|school[\s\-]nursery)\b/.test(q))
    tags.push("Nursery School");

  return tags;
}

// ─── Explanation ──────────────────────────────────────────────────────────────

function buildExplanation(f: Omit<AIFilters, "explanation">): string {
  const parts: string[] = [];
  if (f.ofsted) parts.push(f.ofsted);
  parts.push("nurseries");
  if (f.area) parts.push(`in ${f.area}`);
  if (f.maxAge !== null && f.maxAge < 1) parts.push("for babies");
  else if (f.minAge !== null && f.minAge >= 1 && f.maxAge !== null && f.maxAge < 3) parts.push("for toddlers");
  else if (f.minAge !== null && f.minAge >= 3) parts.push("for preschoolers");
  if (f.maxPrice) parts.push(`under £${f.maxPrice}/day`);
  if (f.availFilter === "available") parts.push("with spaces available");
  if (f.availFilter === "waitlist") parts.push("on waitlist only");
  if (f.tags.length > 0) parts.push(`with ${f.tags.join(" & ").toLowerCase()}`);
  // Nothing resolved — show something sensible rather than just "nurseries"
  if (parts.length === 1 && parts[0] === "nurseries") return "all nurseries";
  return parts.join(" ");
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function parseQuery(query: string): AIFilters {
  const q = normalise(query);

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