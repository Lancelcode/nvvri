"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { NurseryCard } from "@/components/NurseryCard";
import { EnquiryModal } from "@/components/EnquiryModal";
import { ThinkingIndicator } from "@/components/ThinkingIndicator";
import { filterNurseries, filterByAI, sortNurseries } from "@/lib/data";
import { parseQuery } from "@/lib/aiSearch";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { Nursery, AgeFilter, AvailFilter, AIFilters, SortOption } from "@/types";

// Leaflet must be loaded client-side only — no SSR
const NurseryMap = dynamic(
  () => import("@/components/NurseryMap").then((m) => m.NurseryMap),
  { ssr: false, loading: () => <div style={{ height: "100%", background: "#f1f5f9", borderRadius: 12 }} /> }
);

async function smartSearch(query: string): Promise<{ filters: AIFilters; usedAI: boolean }> {
  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error("API failed");
    const filters: AIFilters = await res.json();
    if (!filters || typeof filters !== "object" || !("explanation" in filters)) {
      throw new Error("Invalid response shape");
    }
    return { filters, usedAI: true };
  } catch {
    return { filters: parseQuery(query), usedAI: false };
  }
}

type ViewMode = "list" | "map";

export default function HomePage() {
  const [nurseries, setNurseries]     = useState<Nursery[]>([]);
  const [loading, setLoading]         = useState(true);
  const [viewMode, setViewMode]       = useState<ViewMode>("list");

  const [search, setSearch]           = useState("");
  const [maxPrice, setMaxPrice]       = useState(70);
  const [ageFilter, setAgeFilter]     = useState<AgeFilter>("any");
  const [availFilter, setAvailFilter] = useState<AvailFilter>("any");
  const [sort, setSort]               = useState<SortOption>("rating");
  const [selected, setSelected]       = useState<Nursery | null>(null);

  const [aiQuery, setAiQuery]         = useState("");
  const [aiFilters, setAiFilters]     = useState<AIFilters | null>(null);
  const [aiThinking, setAiThinking]   = useState(false);
  const [usedRealAI, setUsedRealAI]   = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch("/api/nurseries")
      .then((res) => res.json())
      .then((data) => { setNurseries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const base     = aiFilters
    ? filterByAI(nurseries, aiFilters)
    : filterNurseries(nurseries, search, maxPrice, ageFilter, availFilter);
  const filtered = sortNurseries(base, sort);

  async function handleAISearch() {
    if (!aiQuery.trim()) return;
    setAiThinking(true);
    setAiFilters(null);
    setUsedRealAI(false);
    const { filters, usedAI } = await smartSearch(aiQuery);
    setAiFilters(filters);
    setUsedRealAI(usedAI);
    setAiThinking(false);
  }

  function clearAISearch() {
    setAiFilters(null);
    setAiQuery("");
    setAiThinking(false);
    setUsedRealAI(false);
    inputRef.current?.focus();
  }

  function ViewToggle() {
    return (
      <div style={{
        display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3, gap: 2,
      }}>
        {(["list", "map"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 13,
              fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              background: viewMode === mode ? "white" : "transparent",
              color: viewMode === mode ? "#0f172a" : "#64748b",
              boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {mode === "list" ? "List" : "Map"}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {selected && <EnquiryModal nursery={selected} onClose={() => setSelected(null)} />}

      {/* Nav */}
      <nav style={{
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: isMobile ? "10px 16px" : "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "#1a7a4a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={18} height={18} fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", letterSpacing: "-0.02em" }}>nvvri</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          {!isMobile && <span style={{ fontSize: 14, color: "#64748b" }}>For nurseries</span>}
          <button style={{
            background: "#1a7a4a", color: "white", border: "none", borderRadius: 8,
            padding: isMobile ? "7px 12px" : "7px 16px", fontSize: 14, cursor: "pointer", fontWeight: 500,
          }}>Sign in</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: isMobile ? "24px 16px" : "32px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{
            fontSize: isMobile ? 24 : 30, fontWeight: 700, color: "#0f172a",
            margin: "0 0 8px", letterSpacing: "-0.03em",
          }}>
            Find the right nursery for your child
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 20px" }}>
            Search, compare, and enquire — all in one place.
          </p>

          {/* AI Search */}
          <div style={{
            background: "#f0fdf4", border: "1.5px solid #bbf7d0",
            borderRadius: 14, padding: isMobile ? "14px 16px" : "16px 20px", marginBottom: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#15803d" }}>✦ AI Search</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>describe what you&apos;re looking for</span>
            </div>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8 }}>
              <input
                ref={inputRef}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
                disabled={aiThinking}
                placeholder="e.g. Outstanding nursery in Leith for a baby with outdoor space"
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 8,
                  border: "1px solid #d1fae5", fontSize: 14,
                  background: "white", outline: "none", color: "#0f172a",
                  width: isMobile ? "100%" : "auto", boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleAISearch}
                disabled={aiThinking || !aiQuery.trim()}
                style={{
                  background: aiThinking ? "#86efac" : "#1a7a4a",
                  color: "white", border: "none", borderRadius: 8,
                  padding: "10px 20px", fontSize: 14, fontWeight: 600,
                  cursor: aiThinking ? "default" : "pointer",
                  whiteSpace: "nowrap", transition: "background 0.15s",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {aiThinking ? "Thinking..." : "Search"}
              </button>
            </div>
          </div>

          {/* Standard search */}
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
              width={16} height={16} fill="none" stroke="#94a3b8" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); clearAISearch(); }}
              placeholder="Or search by area or postcode — e.g. Leith, EH6"
              style={{
                width: "100%", padding: "12px 16px 12px 40px", borderRadius: 10,
                border: "1.5px solid #e2e8f0", fontSize: 15, background: "white",
                outline: "none", boxSizing: "border-box", color: "#0f172a",
              }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px" : "24px" }}>

        {(aiThinking || loading) && <ThinkingIndicator />}

        {/* AI result pill */}
        {aiFilters && !aiThinking && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10,
            padding: "11px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
              <span style={{ fontSize: 13 }}>✦</span>
              <span style={{ fontSize: 14, color: "#15803d", fontWeight: 500 }}>{aiFilters.explanation}</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                · {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
              <span style={{
                fontSize: 11, padding: "2px 7px", borderRadius: 20,
                background: usedRealAI ? "#eff6ff" : "#f1f5f9",
                color: usedRealAI ? "#3b82f6" : "#94a3b8",
                border: `1px solid ${usedRealAI ? "#bfdbfe" : "#e2e8f0"}`,
                whiteSpace: "nowrap",
              }}>
                {usedRealAI ? "AI" : "local parser"}
              </span>
            </div>
            <button onClick={clearAISearch} style={{
              background: "none", border: "1px solid #86efac", borderRadius: 6,
              padding: "4px 10px", fontSize: 12, color: "#15803d",
              cursor: "pointer", fontWeight: 500, flexShrink: 0,
            }}>
              Clear
            </button>
          </div>
        )}

        {/* Filters + sort + view toggle */}
        {!aiThinking && !loading && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: isMobile ? 8 : 12,
            marginBottom: 20, alignItems: "center",
          }}>
            {!aiFilters && (
              <>
                <div style={{ width: isMobile ? "100%" : "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>
                    Max: <strong style={{ color: "#0f172a" }}>£{maxPrice}/day</strong>
                  </label>
                  <input type="range" min={40} max={70} value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    style={{ flex: isMobile ? 1 : "unset", width: isMobile ? "auto" : 100, accentColor: "#1a7a4a" }} />
                </div>
                <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value as AgeFilter)}
                  style={{
                    padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                    fontSize: 13, background: "white", cursor: "pointer", color: "#0f172a",
                    flex: isMobile ? 1 : "unset",
                  }}>
                  <option value="any">Any age</option>
                  <option value="baby">Baby (0-12m)</option>
                  <option value="toddler">Toddler (1-2y)</option>
                  <option value="preschool">Preschool (3-5y)</option>
                </select>
                <select value={availFilter} onChange={(e) => setAvailFilter(e.target.value as AvailFilter)}
                  style={{
                    padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                    fontSize: 13, background: "white", cursor: "pointer", color: "#0f172a",
                    flex: isMobile ? 1 : "unset",
                  }}>
                  <option value="any">Any availability</option>
                  <option value="available">Spaces available</option>
                  <option value="waitlist">Waitlist only</option>
                </select>
              </>
            )}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              width: isMobile && !aiFilters ? "100%" : "auto",
            }}>
              {viewMode === "list" && (
                <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}
                  style={{
                    padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                    fontSize: 13, background: "white", cursor: "pointer", color: "#0f172a",
                    flex: isMobile ? 1 : "unset",
                  }}>
                  <option value="rating">Top rated</option>
                  <option value="price-asc">Price low-high</option>
                  <option value="price-desc">Price high-low</option>
                  <option value="spaces">Most spaces</option>
                </select>
              )}
              <span style={{ fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" }}>
                {filtered.length} {filtered.length !== 1 ? "nurseries" : "nursery"}
              </span>
              <div style={{ marginLeft: "auto" }}>
                <ViewToggle />
              </div>
            </div>
          </div>
        )}

        {/* List or Map */}
        {!aiThinking && !loading && (
          viewMode === "map" ? (
            <div style={{ height: isMobile ? "60vh" : "70vh", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <NurseryMap nurseries={filtered} onEnquire={(n) => setSelected(n)} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No nurseries match your search.</p>
              {aiFilters && (
                <button onClick={clearAISearch} style={{
                  background: "none", border: "none", color: "#1a7a4a",
                  fontSize: 14, cursor: "pointer", textDecoration: "underline",
                }}>
                  Clear and browse all
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
              gap: isMobile ? 16 : 20,
            }}>
              {filtered.map((n) => (
                <NurseryCard key={n.id} nursery={n} onEnquire={() => setSelected(n)} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}