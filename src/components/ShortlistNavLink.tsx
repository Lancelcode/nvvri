"use client";

import Link from "next/link";
import { useShortlist } from "@/hooks/useShortlist";

interface Props {
  isMobile: boolean;
}

/**
 * Compact shortlist indicator for the nav. Shows a heart icon plus count,
 * links to the dedicated shortlist page when there are saved nurseries.
 *
 * Renders nothing until the shortlist has loaded from localStorage to
 * avoid a hydration mismatch (server has no localStorage).
 */
export function ShortlistNavLink({ isMobile }: Props) {
  const { ids, ready } = useShortlist();
  if (!ready) return null;

  const count = ids.length;

  return (
    <Link
      href="/shortlist"
      aria-label={
        count === 0
          ? "View shortlist (empty)"
          : `View shortlist (${count} ${count === 1 ? "nursery" : "nurseries"})`
      }
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        textDecoration: "none",
        color: count > 0 ? "#dc2626" : "#64748b",
        fontSize: 13,
        fontWeight: 500,
        padding: isMobile ? "6px 10px" : "6px 12px",
        borderRadius: 8,
        border: `1px solid ${count > 0 ? "#fecaca" : "#e2e8f0"}`,
        background: count > 0 ? "#fef2f2" : "transparent",
        transition: "all 0.15s",
      }}
    >
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill={count > 0 ? "#dc2626" : "none"}
        stroke={count > 0 ? "#dc2626" : "#64748b"}
        strokeWidth={2}
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {!isMobile && <span>Shortlist</span>}
      {count > 0 && (
        <span
          style={{
            fontSize: 11,
            background: "#dc2626",
            color: "white",
            padding: "1px 6px",
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
