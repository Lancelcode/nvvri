import type { AIFilters, Nursery } from "@/types";
import { nurseries } from "@/lib/data";

const AREAS = [
  "Morningside",
  "Leith",
  "Bruntsfield",
  "Newington",
  "Stockbridge",
  "Corstorphine",
] as const;

// EH10 is ambiguous (covers Morningside + Bruntsfield), handled by full postcode lookup
const DISTRICT_MAP: Record<string, string> = {
  eh6: "Leith",
  eh9: "Newington",
  eh3: "Stockbridge",
  eh12: "Corstorphine",
};

// Words that belong to structured filters, excluded from free-text search
const FILTER_WORDS = new Set([
  "baby","babies","infant","newborn","toddler","toddlers","preschool","year","years",
  "month","months","week","weeks","under","aged","age","old",
  "outstanding","good","requires","improvement","needs","rated","rating","ofsted",
  "cheap","affordable","budget","inexpensive","max","maximum","around","approximately",
  "roughly","about","per","day","pounds","pound","price","cost",
  "available","spaces","space","waitlist","waiting","wait","list","immediate","immediately","asap",
  "outdoor","outdoors","outside","forest","nature","natural","garden","gardening",
  "bilingual","dual","language","french","stem","science","technology","engineering",
  "coding","robotics","arts","art","craft","crafts","creative","painting","drawing",
  "funded","funding","free","hours","hour","flexible","sessional","part","time","yoga",
  "large","big","setting","school","nursery","nurseries",
  "morningside","leith","bruntsfield","newington","stockbridge","corstorphine",
  "find","show","want","looking","look","need","for","the","and","with","in","near",
  "at","a","an","is","has","have","i","me","my","please","can","you","that","which","where",
]);

export const THINKING_STEPS = [
  "Reading your search...",
  "Identifying what you need...",
  "Matching nurseries...",
  "Almost there...",
] as const;

// Normalise

