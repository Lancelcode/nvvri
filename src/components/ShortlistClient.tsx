"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useShortlist } from "@/hooks/useShortlist";
import { useIsMobile } from "@/hooks/useIsMobile";
import { EnquiryModal } from "@/components/EnquiryModal";
import { NurseryCard } from "@/components/NurseryCard";
import { slugify } from "@/lib/slug";
import type { Nursery } from "@/types";

interface Props {
  allNurseries: Nursery[];
}

type ShortlistView = "cards" | "compare";

export function ShortlistClient({ allNurseries }: Props) {
  const { ids, ready, remove } = useShortlist();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<Nursery | null>(null);
  const [view, setView] = useState<ShortlistView>("cards");

  const saved = useMemo(
    () => allNurseries.filter((n) => ids.includes(n.id)),
    [allNurseries, ids]
  );

  // Until localStorage hydrates we render an empty placeholder rather than
  // flashing "No nurseries saved" to a user with a populated shortlist.
  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {selected && (
        <EnquiryModal nursery={selected} onClose={() => setSelected(null)} />
      )}

      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: isMobile ? "10px 16px" : "12px 24px",
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
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "20px 16px" : "32px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: isMobile ? 22 : 26,
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 4px",
                letterSpacing: "-0.02em",
              }}
            >
              Your shortlist
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
              {saved.length === 0
                ? "Save nurseries from search results to compare them here."
                : `${saved.length} ${saved.length === 1 ? "nursery" : "nurseries"} saved on this device`}
            </p>
          </div>
          {saved.length >= 2 && (
            <div
              role="tablist"
              aria-label="Switch shortlist view"
              style={{
                display: "flex",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 3,
                gap: 2,
              }}
            >
              {(["cards", "compare"] as ShortlistView[]).map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: view === v ? "#f1f5f9" : "transparent",
                    color: view === v ? "#0f172a" : "#64748b",
                  }}
                >
                  {v === "cards" ? "Cards" : "Compare"}
                </button>
              ))}
            </div>
          )}
        </div>

        {saved.length === 0 ? (
          <EmptyState />
        ) : view === "compare" ? (
          <CompareTable nurseries={saved} onEnquire={setSelected} onRemove={remove} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fill, minmax(320px, 1fr))",
              gap: isMobile ? 16 : 20,
            }}
          >
            {saved.map((n) => (
              <NurseryCard
                key={n.id}
                nursery={n}
                onEnquire={() => setSelected(n)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: "white",
        border: "1px dashed #cbd5e1",
        borderRadius: 14,
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#fef2f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <p
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#0f172a",
          margin: "0 0 6px",
        }}
      >
        Nothing saved yet
      </p>
      <p
        style={{
          fontSize: 14,
          color: "#64748b",
          margin: "0 0 20px",
          lineHeight: 1.5,
          maxWidth: 360,
          marginInline: "auto",
        }}
      >
        Tap the heart on any nursery card to save it here. Compare up to 6
        nurseries side by side before enquiring.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "#1a7a4a",
          color: "white",
          textDecoration: "none",
          borderRadius: 10,
          padding: "10px 22px",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Browse nurseries
      </Link>
    </div>
  );
}

interface CompareProps {
  nurseries: Nursery[];
  onEnquire: (n: Nursery) => void;
  onRemove: (id: string) => void;
}

function CompareTable({ nurseries, onEnquire, onRemove }: CompareProps) {
  const rows: Array<{ label: string; render: (n: Nursery) => React.ReactNode }> = [
    {
      label: "Area",
      render: (n) => `${n.area}, ${n.postcode}`,
    },
    {
      label: "Ofsted",
      render: (n) => n.ofsted,
    },
    {
      label: "Rating",
      render: (n) => `★ ${n.rating} (${n.reviews})`,
    },
    {
      label: "Daily fee",
      render: (n) => `£${n.price}`,
    },
    {
      label: "Hours",
      render: (n) => n.hours,
    },
    {
      label: "Ages",
      render: (n) => n.ageRange,
    },
    {
      label: "Availability",
      render: (n) =>
        n.spaces > 0
          ? `${n.spaces} space${n.spaces === 1 ? "" : "s"}`
          : "Waitlist",
    },
    {
      label: "Tags",
      render: (n) => n.tags.join(", "),
    },
  ];

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            <th
              style={{
                textAlign: "left",
                padding: "14px 16px",
                fontSize: 11,
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                width: 130,
                position: "sticky",
                left: 0,
                background: "#f8fafc",
                zIndex: 1,
              }}
            >
              Compare
            </th>
            {nurseries.map((n) => (
              <th
                key={n.id}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  minWidth: 200,
                  borderLeft: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div>
                    <Link
                      href={`/nursery/${slugify(n.name)}`}
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0f172a",
                        textDecoration: "none",
                        display: "block",
                        marginBottom: 2,
                      }}
                    >
                      {n.name}
                    </Link>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        fontWeight: 400,
                      }}
                    >
                      {n.area}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(n.id)}
                    aria-label={`Remove ${n.name} from shortlist`}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: 18,
                      lineHeight: 1,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} style={{ borderTop: "1px solid #f1f5f9" }}>
              <th
                scope="row"
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#64748b",
                  position: "sticky",
                  left: 0,
                  background: "white",
                  zIndex: 1,
                }}
              >
                {row.label}
              </th>
              {nurseries.map((n) => (
                <td
                  key={n.id}
                  style={{
                    padding: "12px 16px",
                    color: "#0f172a",
                    borderLeft: "1px solid #f1f5f9",
                    verticalAlign: "top",
                  }}
                >
                  {row.render(n)}
                </td>
              ))}
            </tr>
          ))}
          <tr style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
            <th
              scope="row"
              style={{
                position: "sticky",
                left: 0,
                background: "#f8fafc",
                zIndex: 1,
              }}
            />
            {nurseries.map((n) => (
              <td
                key={n.id}
                style={{
                  padding: "12px 16px",
                  borderLeft: "1px solid #e2e8f0",
                }}
              >
                <button
                  onClick={() => onEnquire(n)}
                  style={{
                    background: "#1a7a4a",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Enquire
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
