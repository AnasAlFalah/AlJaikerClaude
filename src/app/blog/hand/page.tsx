import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "كيف تلعب هند؟ لعبة السبع جولات — الجيكر",
  description: "دليل شامل لقواعد لعبة هند: السبع جولات، قيم الفوز، العقوبات، واستراتيجيات لتحسين نتيجتك.",
  keywords: ["هند", "لعبة هند", "قواعد هند", "هند سبع جولات", "ألعاب ورق خليجية"],
};

const FELT = "#1B5E38"; const FELT_DK = "#0F3D24"; const IVORY = "#F8F2E4"; const GOLD = "#F2D060"; const JET = "#1A1210"; const AMBER = "#D4A420";

const ROUNDS = [
  { num: 1, name: "فاليد", desc: "لا تأخذ أي أكلة (باص)", icon: "🚫" },
  { num: 2, name: "الأكلات", desc: "كل أكلة تأخذها تعاقَب عليها", icon: "🍴" },
  { num: 3, name: "الحمرة", desc: "تجنّب أوراق القلوب والديامن الحمراء", icon: "♥" },
  { num: 4, name: "الميمات", desc: "تجنّب أخذ ميمات (ملكات)", icon: "♛" },
  { num: 5, name: "ميم الحاس", desc: "تجنّب أخذ ميم القلوب تحديداً", icon: "♥" },
  { num: 6, name: "الكبار", desc: "تجنّب أخذ الأوراق الكبيرة (A, K, Q)", icon: "👑" },
  { num: 7, name: "الملوك", desc: "الجولة الحرة — اجمع أكبر عدد من نقاط الفوز", icon: "🃏" },
];

export default function HandGuidePage() {
  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: GOLD, fontSize: 20, fontWeight: 900, textDecoration: "none" }}>الجيكر</Link>
        <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "7px 16px", borderRadius: 9, textDecoration: "none" }}>افتح التطبيق</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, marginBottom: 12 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>الرئيسية</Link> ← <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>دليل الألعاب</Link> ← هند
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${AMBER}20`, border: `1.5px solid ${AMBER}40`, borderRadius: 10, padding: "6px 14px", marginBottom: 20 }}>
          <span style={{ color: AMBER, fontSize: 16 }}>✋</span>
          <span style={{ color: AMBER, fontWeight: 700, fontSize: 13 }}>هند</span>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: IVORY, marginBottom: 8, lineHeight: 1.2 }}>كيف تلعب هند؟<br /><span style={{ color: GOLD }}>لعبة السبع جولات</span></h1>
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 2, marginBottom: 40 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 36, fontSize: 16, lineHeight: 1.85, color: "rgba(248,242,228,0.75)" }}>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>ما هي هند؟</h2>
            <p>هند لعبة ورق تُلعب بـ 4 أو 5 لاعبين. تتكون من <strong style={{ color: IVORY }}>سبع جولات</strong> — كل جولة لها قاعدة مختلفة. الهدف هو تجنّب أخذ الأوراق التي تعاقَب عليها في كل جولة والحصول على أقل نقاط في النهاية.</p>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 16 }}>الجولات السبع</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ROUNDS.map(r => (
                <div key={r.num} style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 18px" }}>
                  <div style={{ background: `${AMBER}20`, border: `1.5px solid ${AMBER}30`, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: AMBER, fontSize: 15, flexShrink: 0 }}>{r.num}</div>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</div>
                  <div>
                    <div style={{ color: IVORY, fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{r.name}</div>
                    <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 13 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>قيم الفوز والخسارة</h2>
            <p>في جولات التجنّب (1 إلى 6): من لا يأخذ شيئاً يكسب نقاطاً، ومن يأخذ أوراقاً محظورة يخسر نقاطاً بحسب نوع الجولة.</p>
            <p>في الجولة 7 (الملوك): الجولة الحرة، النقاط توزَّع على أساس قيمة الأوراق التي أخذها كل لاعب.</p>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>نهاية اللعبة</h2>
            <p>بعد إكمال الجولات السبع، يُحسب المجموع الكلي لكل لاعب. <strong style={{ color: GOLD }}>أقل مجموع = الفائز.</strong></p>
          </section>

          <div style={{ background: `${AMBER}10`, border: `1.5px solid ${AMBER}25`, borderRadius: 16, padding: "20px 22px", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 32 }}>✋</div>
            <div>
              <div style={{ color: AMBER, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>تتبع نقاط هند بسهولة</div>
              <div style={{ fontSize: 14, color: "rgba(248,242,228,0.6)", marginBottom: 12 }}>الجيكر يعرض لك الجولات السبع ويحسب النقاط تلقائياً</div>
              <Link href="/hand/setup" style={{ background: AMBER, color: JET, fontSize: 13, fontWeight: 800, padding: "9px 20px", borderRadius: 9, textDecoration: "none", display: "inline-block" }}>
                ابدأ لعبة هند
              </Link>
            </div>
          </div>

        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          {[["trix","تريكس"],["kout","كوت"],["spide","سبيدة"]].map(([slug, label]) => (
            <Link key={slug} href={`/blog/${slug}`} style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, textDecoration: "none" }}>دليل {label} ←</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