function normalise(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Area

function resolveArea(q: string): string | null {
  const stripped = q.replace(/[.,!?;:]+/g, " ");

  // 1. Exact area name (word-boundary)
  const exact = AREAS.find((a) =>
    new RegExp(`\\b${a.toLowerCase()}\\b`).test(stripped)
  );
  if (exact) return exact;

  // 2. Full postcode, EH10 4HR, EH104HR, EH10-4HR (any case/spacing)
  const fullMatch = q.match(/\b(eh\d{1,2})[\s\-]?(\d[a-z]{2})\b/i);
  if (fullMatch) {
    const formatted = `${fullMatch[1].toUpperCase()} ${fullMatch[2].toUpperCase()}`;
    const hit = nurseries.find((n) => n.postcode === formatted);
    if (hit) return hit.area;
  }

  // 3. Inward code only (e.g. "4BX", "4HR"), search all postcodes for match
  const inwardMatch = q.match(/\b(\d[a-z]{2})\b/i);
  if (inwardMatch) {
    const inward = inwardMatch[1].toUpperCase();
    const hit = nurseries.find((n) => n.postcode.endsWith(inward));
    if (hit) return hit.area;
  }

  // 4. District prefix, EH6, EH12, etc.
  const districtMatch = q.match(/\b(eh\d{1,2})\b/i);
  if (districtMatch) {
    const district = districtMatch[1].toLowerCase();
    if (DISTRICT_MAP[district]) return DISTRICT_MAP[district];
    const hit = nurseries.find((n) =>
      n.postcode.toLowerCase().startsWith(district + " ")
    );
    if (hit) return hit.area;
  }

  // 5. Partial/half-written area name, min 4 chars, prefix match
  //    "mornings" -> Morningside, "stock" -> Stockbridge, "brunts" -> Bruntsfield
  const words = stripped.split(/\s+/).filter((w) => w.length >= 4);
  for (const word of words) {
    const partial = AREAS.find((a) => a.toLowerCase().startsWith(word));
    if (partial) return partial;
  }

  return null;
}

// Age

function resolveAge(q: string): { minAge: number | null; maxAge: number | null } {
  // Weeks -> baby
  if (/\b\d+\s*weeks?(?:\s*old)?\b/.test(q)) {
    return { minAge: 0, maxAge: 0.9 };
  }

  // Months
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

  // Toddler
  if (/\btoddlers?\b/.test(q)) {
    return { minAge: 1, maxAge: 2.9 };
  }

  // Preschool
  if (/\b(preschool|pre[\s\-]school|nursery\s*school)\b/.test(q)) {
    return { minAge: 3, maxAge: 5 };
  }

  // "2 year old", "aged 3", "she's 4", "my 2-year-old"
  const yearPhrases = q.match(
    /\b(?:aged?|my|is|she'?s|he'?s|turning|for\s+(?:a|my))?\s*([0-5])[\s\-]?years?(?:[\s\-]old)?\b/
  );
  if (yearPhrases) {
    const age = Number(yearPhrases[1]);
    if (age === 0) return { minAge: 0, maxAge: 0.9 };
    if (age <= 2) return { minAge: Math.max(0, age - 0.5), maxAge: age + 0.9 };
    return { minAge: age - 0.5, maxAge: Math.min(5, age + 0.9) };
  }

  // "under X" where X is 1-5 (age, not price)
  const underAge = q.match(/\bunder\s+([1-5])\b/);
  if (underAge) {
    return { minAge: 0, maxAge: Number(underAge[1]) - 0.1 };
  }

  return { minAge: null, maxAge: null };
}

// Price

function resolvePrice(q: string): number | null {
  // Range £50-£60, use upper bound
  const range = q.match(/£(\d+)\s*(?:[\-–]|to)\s*£?(\d+)/);
  if (range) return Number(range[2]);

  // "around £X"
  const around = q.match(/\b(?:around|approximately|roughly|about)\s*£?(\d+)/);
  if (around) return Number(around[1]) + 5;

  // Explicit ceiling, only >= 20 to avoid catching age
  const ceil = q.match(
    /\b(?:under|less\s+than|below|max(?:imum)?|up\s+to)\s*£?(\d{2,})|£?(\d{2,})\s*(?:a\s+day|per\s+day|\/day|p\.?d\.?)|(\d{2,})\s*pounds?(?:\s*a\s+day)?/
  );
  if (ceil) {
    const val = Number(ceil[1] ?? ceil[2] ?? ceil[3]);
    if (val >= 20) return val;
  }

  if (/\b(cheap|affordable|budget|inexpensive|low[\s\-]cost)\b/.test(q)) return 52;

  return null;
}

// Availability

function resolveAvailability(q: string): AIFilters["availFilter"] {
  if (
    /\b(spaces?\s+available|available\s+(?:now|space|places?)|has\s+space|places?\s+available|immediate\s+start|start\s+(?:now|immediately|asap|right\s+away))\b/.test(
      q
    )
  )
    return "available";

  if (/\b(waitlist|waiting[\s\-]list|wait[\s\-]list|on\s+the\s+wait)\b/.test(q))
    return "waitlist";

  return "any";
}

// Ofsted

function resolveOfsted(q: string): AIFilters["ofsted"] {
  if (/\boutstanding\b/.test(q)) return "Outstanding";
  if (/\b(requires?\s+improvement|needs?\s+improvement)\b/.test(q))
    return "Requires Improvement";
  if (/\b(good\s+(?:ofsted|rating|rated)|ofsted[\s\-]good|rated\s+good)\b/.test(q))
    return "Good";
  if (
    /\bgood\b/.test(q) &&
    !/\bgood\s+(?:for|with|at|in|near|and|area|location|option|place|one|value|price)\b/.test(
      q
    )
  )
    return "Good";
  return null;
}

// Tags

function resolveTags(q: string): string[] {
  const tags: string[] = [];

  if (
    /\b(outdoor|outdoors|outside|forest[\s\-]school|forest\s+sessions?|fresh\s+air)\b/.test(
      q
    )
  )
    tags.push("Outdoor Learning");
  if (/\b(nature[\s\-](?:play|based|walk)|natural\s+play)\b/.test(q))
    tags.push("Nature Play");
  if (/\b(garden|gardening)\b/.test(q)) tags.push("Garden");
  if (
    /\b(bilingual|dual[\s\-]language|two\s+languages?|french|français|english[\s\/]french)\b/.test(
      q
    )
  )
    tags.push("Bilingual");
  if (/\b(stem|science|technology|engineering|coding|robotics|play\s+zones?)\b/.test(q))
    tags.push("STEM Focus");
  if (/\b(arts?\s+and\s+crafts?|arts?|crafts?|creative|painting|drawing)\b/.test(q))
    tags.push("Arts & Crafts");
  if (
    /\b(funded[\s\-]place|funded\s+hours?|free\s+hours?|15\s+hours?|30\s+hours?|government\s+hours?|funding)\b/.test(
      q
    )
  )
    tags.push("Funded Places");
  if (
    /\b(flexible(?:\s+hours?)?|part[\s\-]time|part\s+days?|sessional|flexible\s+working)\b/.test(
      q
    )
  )
    tags.push("Flexible Hours");
  if (/\byoga\b/.test(q)) tags.push("Yoga");
  if (
    /\b(large[\s\-]setting|big[\s\-]setting|large\s+nursery|big\s+nursery|large\s+outdoor)\b/.test(
      q
    )
  )
    tags.push("Large Setting");
  if (/\b(nursery[\s\-]school|school[\s\-]nursery)\b/.test(q))
    tags.push("Nursery School");

  return tags;
}

// Name / free-text search
// Captures words that didn't match any structured filter.
// Used for partial nursery name matching and description keyword search.
// e.g. "meadow" -> finds Meadowside, "inverleith" -> finds Little Explorers

function resolveNameSearch(q: string): string | null {
  const words = q
    .split(/\s+/)
    .filter(
      (w) =>
        w.length >= 3 && // ignore tiny words
        !FILTER_WORDS.has(w) && // not a filter keyword
        !/^[£\d\-–]+$/.test(w) && // not a number or price
        !/^eh\d/i.test(w) // not a postcode
    );

  return words.length > 0 ? words.join(" ") : null;
}

// Explanation

function buildExplanation(f: Omit<AIFilters, "explanation">): string {
  const parts: string[] = [];
  if (f.ofsted) parts.push(f.ofsted);
  parts.push("nurseries");
  if (f.area) parts.push(`in ${f.area}`);
  else if (f.nameSearch) parts.push(`matching "${f.nameSearch}"`);
  if (f.maxAge !== null && f.maxAge < 1) parts.push("for babies");
  else if (
    f.minAge !== null &&
    f.minAge >= 1 &&
    f.maxAge !== null &&
    f.maxAge < 3
  )
    parts.push("for toddlers");
  else if (f.minAge !== null && f.minAge >= 3) parts.push("for preschoolers");
  if (f.maxPrice) parts.push(`under £${f.maxPrice}/day`);
  if (f.availFilter === "available") parts.push("with spaces available");
  if (f.availFilter === "waitlist") parts.push("on waitlist only");
  if (f.tags.length > 0)
    parts.push(`with ${f.tags.join(" & ").toLowerCase()}`);
  if (parts.length === 1 && parts[0] === "nurseries") return "all nurseries";
  return parts.join(" ");
}

// Main export

export function parseQuery(query: string): AIFilters {
  const q = normalise(query);

  const filters = {
    area: resolveArea(q),
    ofsted: resolveOfsted(q),
    maxPrice: resolvePrice(q),
    availFilter: resolveAvailability(q),
    tags: resolveTags(q),
    nameSearch: resolveNameSearch(q),
    ...resolveAge(q),
  };

  return { ...filters, explanation: buildExplanation(filters) };
}

// Answer builder for the AI answer card
//
// Generates a 1-2 sentence summary of the filtered results.
// Deterministic and instant, no extra API call needed.
// Picks the strongest result and surfaces the most useful detail.
export function buildAnswer(filters: AIFilters, results: Nursery[]): string {
  if (results.length === 0) {
    return suggestRelaxation(filters);
  }

  const top = results[0];
  const availLabel =
    top.spaces > 0
      ? `${top.spaces} space${top.spaces === 1 ? "" : "s"} from £${top.price}/day`
      : `currently on waitlist`;

  if (results.length === 1) {
    return `${top.name} is the only match. ${highlightFor(top, filters)} It is ${availLabel}.`;
  }

  if (results.length <= 3) {
    const names = results.map((r) => r.name).join(", ");
    return `${results.length} nurseries match: ${names}. ${top.name} is top-rated (${top.rating}/5, ${availLabel}).`;
  }

  return `${results.length} nurseries match. ${top.name} is the top-rated option (${top.ofsted}, ${top.rating}/5, ${availLabel}).`;
}

// Picks the most relevant property of a nursery to surface, given the user's
// filters. Tries to mention what the user actually asked for.
function highlightFor(n: Nursery, filters: AIFilters): string {
  if (filters.tags.length > 0) {
    const matchedTag = filters.tags.find((t) => n.tags.includes(t));
    if (matchedTag) return `${matchedTag} setting in ${n.area}.`;
  }
  if (filters.ofsted && n.ofsted === filters.ofsted) {
    return `${n.ofsted}-rated by Ofsted in ${n.area}.`;
  }
  if (filters.area) {
    return `Located in ${n.area}, rated ${n.ofsted}.`;
  }
  return `${n.ofsted}-rated, in ${n.area}.`;
}

// When no results match, suggest the most likely-too-strict filter to drop.
function suggestRelaxation(filters: AIFilters): string {
  if (filters.maxPrice !== null) {
    return `No nurseries match under £${filters.maxPrice}/day. Try increasing the budget or removing other filters.`;
  }
  if (filters.availFilter === "available") {
    return "No nurseries with immediate spaces. Try removing the availability filter to see waitlist options.";
  }
  if (filters.area && filters.tags.length > 0) {
    return `No nurseries in ${filters.area} with all of those features. Try a wider area or fewer tags.`;
  }
  if (filters.tags.length > 1) {
    return `No nurseries match all of those features at once. Try fewer tags.`;
  }
  return "No matches. Try a different area or relax the filters.";
}
