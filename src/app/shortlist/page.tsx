import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ShortlistClient } from "@/components/ShortlistClient";
import type { Nursery, OfstedRating } from "@/types";

export const metadata: Metadata = {
  title: "Your shortlist",
  description: "Nurseries you have saved to compare and enquire.",
  // Personal page, do not index it.
  robots: { index: false, follow: false },
};

// Pull every nursery server-side so the client can render whichever the
// user has saved without a second round-trip.
export default async function ShortlistPage() {
  const rows = await prisma.nursery.findMany();

  const all: Nursery[] = rows.map((n) => ({
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

  return <ShortlistClient allNurseries={all} />;
}
