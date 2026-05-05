import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nvvri.co.uk";

/**
 * Dynamic sitemap. Re-generated on each build and on every ISR revalidation.
 * Each nursery gets its own URL. Search engines crawl the sitemap to find
 * pages they would not otherwise discover.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await prisma.nursery.findMany({
    select: { name: true, updatedAt: true },
  });

  const nurseryUrls: MetadataRoute.Sitemap = rows.map((n) => ({
    url: `${siteUrl}/nursery/${slugify(n.name)}`,
    lastModified: n.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...nurseryUrls,
  ];
}
