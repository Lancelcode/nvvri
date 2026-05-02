"use client";

import { useState } from "react";
import type { Nursery, EnquiryForm } from "@/types";

interface Props {
  nursery: Nursery;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#0f172a",
  background: "white",
  boxSizing: "border-box",
  fontFamily: "inherit",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#64748b",
  display: "block",
  marginBottom: 4,
  fontWeight: 500,
};

export function EnquiryModal({ nursery, onClose }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<EnquiryForm>({
    name: "",
    email: "",
    phone: "",
    childDob: "",
    startDate: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => setStep(3), 900);
  };

  const update = (field: keyof EnquiryForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          padding: 28,
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {step === 3 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#e8f5ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width={24} height={24} fill="none" stroke="#1a7a4a" strokeWidth={2}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#0f172a" }}>
              Enquiry sent
            </p>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
              {nursery.name} will be in touch within 24 hours. You can track this
              enquiry in your Nvvrii! dashboard.
            </p>
            <button
              onClick={onClose}
              style={{
                background: "#1a7a4a",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "10px 28px",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                  Enquire at {nursery.name}
                </p>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                  {nursery.area} · £{nursery.price}/day
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  fontSize: 22,
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {(["Your details", "Child details"] as const).map((label, i) => (
                <div key={label} style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: i < step ? "#1a7a4a" : "#f1f5f9",
                      border: `1px solid ${i < step ? "#1a7a4a" : "#e2e8f0"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      color: i < step ? "white" : "#94a3b8",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: i + 1 === step ? "#0f172a" : "#94a3b8",
                      fontWeight: i + 1 === step ? 500 : 400,
                    }}
                  >
                    {label}
                  </span>
                  {i === 0 && (
                    <div style={{ flex: 1, height: 1, background: "#e2e8f0", margin: "0 4px" }} />
                  )}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Full name</label>
                    <input value={form.name} onChange={update("name")} placeholder="Your name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input value={form.phone} onChange={update("phone")} placeholder="07700 900000" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input value={form.email} onChange={update("email")} placeholder="you@example.com" style={inputStyle} />
                </div>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    background: "#1a7a4a",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "11px 0",
                    fontSize: 14,
                    cursor: "pointer",
                    fontWeight: 500,
                    marginTop: 4,
                  }}
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Child date of birth</label>
                    <input type="date" value={form.childDob} onChange={update("childDob")} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Desired start date</label>
                    <input type="date" value={form.startDate} onChange={update("startDate")} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Message (optional)</label>
                  <textarea
                    value={form.message}
                    onChange={update("message")}
                    placeholder="Any questions or specific requirements..."
                    rows={3}
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      background: "none",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "11px 0",
                      fontSize: 14,
                      cursor: "pointer",
                      color: "#0f172a",
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      flex: 2,
                      background: submitting ? "#4ead7d" : "#1a7a4a",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      padding: "11px 0",
                      fontSize: 14,
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {submitting ? "Sending..." : "Send enquiry"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
