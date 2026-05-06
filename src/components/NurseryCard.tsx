"use client";

import Link from "next/link";
import type { Nursery, OfstedRating } from "@/types";
import { slugify } from "@/lib/slug";
import { useShortlist } from "@/hooks/useShortlist";

interface Props {
  nursery: Nursery;
  onEnquire: (nursery: Nursery) => void;
}

type BadgeType =
  | "outstanding"
  | "good"
  | "requires-improvement"
  | "available"
  | "waitlist"
  | "default";

function Badge({
  children,
  type = "default",
}: {
  children: React.ReactNode;
  type?: BadgeType;
}) {
  const styles: Record<BadgeType, React.CSSProperties> = {
    outstanding: { background: "#eef2ff", color: "#3730a3", border: "1px solid #c7d2fe" },
    good: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
    "requires-improvement": {
      background: "#fff7ed",
      color: "#9a3412",
      border: "1px solid #fed7aa",
    },
    available: { background: "#e8f5ee", color: "#1a6b40", border: "1px solid #a8d9bc" },
    waitlist: { background: "#fef3e2", color: "#92530c", border: "1px solid #f5c87a" },
    default: { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
  };

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 20,
        ...styles[type],
      }}
    >
      {children}
    </span>
  );
}

function ofstedBadgeType(rating: OfstedRating): BadgeType {
  if (rating === "Outstanding") return "outstanding";
  if (rating === "Good") return "good";
  return "requires-improvement";
}

export function NurseryCard({ nursery, onEnquire }: Props) {
  const { has, toggle } = useShortlist();
  // Don't gate on `ready`. ids starts as [] so has() returns false initially
  // anyway. Gating on ready means a click before the first useEffect fires
  // leaves aria-pressed stuck on false even after the id is added.
  const saved = has(nursery.id);
  const slug = slugify(nursery.name);

  return (
    <article
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#cbd5e1";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 2px 8px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Shortlist heart, floats top right */}
      <button
        onClick={() => toggle(nursery.id)}
        aria-label={saved ? `Remove ${nursery.name} from shortlist` : `Add ${nursery.name} to shortlist`}
        aria-pressed={saved}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: saved ? "#fef2f2" : "white",
          border: `1px solid ${saved ? "#fecaca" : "#e2e8f0"}`,
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          transition: "all 0.15s",
        }}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill={saved ? "#dc2626" : "none"}
          stroke={saved ? "#dc2626" : "#94a3b8"}
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingRight: 40, // leave room for the heart
        }}
      >
        <div>
          <Link
            href={`/nursery/${slug}`}
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: "#0f172a",
              margin: 0,
              textDecoration: "none",
            }}
          >
            <h3
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: "#0f172a",
                margin: "0 0 2px",
              }}
            >
              {nursery.name}
            </h3>
          </Link>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            {nursery.area} · {nursery.postcode}
          </p>
        </div>
        <Badge type={ofstedBadgeType(nursery.ofsted)}>{nursery.ofsted}</Badge>
      </div>

      <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
        {nursery.description}
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {nursery.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 11,
              padding: "2px 8px",
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {(
          [
            { label: "Ages", value: nursery.ageRange },
            { label: "From", value: `£${nursery.price}/day` },
            { label: "Hours", value: nursery.hours },
          ] as const
        ).map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px" }}>
              {label}
            </p>
            <p
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "#64748b" }}>
            ★ {nursery.rating} ({nursery.reviews})
          </span>
          {nursery.spaces > 0 ? (
            <Badge type="available">
              {nursery.spaces} {nursery.spaces === 1 ? "space" : "spaces"} available
            </Badge>
          ) : (
            <Badge type="waitlist">Waitlist only</Badge>
          )}
        </div>
        <button
          onClick={() => onEnquire(nursery)}
          style={{
            background: "#1a7a4a",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "7px 16px",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 500,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#15623b")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#1a7a4a")
          }
        >
          Enquire
        </button>
      </div>
    </article>
  );
}