import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/HomeClient";
import { buildHomeJsonLd } from "@/lib/seo";
import type { Nursery, OfstedRating } from "@/types";

// Revalidate the page every 60 seconds. Keeps content fresh without rebuilds
// while still serving cached HTML to most visitors.
export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nvvri.co.uk";

export default async function HomePage() {
  const rows = await prisma.nursery.findMany({ orderBy: { rating: "desc" } });

  const nurseries: Nursery[] = rows.map((n) => ({
    id: n.id,
    name: n.name,
    area: n.area,
    postcode: n.postcode,
    rating: n.rating,
    reviews: n.reviews,
    ageRange: n.ageRange,
    minAge: n.minAge,
    maxAge: n.maxAge,
    price: n.price,
    spaces: n.spaces,
    tags: n.tags,
    ofsted: n.ofsted as OfstedRating,
    hours: n.hours,
    description: n.description,
    lat: n.lat,
    lng: n.lng,
  }));

  const jsonLd = buildHomeJsonLd(nurseries, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD is safe here. The string is built from typed nursery data,
        // not user input, and Schema.org expects raw JSON in the script body.
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <HomeClient initialNurseries={nurseries} />
    </>
  );
}
