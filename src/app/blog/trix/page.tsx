import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "كيف تلعب تريكس؟ الدليل الكامل لقواعد تريكس الكويتي — الجيكر",
  description: "دليل شامل لقواعد لعبة تريكس الكويتية: الممالك، الإعلانات الخمس (تريكس، باش الحاس، الميمات، الديامن، الأكلات)، وطريقة حساب النقاط.",
  keywords: ["تريكس", "قواعد تريكس", "كيفية لعب تريكس", "تريكس كويتي", "الإعلانات في تريكس"],
};

const FELT = "#1B5E38"; const FELT_DK = "#0F3D24"; const IVORY = "#F8F2E4"; const GOLD = "#F2D060"; const JET = "#1A1210"; const PURPLE = "#5B3FA6";

export default function TrixGuidePage() {
  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: GOLD, fontSize: 20, fontWeight: 900, textDecoration: "none" }}>الجيكر</Link>
        <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "7px 16px", borderRadius: 9, textDecoration: "none" }}>افتح التطبيق</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, marginBottom: 12 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>الرئيسية</Link> ← <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>دليل الألعاب</Link> ← تريكس
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${PURPLE}20`, border: `1.5px solid ${PURPLE}40`, borderRadius: 10, padding: "6px 14px", marginBottom: 20 }}>
          <span style={{ fontSize: 18, color: PURPLE }}>♛</span>
          <span style={{ color: PURPLE, fontWeight: 700, fontSize: 13 }}>تريكس</span>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: IVORY, marginBottom: 8, lineHeight: 1.2 }}>كيف تلعب تريكس؟<br /><span style={{ color: GOLD }}>الدليل الكامل</span></h1>
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 2, marginBottom: 40 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 36, fontSize: 16, lineHeight: 1.85, color: "rgba(248,242,228,0.75)" }}>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>ما هو تريكس؟</h2>
            <p>تريكس هي أشهر لعبة ورق في الكويت والخليج. تُلعب بـ 4 أو 5 لاعبين، وتتكون من ممالك — كل لاعب يكون &quot;ملكاً&quot; مرة. في كل مملكة، يختار الملك إعلاناً واحداً أو أكثر من الإعلانات الخمس.</p>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 16 }}>الإعلانات الخمس</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { name: "تريكس", icon: "🃏", color: PURPLE, desc: "يرتّب اللاعبون أنفسهم حسب ترتيب خروجهم. من يفضّ أوراقه أولاً يأخذ أعلى النقاط (سالبة لمن تحته)." },
                { name: "باش الحاس", icon: "♥", color: "#C8102E", desc: "من يأخذ 'باش الحاس' (ملك القلوب) يخسر 75 نقطة. إذا أُعلن 'ملك الحاس' تتضاعف العقوبة لـ 150." },
                { name: "الميمات", icon: "♛", color: GOLD, desc: "كل ميم (ملكة) = 25 نقطة على من يأخذها. إذا أعلنها اللاعب تتضاعف العقوبة لـ 50 نقطة." },
                { name: "الديامن", icon: "♦", color: "#0077B6", desc: "كل ورقة ديامن (أحمر) تساوي 10 نقاط على آخذها. من يأخذ أكثر ديامن يخسر أكثر." },
                { name: "الأكلات", icon: "🍴", color: "#4A7C5A", desc: "كل أوضة تأكلها = 15 نقطة عليك. أقلّل أكلاتك للحفاظ على نقاطك." },
              ].map(d => (
                <div key={d.name} style={{ background: "rgba(255,255,255,0.04)", border: `1.5px solid ${d.color}30`, borderRadius: 14, padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{d.icon}</span>
                  <div>
                    <div style={{ color: d.color, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{d.name}</div>
                    <div style={{ fontSize: 14, color: "rgba(248,242,228,0.6)", lineHeight: 1.65 }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>الممالك</h2>
            <p>عدد الممالك = عدد اللاعبين. كل لاعب يلعب مملكة واحدة كـ &quot;ملك&quot;، وترتيب الممالك يُحدَّد قبل بداية اللعبة.</p>
            <p>في كل مملكة، الملك يختار إعلاناً أو أكثر من الخمس. بعد إكمال جميع الإعلانات في المملكة، ينتقل الدور للملك التالي.</p>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>حساب النقاط</h2>
            <p>النقاط في تريكس سالبة بالغالب — الفائز هو من لديه أعلى مجموع في النهاية (أقل خسارة). كل إعلان له نقاطه الخاصة كما ذُكر أعلاه.</p>
            <p>عند إكمال جميع الممالك، من لديه أعلى مجموع يفوز.</p>
          </section>

          <div style={{ background: "rgba(242,208,96,0.08)", border: "1.5px solid rgba(242,208,96,0.2)", borderRadius: 16, padding: "20px 22px", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 32 }}>🃏</div>
            <div>
              <div style={{ color: GOLD, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>سجّل نقاط تريكس بدقة</div>
              <div style={{ fontSize: 14, color: "rgba(248,242,228,0.6)", marginBottom: 12 }}>الجيكر يحتسب النقاط تلقائياً لكل إعلان — بدون أخطاء في الحساب</div>
              <Link href="/trix/setup" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "9px 20px", borderRadius: 9, textDecoration: "none", display: "inline-block" }}>
                ابدأ لعبة تريكس
              </Link>
            </div>
          </div>

        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
          {[["kout","كوت"],["spide","سبيدة"],["hand","هند"]].map(([slug, label]) => (
            <Link key={slug} href={`/blog/${slug}`} style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, textDecoration: "none" }}>دليل {label} ←</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
