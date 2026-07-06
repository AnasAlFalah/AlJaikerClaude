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

const FELT    = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY   = "#F8F2E4";
const GOLD    = "#F2D060";
const JET     = "#1A1210";

const GAMES = [
  { name: "تريكس", desc: "اللعبة الأكثر شعبية في الكويت — ممالك وإعلانات وتنافس حقيقي", icon: "♛", color: "#5B3FA6" },
  { name: "كوت بو ستة", desc: "لعبة الفريق الكلاسيكية — 51 أو 101 نقطة للفوز", icon: "🃏", color: "#C8102E" },
  { name: "سبيدة", desc: "احجب القلوب وتجنب ملكة البستون", icon: "♥", color: "#0077B6" },
  { name: "هند", desc: "سبع جولات، من يجمع أقل يفوز", icon: "✋", color: "#D4A420" },
];

const FEATURES = [
  { icon: "📡", title: "بث مباشر", desc: "شارك رمز QR مع الجالسين — يتابعون النقاط على جواليهم في الوقت الفعلي" },
  { icon: "🏡", title: "الديوانية", desc: "أنشئ مجموعتك الخاصة، ادع الأعضاء، وتابع السجل والترتيب" },
  { icon: "🏆", title: "السجل والإحصائيات", desc: "كل لعبة تُحفظ — اعرف من الأكثر فوزاً في ديوانيتك" },
  { icon: "👤", title: "بدون إجبار", desc: "التطبيق يعمل بالكامل بدون تسجيل — سجّل فقط إذا أردت الديوانية والسجل" },
];

export default function LandingPage() {
  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>

      {/* Nav */}
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
        <div style={{ color: GOLD, fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>الجيكر</div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/about" style={{ color: "rgba(248,242,228,0.6)", fontSize: 14, textDecoration: "none" }}>عنّا</Link>
          <Link href="/blog" style={{ color: "rgba(248,242,228,0.6)", fontSize: 14, textDecoration: "none" }}>دليل الألعاب</Link>
          <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 14, fontWeight: 800, padding: "8px 18px", borderRadius: 10, textDecoration: "none" }}>افتح التطبيق</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "72px 24px 64px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(242,208,96,0.12)", border: "1px solid rgba(242,208,96,0.25)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: GOLD, marginBottom: 24, fontWeight: 700 }}>
          مجاني تماماً · بدون تحميل · يعمل على الجوال
        </div>
        <h1 style={{ fontSize: "clamp(36px, 8vw, 64px)", fontWeight: 900, color: IVORY, lineHeight: 1.15, margin: "0 0 20px", letterSpacing: -1 }}>
          ديوانيتك الإلكترونية<br />
          <span style={{ color: GOLD }}>لألعاب الورق الكويتية</span>
        </h1>
        <p style={{ fontSize: 18, color: "rgba(248,242,228,0.6)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          سجّل نقاط تريكس، كوت، سبيدة وهند — شارك النتائج مباشرة مع من حولك، وأنشئ ديوانيتك مع أصدقاءك وعائلتك.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 17, fontWeight: 800, padding: "15px 36px", borderRadius: 14, textDecoration: "none", display: "inline-block" }}>
            🃏 ابدأ اللعب الآن
          </Link>
          <Link href="/blog" style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: IVORY, fontSize: 17, fontWeight: 600, padding: "15px 36px", borderRadius: 14, textDecoration: "none", display: "inline-block" }}>
            دليل الألعاب
          </Link>
        </div>
      </section>

      {/* Games */}
      <section style={{ padding: "64px 24px", background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: IVORY, marginBottom: 40 }}>الألعاب المدعومة</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
            {GAMES.map(g => (
              <div key={g.name} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${g.color}20`, border: `2px solid ${g.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: g.color }}>
                  {g.icon}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: IVORY }}>{g.name}</div>
                <div style={{ fontSize: 13, color: "rgba(248,242,228,0.5)", lineHeight: 1.6 }}>{g.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: IVORY, marginBottom: 40 }}>لماذا الجيكر؟</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "20px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                <div style={{ fontSize: 30 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: IVORY }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "rgba(248,242,228,0.5)", lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section style={{ padding: "64px 24px", background: FELT, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: IVORY, margin: 0 }}>جاهز للعب؟</h2>
          <p style={{ color: "rgba(248,242,228,0.55)", fontSize: 16, margin: 0, lineHeight: 1.6 }}>لا تحتاج لتحميل أي شيء — يعمل مباشرة من المتصفح على جوالك</p>
          <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 17, fontWeight: 800, padding: "15px 44px", borderRadius: 14, textDecoration: "none" }}>
            افتح التطبيق
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: FELT_DK, padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: GOLD, fontSize: 20, fontWeight: 900 }}>الجيكر</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link href="/about"   style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, textDecoration: "none" }}>عنّا</Link>
            <Link href="/blog"    style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, textDecoration: "none" }}>دليل الألعاب</Link>
            <Link href="/contact" style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, textDecoration: "none" }}>تواصل معنا</Link>
            <Link href="/privacy" style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, textDecoration: "none" }}>سياسة الخصوصية</Link>
            <Link href="/terms"   style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, textDecoration: "none" }}>شروط الاستخدام</Link>
          </div>
          <div style={{ color: "rgba(248,242,228,0.25)", fontSize: 12 }}>© {new Date().getFullYear()} الجيكر. جميع الحقوق محفوظة.</div>
        </div>
      </footer>

    </div>
  );
}
