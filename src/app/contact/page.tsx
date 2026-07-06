"use client";

import { useState } from "react";
import Link from "next/link";

const FELT = "#1B5E38"; const FELT_DK = "#0F3D24"; const IVORY = "#F8F2E4"; const GOLD = "#F2D060"; const JET = "#1A1210";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Opens mail client as fallback — replace with actual form endpoint later
    const subject = encodeURIComponent(`رسالة من ${form.name} - الجيكر`);
    const body = encodeURIComponent(`الاسم: ${form.name}\nالبريد: ${form.email}\n\nالرسالة:\n${form.message}`);
    window.location.href = `mailto:hello@aljaiker.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 10, padding: "12px 14px",
    color: IVORY, fontSize: 15, outline: "none",
    fontFamily: "inherit", direction: "rtl",
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: GOLD, fontSize: 20, fontWeight: 900, textDecoration: "none" }}>الجيكر</Link>
        <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "7px 16px", borderRadius: 9, textDecoration: "none" }}>افتح التطبيق</Link>
      </nav>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, marginBottom: 12 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>الرئيسية</Link> ← تواصل معنا
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900, color: IVORY, marginBottom: 8 }}>تواصل معنا</h1>
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 2, marginBottom: 32 }} />

        <p style={{ color: "rgba(248,242,228,0.6)", fontSize: 16, lineHeight: 1.75, marginBottom: 40 }}>
          عندك اقتراح، مشكلة، أو فكرة لتطوير التطبيق؟ نسمعك. راسلنا وبنرد في أقرب وقت.
        </p>

        {sent ? (
          <div style={{ background: "rgba(76,175,80,0.1)", border: "1.5px solid rgba(76,175,80,0.3)", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <div style={{ color: "#4CAF50", fontSize: 18, fontWeight: 700 }}>شكراً! فتحنا تطبيق البريد لك</div>
            <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 14, marginTop: 8 }}>أرسل الرسالة من تطبيق البريد على جهازك</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,242,228,0.5)", marginBottom: 6, fontWeight: 600 }}>الاسم</label>
              <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسمك" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,242,228,0.5)", marginBottom: 6, fontWeight: 600 }}>البريد الإلكتروني</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="بريدك الإلكتروني" style={{ ...inputStyle, direction: "ltr" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,242,228,0.5)", marginBottom: 6, fontWeight: 600 }}>رسالتك</label>
              <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="اكتب رسالتك هنا..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <button type="submit" style={{ padding: "14px 0", background: GOLD, border: "none", borderRadius: 12, color: JET, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
              إرسال الرسالة
            </button>
          </form>
        )}

        <div style={{ marginTop: 40, padding: "20px", background: "rgba(255,255,255,0.04)", borderRadius: 14 }}>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 14, marginBottom: 4 }}>أو راسلنا مباشرة على:</div>
          <a href="mailto:hello@aljaiker.com" style={{ color: GOLD, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>hello@aljaiker.com</a>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {[["about","عنّا"],["privacy","سياسة الخصوصية"],["terms","شروط الاستخدام"],["blog","دليل الألعاب"]].map(([href, label]) => (
            <Link key={href} href={`/${href}`} style={{ color: "rgba(248,242,228,0.35)", fontSize: 13, textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
