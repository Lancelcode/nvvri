"use client";

import type { Nursery } from "@/types";

interface Props {
  nursery: Nursery;
  onEnquire: (nursery: Nursery) => void;
}

function Badge({
  children,
  type = "default",
}: {
  children: React.ReactNode;
  type?: "default" | "available" | "waitlist" | "outstanding" | "good";
}) {
  const styles: Record<string, React.CSSProperties> = {
    outstanding: { background: "#eef2ff", color: "#3730a3", border: "1px solid #c7d2fe" },
    good: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
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

export function NurseryCard({ nursery, onEnquire }: Props) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#cbd5e1";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", margin: "0 0 2px" }}>
            {nursery.name}
          </p>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            {nursery.area} · {nursery.postcode}
          </p>
        </div>
        <Badge type={nursery.ofsted === "Outstanding" ? "outstanding" : "good"}>
          {nursery.ofsted}
        </Badge>
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
        {[
          { label: "Ages", value: nursery.ageRange },
          { label: "From", value: `£${nursery.price}/day` },
          { label: "Hours", value: nursery.hours },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 10px" }}
          >
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px" }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#0f172a", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#15623b")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1a7a4a")}
        >
          Enquire
        </button>
      </div>
    </div>
  );
}
