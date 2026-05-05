import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { buildNurseryJsonLd } from "@/lib/seo";
import { NurseryActions } from "@/components/NurseryActions";
import type { Nursery, OfstedRating } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nvvri.co.uk";

// Pre-render every nursery page at build time. Next.js will fall back to
// on-demand rendering for slugs added after build, then cache the result.
export async function generateStaticParams() {
  const rows = await prisma.nursery.findMany({ select: { name: true } });
  return rows.map((r) => ({ slug: slugify(r.name) }));
}

// Per-page metadata. Title, description, OG, Twitter, canonical URL.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const nursery = await findBySlug(slug);
  if (!nursery) return {};

  const title = `${nursery.name}, ${nursery.area}`;
  const description =
    nursery.description.length <= 155
      ? nursery.description
      : `${nursery.description.slice(0, 152)}...`;

  return {
    title,
    description,
    alternates: { canonical: `/nursery/${slug}` },
    openGraph: {
      type: "website",
      url: `${siteUrl}/nursery/${slug}`,
      title: `${title} | nvvri`,
      description,
      siteName: "nvvri",
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | nvvri`,
      description,
    },
  };
}

// Revalidate static pages every 60 seconds.
export const revalidate = 60;

export default async function NurseryPage({ params }: PageProps) {
  const { slug } = await params;
  const nursery = await findBySlug(slug);
  if (!nursery) notFound();

  const jsonLd = buildNurseryJsonLd(nursery, siteUrl, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Nav */}
        <nav
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#1a7a4a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width={18}
                height={18}
                fill="none"
                stroke="white"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 17,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              nvvri
            </span>
          </Link>
        </nav>

        <main
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "32px 24px",
          }}
        >
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}
          >
            <Link
              href="/"
              style={{ color: "#1a7a4a", textDecoration: "none" }}
            >
              Nurseries
            </Link>
            <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
            <span>{nursery.area}</span>
            <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
            <span style={{ color: "#0f172a" }}>{nursery.name}</span>
          </nav>

          {/* Header card */}
          <article
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 28,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 12,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: "0 0 6px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {nursery.name}
                </h1>
                <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>
                  {nursery.area} · {nursery.postcode}
                </p>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 20,
                  ...ofstedBadgeStyle(nursery.ofsted),
                  whiteSpace: "nowrap",
                }}
              >
                {nursery.ofsted}
              </span>
            </div>

            <p
              style={{
                fontSize: 15,
                color: "#475569",
                margin: "16px 0 20px",
                lineHeight: 1.65,
              }}
            >
              {nursery.description}
            </p>

            {/* Tags */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              {nursery.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#f8fafc",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Key facts grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <Fact label="Daily fee" value={`£${nursery.price}`} />
              <Fact label="Hours" value={nursery.hours} />
              <Fact label="Ages" value={nursery.ageRange} />
              <Fact
                label="Rating"
                value={`★ ${nursery.rating} (${nursery.reviews})`}
              />
              <Fact
                label="Availability"
                value={
                  nursery.spaces > 0
                    ? `${nursery.spaces} space${nursery.spaces === 1 ? "" : "s"}`
                    : "Waitlist"
                }
              />
              <Fact label="Ofsted" value={nursery.ofsted} />
            </div>

            <NurseryActions nursery={nursery} />
          </article>

          {/* Footer link back */}
          <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
            <Link
              href="/"
              style={{ color: "#1a7a4a", textDecoration: "none" }}
            >
              ← Back to all nurseries
            </Link>
          </p>
        </main>
      </div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

function ofstedBadgeStyle(ofsted: OfstedRating): React.CSSProperties {
  if (ofsted === "Outstanding") {
    return { background: "#eef2ff", color: "#3730a3", border: "1px solid #c7d2fe" };
  }
  if (ofsted === "Good") {
    return { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" };
  }
  return { background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" };
}

// Lookup helper. Currently iterates the full set, fine for ~6-1000 nurseries.
// For larger datasets, promote slug to a unique DB column.
async function findBySlug(slug: string): Promise<Nursery | null> {
  const rows = await prisma.nursery.findMany();
  const match = rows.find((n) => slugify(n.name) === slug);
  if (!match) return null;
  return {
    id: match.id,
    name: match.name,
    area: match.area,
    postcode: match.postcode,
    rating: match.rating,
    reviews: match.reviews,
    ageRange: match.ageRange,
    minAge: match.minAge,
    maxAge: match.maxAge,
    price: match.price,
    spaces: match.spaces,
    tags: match.tags,
    ofsted: match.ofsted as OfstedRating,
    hours: match.hours,
    description: match.description,
    lat: match.lat,
    lng: match.lng,
  };
}
