import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "كيف تلعب سبيدة (قلوب)؟ القواعد الكاملة — الجيكر",
  description: "دليل شامل لقواعد لعبة سبيدة الكويتية: تمرير الأوراق، ميم البستون، عشر الديمن، اكل الكل، وطريقة حساب النقاط.",
  keywords: ["سبيدة", "قلوب", "قواعد سبيدة", "كيفية لعب سبيدة", "ميم البستون"],
};

const FELT = "#1B5E38"; const FELT_DK = "#0F3D24"; const IVORY = "#F8F2E4"; const GOLD = "#F2D060"; const JET = "#1A1210"; const BLUE = "#0077B6";

export default function SpideGuidePage() {
  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: GOLD, fontSize: 20, fontWeight: 900, textDecoration: "none" }}>الجيكر</Link>
        <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "7px 16px", borderRadius: 9, textDecoration: "none" }}>افتح التطبيق</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, marginBottom: 12 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>الرئيسية</Link> ← <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>دليل الألعاب</Link> ← سبيدة
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${BLUE}20`, border: `1.5px solid ${BLUE}40`, borderRadius: 10, padding: "6px 14px", marginBottom: 20 }}>
          <span style={{ color: BLUE, fontSize: 16 }}>♥</span>
          <span style={{ color: BLUE, fontWeight: 700, fontSize: 13 }}>سبيدة</span>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: IVORY, marginBottom: 8, lineHeight: 1.2 }}>كيف تلعب سبيدة؟<br /><span style={{ color: GOLD }}>الدليل الكامل</span></h1>
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 2, marginBottom: 40 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 36, fontSize: 16, lineHeight: 1.85, color: "rgba(248,242,228,0.75)" }}>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>ما هي سبيدة؟</h2>
            <p>سبيدة (أو قلوب) لعبة ورق كلاسيكية تُلعب بـ 4 أو 5 أو 6 لاعبين. الهدف هو <strong style={{ color: IVORY }}>تجنّب</strong> أخذ أوراق القلوب وميم البستون — النقاط تتراكم عليك كلما أخذت أوراق مكلفة.</p>
            <p>الفائز هو من لديه <strong style={{ color: GOLD }}>أقل نقاط</strong> عند الوصول للهدف المحدد.</p>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 14 }}>تمرير الأوراق</h2>
            <p>قبل كل جولة، كل لاعب يمرّر 3 أوراق لجاره وفق اتجاه دوري:</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[["يمين ←","جولة 1"],["يسار →","جولة 2"],["بدون","جولة 3"]].map(([dir, round]) => (
                <div key={round} style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                  <div style={{ color: GOLD, fontSize: 16, fontWeight: 800 }}>{dir}</div>
                  <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 12, marginTop: 4 }}>{round}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 14 }}>حساب النقاط</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { item: "كل ورقة قلوب ♥", pts: "نقطة واحدة", color: "#E53935" },
                { item: "ميم البستون ♠Q", pts: "13 نقطة", color: "#5B3FA6" },
                { item: "إعلان ميم البستون", pts: "26 نقطة (مضاعفة)", color: "#5B3FA6" },
                { item: "عشر الديمن ♦10", pts: "-10 نقاط (خصم!)", color: "#0077B6" },
                { item: "إعلان عشر الديمن", pts: "-20 نقطة", color: "#0077B6" },
                { item: "ما أكلت شيء", pts: "-10 نقاط مكافأة", color: "#4CAF50" },
              ].map(row => (
                <div key={row.item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 16px" }}>
                  <span style={{ color: "rgba(248,242,228,0.7)", fontSize: 14 }}>{row.item}</span>
                  <span style={{ color: row.color, fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>{row.pts}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>اكل الكل (Shoot the Moon)</h2>
            <p>إذا أخذ لاعب واحد <strong style={{ color: IVORY }}>جميع القلوب + ميم البستون</strong> في جولة واحدة — تُحوَّل النقاط على الآخرين بدلاً منه. خطرة لكن مكافأتها عالية!</p>
          </section>

          <div style={{ background: `${BLUE}12`, border: `1.5px solid ${BLUE}30`, borderRadius: 16, padding: "20px 22px", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 32 }}>♥</div>
            <div>
              <div style={{ color: BLUE, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>سجّل نقاط سبيدة بدقة</div>
              <div style={{ fontSize: 14, color: "rgba(248,242,228,0.6)", marginBottom: 12 }}>الجيكر يحتسب كل ورقة تلقائياً</div>
              <Link href="/spide/setup" style={{ background: BLUE, color: "#fff", fontSize: 13, fontWeight: 800, padding: "9px 20px", borderRadius: 9, textDecoration: "none", display: "inline-block" }}>
                ابدأ لعبة سبيدة
              </Link>
            </div>
          </div>

        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          {[["trix","تريكس"],["kout","كوت"],["hand","هند"]].map(([slug, label]) => (
            <Link key={slug} href={`/blog/${slug}`} style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, textDecoration: "none" }}>دليل {label} ←</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
