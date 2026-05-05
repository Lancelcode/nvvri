"use client";

interface Props {
  headline: string;
  body: string;
  usedAI: boolean;
}

/**
 * Zero-click answer card displayed above search results when an AI search runs.
 *
 * The Nuuri job description specifically calls out "AI-driven discovery and
 * zero-click results" as something to think about. This is what that looks
 * like for a directory: surface the answer before the user has to scan a list.
 */
export function AnswerCard({ headline, body, usedAI }: Props) {
  return (
    <section
      aria-label="AI summary of results"
      style={{
        background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
        border: "1px solid #86efac",
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 16,
        boxShadow: "0 1px 3px rgba(20, 83, 45, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "#1a7a4a",
          }}
          aria-hidden="true"
        >
          <span style={{ fontSize: 12, color: "white", fontWeight: 600 }}>✦</span>
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#15803d",
            letterSpacing: "-0.01em",
          }}
        >
          {headline}
        </span>
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 20,
            background: usedAI ? "#dbeafe" : "#f1f5f9",
            color: usedAI ? "#1e40af" : "#64748b",
            border: `1px solid ${usedAI ? "#93c5fd" : "#cbd5e1"}`,
            marginLeft: "auto",
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
        >
          {usedAI ? "AI summary" : "summary"}
        </span>
      </div>
      <p
        style={{
          fontSize: 14,
          color: "#0f172a",
          margin: 0,
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>
    </section>
  );
}
