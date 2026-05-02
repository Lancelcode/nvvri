"use client";

import { useState, useEffect } from "react";
import { THINKING_STEPS } from "@/lib/aiSearch";

export function ThinkingIndicator() {
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
            animation: `thinking-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
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
        @keyframes thinking-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
