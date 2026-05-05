import type { Nursery } from "@/types";

/**
 * Builds Schema.org JSON-LD for a single nursery using the Preschool type
 * (which extends EducationalOrganization). Helps Google show rich results
 * with rating stars, opening hours, and address in the local pack.
 *
 * Reference:
 *   https://schema.org/Preschool
 *   https://developers.google.com/search/docs/appearance/structured-data
 */
export function buildNurseryJsonLd(nursery: Nursery, siteUrl: string, slug: string): string {
  const json = {
    "@context": "https://schema.org",
    "@type": "Preschool",
    "@id": `${siteUrl}/nursery/${slug}`,
    name: nursery.name,
    description: nursery.description,
    url: `${siteUrl}/nursery/${slug}`,
    address: {
      "@type": "PostalAddress",
      postalCode: nursery.postcode,
      addressLocality: nursery.area,
      addressRegion: "Edinburgh",
      addressCountry: "GB",
    },
    ...(nursery.lat != null && nursery.lng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: nursery.lat,
            longitude: nursery.lng,
          },
        }
      : {}),
    openingHours: openingHoursToISO(nursery.hours),
    priceRange: `£${nursery.price} per day`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: nursery.rating,
      reviewCount: nursery.reviews,
      bestRating: 5,
      worstRating: 1,
    },
    keywords: [...nursery.tags, nursery.ofsted].join(", "),
  };

  return JSON.stringify(json);
}

/**
 * Builds JSON-LD for the nursery directory home page.
 * Uses the WebSite + ItemList combination so Google understands
 * this is a directory of organisations.
 */
export function buildHomeJsonLd(nurseries: Nursery[], siteUrl: string): string {
  const json = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "nvvri",
    url: siteUrl,
    description: "Find and compare Edinburgh nurseries with natural language AI search.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: nurseries.length,
      itemListElement: nurseries.slice(0, 10).map((n, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Preschool",
          name: n.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: n.area,
            addressRegion: "Edinburgh",
            addressCountry: "GB",
          },
        },
      })),
    },
  };

  return JSON.stringify(json);
}

/**
 * Converts a human-readable hours string ("7:30am - 6:00pm") into
 * Schema.org openingHours format ("Mo-Fr 07:30-18:00").
 *
 * Assumes weekday opening; nurseries don't typically run weekends.
 * Returns null if the string can't be parsed cleanly.
 */
function openingHoursToISO(hours: string): string | null {
  const cleaned = hours.replace(/\s+/g, " ").trim();
  const match = cleaned.match(
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i
  );
  if (!match) return null;

  const to24 = (h: string, m: string | undefined, ap: string): string => {
    let hour = Number(h);
    const min = m ?? "00";
    if (ap.toLowerCase() === "pm" && hour < 12) hour += 12;
    if (ap.toLowerCase() === "am" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${min}`;
  };

  return `Mo-Fr ${to24(match[1], match[2], match[3])}-${to24(match[4], match[5], match[6])}`;
}
