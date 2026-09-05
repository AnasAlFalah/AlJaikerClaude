import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الجيكر — تطبيق تسجيل نقاط ألعاب الورق الكويتية",
  description: "الجيكر هو تطبيق مجاني لتسجيل نقاط ألعاب الورق الكويتية: تريكس، كوت بو ستة، سبيدة، وهند. سجّل الأهداف، شارك النتائج مباشرة، وأنشئ ديوانيتك الإلكترونية.",
  keywords: ["تريكس", "كوت بو ستة", "سبيدة", "هند", "ألعاب ورق كويتية", "تسجيل نقاط", "الجيكر", "ديوانية"],
  openGraph: {
    title: "الجيكر — ألعاب الورق الكويتية",
    description: "تطبيق تسجيل نقاط تريكس، كوت، سبيدة وهند — مجاني وبدون تحميل",
    url: "https://aljaiker.com",
    siteName: "الجيكر",
    locale: "ar_KW",
    type: "website",
  },
};

const GREEN    = "#1C9245";
const GREEN_DK = "#0F5F2C";
const GOLD     = "#F5BC22";
const INK      = "#14110F";
const INK_700  = "#3A3330";
const INK_500  = "#7A736E";
const BG       = "#F0FAF4";
const WHITE    = "#FFFFFF";

const GAME_TAGS = ["تريكس", "كوت بو 6", "هند", "سبيدة", "تسجيل عام"];

export default function LandingPage() {
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: INK }}>

      {/* Nav */}
      <nav style={{
        background: WHITE,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/images/AlJaiker%20Profile%20White.jpg"
            alt="الجيكر"
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }}
          />
          <span style={{ fontSize: 20, fontWeight: 900, color: GREEN_DK, letterSpacing: -0.5 }}>الجيكر</span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/blog" style={{ color: INK_500, fontSize: 14, textDecoration: "none", fontWeight: 600 }}>الألعاب</Link>
          <Link href="/app" style={{
            background: GOLD,
            color: INK,
            fontSize: 14,
            fontWeight: 800,
            padding: "9px 18px",
            borderRadius: 10,
            textDecoration: "none",
          }}>افتح التطبيق</Link>
        </div>
      </nav>

      {/* Site label */}
      <div style={{ textAlign: "center", paddingTop: 18, fontSize: 11, fontWeight: 800, color: GREEN, letterSpacing: 2 }}>
        ALJAIKER.COM
      </div>

      {/* Hero */}
      <section style={{ padding: "24px 24px 40px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(36px, 9vw, 52px)", fontWeight: 900, color: INK, lineHeight: 1.2, margin: "0 0 8px" }}>
          يا شباب منو الفايز؟
        </h1>
        <div style={{ fontSize: "clamp(28px, 7vw, 40px)", fontWeight: 900, color: GREEN, margin: "0 0 18px", lineHeight: 1.2 }}>
          الدفتر عند الجيكر
        </div>
        <p style={{ fontSize: 16, color: INK_500, margin: "0 0 32px", lineHeight: 1.7, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
          كل جولة بضغطة، المجموع محسوب، والسجل محفوظ ومشاركه مع الشلة برابط واحد.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/app" style={{
            background: GOLD,
            color: INK,
            fontSize: 16,
            fontWeight: 800,
            padding: "14px 32px",
            borderRadius: 14,
            textDecoration: "none",
            display: "inline-block",
          }}>
            ابدأ لعبة
          </Link>
          <Link href="/blog" style={{
            background: WHITE,
            border: `1.5px solid #D4ECD9`,
            color: INK_700,
            fontSize: 16,
            fontWeight: 600,
            padding: "14px 32px",
            borderRadius: 14,
            textDecoration: "none",
            display: "inline-block",
          }}>
            شوف مثال
          </Link>
        </div>
      </section>

      {/* Cards + Score Preview */}
      <section style={{ padding: "0 20px 48px", maxWidth: 440, margin: "0 auto" }}>
        {/* AlJaiker character illustration */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ borderRadius: 32, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.15)", width: 240 }}>
            <img
              src="/images/AlJaiker%20Profile%20White.jpg"
              alt="الجيكر"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>

        {/* Score preview card */}
        <div style={{
          background: WHITE,
          borderRadius: 18,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}>
          {/* Header row */}
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F0EDE9" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: INK }}>تريكس · الجولة ٤</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#CE1F26", background: "#FFF0F0", padding: "3px 8px", borderRadius: 20 }}>مباشر</div>
          </div>
          {/* Players */}
          {[
            { name: "بو خالد", score: 310, delta: "+30" },
            { name: "فهد",     score: 245, delta: "-40" },
            { name: "أم سعود", score: 190, delta: "+10" },
          ].map((p) => (
            <div key={p.name} style={{ padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F8F6F4" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{p.name}</div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: p.delta.startsWith("+") ? GREEN : "#CE1F26",
                  minWidth: 36,
                  textAlign: "left",
                }}>{p.delta}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: INK, fontVariantNumeric: "tabular-nums", minWidth: 48, textAlign: "left" }}>{p.score}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Games section */}
      <section style={{ padding: "48px 24px", background: WHITE }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 900, color: INK, marginBottom: 20 }}>ألعابك كلها هنا</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 32 }}>
            {GAME_TAGS.map(tag => (
              <div key={tag} style={{
                padding: "8px 18px",
                borderRadius: 24,
                background: "#F1FAF4",
                border: "1.5px solid #D4ECD9",
                color: GREEN_DK,
                fontSize: 14,
                fontWeight: 700,
              }}>{tag}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "48px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: INK, marginBottom: 8 }}>أرسل الرابط للشلة</h2>
          <p style={{ color: INK_500, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            شارك رابط اللعبة مع رفقتك — يتابعون النقاط على جوالهم بدون تحميل
          </p>
          <Link href="/app" style={{
            display: "block",
            background: GREEN,
            color: WHITE,
            fontSize: 17,
            fontWeight: 800,
            padding: "16px 0",
            borderRadius: 16,
            textDecoration: "none",
          }}>
            ابدأ لعبة الآن
          </Link>
          <div style={{ marginTop: 12, fontSize: 12, color: INK_500 }}>بدون تحميل · بشغل على أي جوال</div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: GREEN_DK, padding: "28px 24px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/images/AlJaiker%20Profile%20White.jpg" alt="الجيكر" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
            <span style={{ color: GOLD, fontSize: 16, fontWeight: 900 }}>الجيكر</span>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/about"   style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>عنّا</Link>
            <Link href="/blog"    style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>دليل الألعاب</Link>
            <Link href="/contact" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>تواصل معنا</Link>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>الخصوصية</Link>
          </div>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>© {new Date().getFullYear()} الجيكر</div>
        </div>
      </footer>

    </div>
  );
}
