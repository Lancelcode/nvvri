"use client";

import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { Nursery, EnquiryForm } from "@/types";

interface Props {
  nursery: Nursery;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a",
  background: "white", boxSizing: "border-box", fontFamily: "inherit", outline: "none",
};

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid #fca5a5",
  background: "#fff5f5",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: "#64748b", display: "block", marginBottom: 4, fontWeight: 500,
};

type Step = 1 | 2 | 3;
type FormErrors = Partial<Record<keyof EnquiryForm, string>>;

function validateStep1(form: EnquiryForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim())  errors.name  = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";
  if (!form.phone.trim()) errors.phone = "Phone is required";
  return errors;
}

function validateStep2(form: EnquiryForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.childDob)   errors.childDob  = "Date of birth is required";
  if (!form.startDate)  errors.startDate = "Start date is required";
  return errors;
}

export function EnquiryModal({ nursery, onClose }: Props) {
  const [step, setStep]             = useState<Step>(1);
  const [form, setForm]             = useState<EnquiryForm>({ name: "", email: "", phone: "", childDob: "", startDate: "", message: "" });
  const [errors, setErrors]         = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (field: keyof EnquiryForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  function handleContinue() {
    const errs = validateStep1(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit() {
    const errs = validateStep2(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nurseryName: nursery.name,
          nurseryArea: nursery.area,
          name: form.name,
          email: form.email,
          phone: form.phone,
          childDob: form.childDob,
          startDate: form.startDate,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStep(3);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center",
        zIndex: 9999, padding: isMobile ? 0 : 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "white",
        borderRadius: isMobile ? "16px 16px 0 0" : 16,
        width: "100%", maxWidth: isMobile ? "100%" : 480,
        padding: isMobile ? "24px 20px" : 28,
        border: "1px solid #e2e8f0",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        maxHeight: isMobile ? "92vh" : "auto",
        overflowY: isMobile ? "auto" : "visible",
      }}>
        {step === 3 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "#e8f5ee",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}>
              <svg width={24} height={24} fill="none" stroke="#1a7a4a" strokeWidth={2}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#0f172a" }}>
              Enquiry sent
            </p>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
              {nursery.name} will be in touch within 24 hours. Check your email for confirmation.
            </p>
            <button onClick={onClose} style={{
              background: "#1a7a4a", color: "white", border: "none", borderRadius: 8,
              padding: "10px 28px", fontSize: 14, cursor: "pointer", fontWeight: 500,
            }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                  Enquire at {nursery.name}
                </p>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                  {nursery.area} · £{nursery.price}/day
                </p>
              </div>
              <button onClick={onClose} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#94a3b8", fontSize: 22, lineHeight: 1, padding: 4,
              }}>×</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {(["Your details", "Child details"] as const).map((label, i) => (
                <div key={label} style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: i < step ? "#1a7a4a" : "#f1f5f9",
                    border: `1px solid ${i < step ? "#1a7a4a" : "#e2e8f0"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: i < step ? "white" : "#94a3b8",
                    fontWeight: 600, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{
                    fontSize: 12,
                    color: i + 1 === step ? "#0f172a" : "#94a3b8",
                    fontWeight: i + 1 === step ? 500 : 400,
                  }}>
                    {label}
                  </span>
                  {i === 0 && <div style={{ flex: 1, height: 1, background: "#e2e8f0", margin: "0 4px" }} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Full name *</label>
                    <input value={form.name} onChange={update("name")} placeholder="Your name"
                      style={errors.name ? errorInputStyle : inputStyle} />
                    {errors.name && <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Phone *</label>
                    <input value={form.phone} onChange={update("phone")} placeholder="07700 900000"
                      style={errors.phone ? errorInputStyle : inputStyle} />
                    {errors.phone && <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>{errors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input value={form.email} onChange={update("email")} placeholder="you@example.com"
                    style={errors.email ? errorInputStyle : inputStyle} />
                  {errors.email && <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>{errors.email}</p>}
                </div>
                <button onClick={handleContinue} style={{
                  background: "#1a7a4a", color: "white", border: "none", borderRadius: 8,
                  padding: "11px 0", fontSize: 14, cursor: "pointer", fontWeight: 500, marginTop: 4,
                }}>
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Child date of birth *</label>
                    <input type="date" value={form.childDob} onChange={update("childDob")}
                      style={errors.childDob ? errorInputStyle : inputStyle} />
                    {errors.childDob && <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>{errors.childDob}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Desired start date *</label>
                    <input type="date" value={form.startDate} onChange={update("startDate")}
                      style={errors.startDate ? errorInputStyle : inputStyle} />
                    {errors.startDate && <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>{errors.startDate}</p>}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Message (optional)</label>
                  <textarea value={form.message} onChange={update("message")}
                    placeholder="Any questions or specific requirements..." rows={3}
                    style={{ ...inputStyle, resize: "none" }} />
                </div>
                {submitError && (
                  <p style={{ fontSize: 13, color: "#dc2626", margin: 0, textAlign: "center" }}>{submitError}</p>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setErrors({}); setSubmitError(""); setStep(1); }} style={{
                    flex: 1, background: "none", border: "1px solid #e2e8f0", borderRadius: 8,
                    padding: "11px 0", fontSize: 14, cursor: "pointer", color: "#0f172a",
                  }}>
                    Back
                  </button>
                  <button onClick={handleSubmit} disabled={submitting} style={{
                    flex: 2, background: submitting ? "#4ead7d" : "#1a7a4a",
                    color: "white", border: "none", borderRadius: 8,
                    padding: "11px 0", fontSize: 14, cursor: submitting ? "default" : "pointer", fontWeight: 500,
                  }}>
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