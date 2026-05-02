import type { AIFilters } from "@/types";

const AREA_MAP: Record<string, string> = {
  morningside: "Morningside",
  leith: "Leith",
  bruntsfield: "Bruntsfield",
  newington: "Newington",
  stockbridge: "Stockbridge",
  corstorphine: "Corstorphine",
};

export const THINKING_STEPS = [
  "Reading your search...",
  "Identifying what you need...",
  "Matching nurseries...",
  "Almost there...",
];

export function parseQuery(query: string): AIFilters {
  const q = query.toLowerCase();

  // Area
  const areaKey = Object.keys(AREA_MAP).find((a) => q.includes(a)) ?? null;
  const area = areaKey ? AREA_MAP[areaKey] : null;

  // Ofsted
  let ofsted: AIFilters["ofsted"] = null;
  if (q.includes("outstanding")) ofsted = "Outstanding";
  else if (q.includes("requires improvement")) ofsted = "Requires Improvement";
  else if (q.includes("good")) ofsted = "Good";

  // Age
  let minAge: number | null = null;
  let maxAge: number | null = null;
  if (q.includes("baby") || q.includes("babies") || q.includes("infant") || q.includes("under 1") || q.includes("newborn")) {
    minAge = 0; maxAge = 1;
  } else if (q.includes("toddler")) {
    minAge = 1; maxAge = 3;
  } else if (q.includes("preschool") || q.includes("pre-school") || q.match(/[345]\s*year/)) {
    minAge = 3; maxAge = 5;
  }

  // Price
  let maxPrice: number | null = null;
  const priceMatch = q.match(/(?:under|less than|max|below)\s*£?(\d+)|£?(\d+)\s*(?:a day|per day|\/day)/);
  if (priceMatch) maxPrice = Number(priceMatch[1] ?? priceMatch[2]);
  else if (q.includes("cheap") || q.includes("affordable") || q.includes("budget")) maxPrice = 52;

  // Availability
  let availFilter: AIFilters["availFilter"] = "any";
  if (q.includes("available") || q.includes("spaces") || q.includes("immediate")) availFilter = "available";
  else if (q.includes("waitlist") || q.includes("waiting list")) availFilter = "waitlist";

  // Tags
  const tags: string[] = [];
  if (q.includes("outdoor") || q.includes("forest school")) tags.push("Outdoor Learning");
  if (q.includes("nature")) tags.push("Nature Play");
  if (q.includes("garden")) tags.push("Garden");
  if (q.includes("bilingual") || q.includes("french")) tags.push("Bilingual");
  if (q.includes("stem") || q.includes("science")) tags.push("STEM Focus");
  if (q.includes("arts") || q.includes("craft") || q.includes("creative")) tags.push("Arts & Crafts");
  if (q.includes("funded") || q.includes("free hours")) tags.push("Funded Places");
  if (q.includes("flexible")) tags.push("Flexible Hours");
  if (q.includes("yoga")) tags.push("Yoga");
  if (q.includes("large") || q.includes("big setting")) tags.push("Large Setting");

  // Human-readable explanation
  const parts: string[] = [];
  if (ofsted) parts.push(ofsted);
  parts.push("nurseries");
  if (area) parts.push(`in ${area}`);
  if (maxAge != null && maxAge <= 1) parts.push("for babies");
  else if (minAge != null && minAge >= 1 && maxAge != null && maxAge <= 3) parts.push("for toddlers");
  else if (minAge != null && minAge >= 3) parts.push("for preschoolers");
  if (maxPrice) parts.push(`under £${maxPrice}/day`);
  if (availFilter === "available") parts.push("with spaces available");
  if (tags.length > 0) parts.push(`with ${tags.join(" & ").toLowerCase()}`);

  return { area, minAge, maxAge, ofsted, maxPrice, availFilter, tags, explanation: parts.join(" ") };
}