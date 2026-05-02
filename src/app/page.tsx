"use client";

import { useState, useEffect, useRef } from "react";
import { NurseryCard } from "@/components/NurseryCard";
import { EnquiryModal } from "@/components/EnquiryModal";
import { nurseries, filterNurseries } from "@/lib/data";
import { parseQuery, THINKING_STEPS } from "@/lib/aiSearch";
import type { Nursery, AgeFilter, AvailFilter, AIFilters } from "@/types";

function filterByAI(data: Nursery[], f: AIFilters): Nursery[] {
  return data.filter((n) => {
    if (f.area && !n.area.toLowerCase().includes(f.area.toLowerCase())) return false;
    if (f.ofsted && n.ofsted !== f.ofsted) return false;
    if (f.maxPrice != null && n.price > f.maxPrice) return false;
    if (f.minAge != null && n.maxAge < f.minAge) return false;
    if (f.maxAge != null && n.minAge > f.maxAge) return false;
    if (f.availFilter === "available" && n.spaces === 0) return false;
    if (f.availFilter === "waitlist" && n.spaces > 0) return false;
    if (f.tags.length > 0 && !f.tags.some((t) => n.tags.includes(t))) return false;
    return true;
  });
}

function ThinkingIndicator() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStep((s) => (s + 1) % THINKING_STEPS.length);
        setVisible(true);
      }, 200);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "20px 0", justifyContent: "center",
    }}>
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: "#1a7a4a",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <span style={{
        fontSize: 14, color: "#15803d", fontWeight: 500,
        opacity: visible ? 1 : 0, transition: "opacity 0.2s ease",
      }}>
        {THINKING_STEPS[step]}
      </span>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(70);
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("any");
  const [availFilter, setAvailFilter] = useState<AvailFilter>("any");
  const [selected, setSelected] = useState<Nursery | null>(null);

  const [aiQuery, setAiQuery] = useState("");
  const [aiFilters, setAiFilters] = useState<AIFilters | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = aiFilters
    ? filterByAI(nurseries, aiFilters)
    : filterNurseries(nurseries, search, maxPrice, ageFilter, availFilter);

  function handleAISearch() {
    if (!aiQuery.trim()) return;
    setAiThinking(true);
    setAiFilters(null);

    // Fake thinking delay — real API call would go here
    setTimeout(() => {
      setAiFilters(parseQuery(aiQuery));
      setAiThinking(false);
    }, 1800);
  }

  function clearAISearch() {
    setAiFilters(null);
    setAiQuery("");
    setAiThinking(false);
    inputRef.current?.focus();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {selected && <EnquiryModal nursery={selected} onClose={() => setSelected(null)} />}

      {/* Nav */}
      <nav style={{
        background: "white", borderBottom: "1px solid #e2e8f0", padding: "12px 24px",
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#64748b" }}>For nurseries</span>
          <button style={{
            background: "#1a7a4a", color: "white", border: "none", borderRadius: 8,
            padding: "7px 16px", fontSize: 14, cursor: "pointer", fontWeight: 500,
          }}>Sign in</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "32px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{
            fontSize: 30, fontWeight: 700, color: "#0f172a",
            margin: "0 0 8px", letterSpacing: "-0.03em",
          }}>
            Find the right nursery for your child
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 24px" }}>
            Search, compare, and enquire — all in one place.
          </p>

          {/* AI Search */}
          <div style={{
            background: "#f0fdf4", border: "1.5px solid #bbf7d0",
            borderRadius: 14, padding: "16px 20px", marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#15803d" }}>✦ AI Search</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>describe what you're looking for</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={inputRef}
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
                disabled={aiThinking}
                placeholder='e.g. "Outstanding nursery in Leith for a baby with outdoor space"'
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 8,
                  border: "1px solid #d1fae5", fontSize: 14,
                  background: "white", outline: "none", color: "#0f172a",
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
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px" }}>

        {/* Thinking animation */}
        {aiThinking && <ThinkingIndicator />}

        {/* AI result pill */}
        {aiFilters && !aiThinking && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10,
            padding: "11px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13 }}>✦</span>
              <span style={{ fontSize: 14, color: "#15803d", fontWeight: 500 }}>
                {aiFilters.explanation}
              </span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                · {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button onClick={clearAISearch} style={{
              background: "none", border: "1px solid #86efac", borderRadius: 6,
              padding: "4px 10px", fontSize: 12, color: "#15803d",
              cursor: "pointer", fontWeight: 500,
            }}>
              Clear
            </button>
          </div>
        )}

        {/* Manual filters */}
        {!aiFilters && !aiThinking && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>
                Max price: <strong style={{ color: "#0f172a" }}>£{maxPrice}/day</strong>
              </label>
              <input type="range" min={40} max={70} value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: 100, accentColor: "#1a7a4a" }} />
            </div>
            <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value as AgeFilter)}
              style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "white", cursor: "pointer", color: "#0f172a" }}>
              <option value="any">Any age</option>
              <option value="baby">Baby (0–12m)</option>
              <option value="toddler">Toddler (1–2y)</option>
              <option value="preschool">Preschool (3–5y)</option>
            </select>
            <select value={availFilter} onChange={(e) => setAvailFilter(e.target.value as AvailFilter)}
              style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "white", cursor: "pointer", color: "#0f172a" }}>
              <option value="any">Any availability</option>
              <option value="available">Spaces available</option>
              <option value="waitlist">Waitlist only</option>
            </select>
            <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: "auto" }}>
              {filtered.length} nurserie{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Grid */}
        {!aiThinking && (
          filtered.length === 0 ? (
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
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