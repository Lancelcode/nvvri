"use client";

import { useState } from "react";
import { NurseryCard } from "@/components/NurseryCard";
import { EnquiryModal } from "@/components/EnquiryModal";
import { nurseries, filterNurseries } from "@/lib/data";
import type { Nursery, AgeFilter, AvailFilter } from "@/types";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(70);
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("any");
  const [availFilter, setAvailFilter] = useState<AvailFilter>("any");
  const [selected, setSelected] = useState<Nursery | null>(null);

  const filtered = filterNurseries(nurseries, search, maxPrice, ageFilter, availFilter);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {selected && <EnquiryModal nursery={selected} onClose={() => setSelected(null)} />}

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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            <svg width={18} height={18} fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Nvvrii!
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#64748b" }}>For nurseries</span>
          <button
            style={{
              background: "#1a7a4a",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "7px 16px",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Sign in
          </button>
        </div>
      </nav>

      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 8px",
              letterSpacing: "-0.03em",
            }}
          >
            Find the right nursery for your child
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>
            Search, compare, and enquire — all in one place.
          </p>
          <div style={{ position: "relative" }}>
            <svg
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
              width={16}
              height={16}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx={11} cy={11} r={8} />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by area or postcode — e.g. Morningside, EH10..."
              style={{
                width: "100%",
                padding: "13px 14px 13px 40px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 15,
                color: "#0f172a",
                background: "#f8fafc",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 24px",
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>
            Max price: <strong style={{ color: "#0f172a" }}>£{maxPrice}/day</strong>
          </label>
          <input
            type="range"
            min={40}
            max={70}
            step={1}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ width: 100, accentColor: "#1a7a4a" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 13, color: "#64748b" }}>Age:</label>
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value as AgeFilter)}
            style={{
              fontSize: 13,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#0f172a",
              cursor: "pointer",
            }}
          >
            <option value="any">Any age</option>
            <option value="baby">Baby (0–1)</option>
            <option value="toddler">Toddler (1–3)</option>
            <option value="preschool">Preschool (3–5)</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 13, color: "#64748b" }}>Spaces:</label>
          <select
            value={availFilter}
            onChange={(e) => setAvailFilter(e.target.value as AvailFilter)}
            style={{
              fontSize: 13,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#0f172a",
              cursor: "pointer",
            }}
          >
            <option value="any">Any</option>
            <option value="available">Available now</option>
            <option value="waitlist">Waitlist only</option>
          </select>
        </div>

        <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: "auto" }}>
          {filtered.length} {filtered.length === 1 ? "nursery" : "nurseries"} found
        </span>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <p style={{ fontSize: 16, color: "#64748b", margin: "0 0 6px" }}>
              No nurseries match your filters.
            </p>
            <p style={{ fontSize: 14, color: "#94a3b8" }}>
              Try adjusting the price range or age group.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((n) => (
              <NurseryCard key={n.id} nursery={n} onEnquire={setSelected} />
            ))}
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Nvvrii! — built as a proof of concept.{" "}
          <a href="https://github.com/Lancelcode" style={{ color: "#1a7a4a" }}>
            github.com/Lancelcode
          </a>
        </p>
      </footer>
    </div>
  );
}
