"use client";

import { useState } from "react";
import { EnquiryModal } from "@/components/EnquiryModal";
import { useShortlist } from "@/hooks/useShortlist";
import type { Nursery } from "@/types";

interface Props {
  nursery: Nursery;
}

/**
 * Client island wrapping the action buttons on a server-rendered
 * nursery detail page. Keeps the rest of the page static for SEO.
 */
export function NurseryActions({ nursery }: Props) {
  const [open, setOpen] = useState(false);
  const { has, toggle, ready } = useShortlist();
  const saved = ready && has(nursery.id);

  return (
    <>
      {open && <EnquiryModal nursery={nursery} onClose={() => setOpen(false)} />}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "#1a7a4a",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#15623b")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#1a7a4a")
          }
        >
          Enquire about {nursery.name.split(" ")[0]}
        </button>
        <button
          onClick={() => toggle(nursery.id)}
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${nursery.name} from shortlist`
              : `Add ${nursery.name} to shortlist`
          }
          style={{
            background: saved ? "#fef2f2" : "white",
            color: saved ? "#dc2626" : "#0f172a",
            border: `1px solid ${saved ? "#fecaca" : "#e2e8f0"}`,
            borderRadius: 10,
            padding: "12px 18px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.15s",
          }}
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill={saved ? "#dc2626" : "none"}
            stroke={saved ? "#dc2626" : "#64748b"}
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {saved ? "Saved" : "Save"}
        </button>
        <span style={{ fontSize: 13, color: "#64748b" }}>
          Free, no commitment
        </span>
      </div>
    </>
  );
}
