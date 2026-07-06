import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "كيف تلعب كوت بو ستة؟ القواعد الكاملة — الجيكر",
  description: "دليل شامل لقواعد لعبة كوت بو ستة الكويتية: الهوكم، الحكم، النقاط، الفرق بين 51 و101، واستراتيجيات الفوز.",
  keywords: ["كوت بو ستة", "قواعد كوت", "كيفية لعب كوت", "هوكم", "لعبة ورق كويتية"],
};

const FELT = "#1B5E38"; const FELT_DK = "#0F3D24"; const IVORY = "#F8F2E4"; const GOLD = "#F2D060"; const JET = "#1A1210"; const CRIMSON = "#C8102E";

const HOKM_TABLE = [
  { hokm: "ملزوم", win: 5, lose: 5 },
  { hokm: "5", win: 5, lose: 10 },
  { hokm: "6", win: 6, lose: 12 },
  { hokm: "7", win: 7, lose: 14 },
  { hokm: "8", win: 8, lose: 16 },
  { hokm: "باون", win: 36, lose: 18 },
];

export default function KoutGuidePage() {
  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: GOLD, fontSize: 20, fontWeight: 900, textDecoration: "none" }}>الجيكر</Link>
        <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "7px 16px", borderRadius: 9, textDecoration: "none" }}>افتح التطبيق</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, marginBottom: 12 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>الرئيسية</Link> ← <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>دليل الألعاب</Link> ← كوت
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${CRIMSON}20`, border: `1.5px solid ${CRIMSON}40`, borderRadius: 10, padding: "6px 14px", marginBottom: 20 }}>
          <span style={{ fontSize: 16 }}>🃏</span>
          <span style={{ color: CRIMSON, fontWeight: 700, fontSize: 13 }}>كوت بو ستة</span>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: IVORY, marginBottom: 8, lineHeight: 1.2 }}>كيف تلعب كوت بو ستة؟<br /><span style={{ color: GOLD }}>الدليل الكامل</span></h1>
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 2, marginBottom: 40 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 36, fontSize: 16, lineHeight: 1.85, color: "rgba(248,242,228,0.75)" }}>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>ما هو كوت؟</h2>
            <p>كوت بو ستة لعبة فريقين — فريق A ضد فريق B. الهدف هو الوصول إلى النقاط المستهدفة (51 أو 101) قبل الفريق الآخر. تُلعب بـ 4 لاعبين (2×2) أو 6 لاعبين (3×3).</p>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>أساسيات اللعب</h2>
            <p>في كل جولة، يختار أحد اللاعبين دور &quot;الحكم&quot;. الحكم يعلن نوع الهوكم ويقرر إذا كان فريقه يريد الفوز (win) أو أنه سيخسر (lose). نتيجة الجولة تحدد النقاط.</p>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 16 }}>جدول نقاط الهوكم</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "rgba(242,208,96,0.1)" }}>
                    {["الهوكم", "الفريق الفائز", "الفريق الخاسر"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", color: GOLD, fontWeight: 800, textAlign: "center", border: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOKM_TABLE.map((row, i) => (
                    <tr key={row.hokm} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: IVORY, textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>{row.hokm}</td>
                      <td style={{ padding: "10px 14px", color: "#4CAF50", fontWeight: 700, textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>+{row.win}</td>
                      <td style={{ padding: "10px 14px", color: CRIMSON, fontWeight: 700, textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>+{row.lose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 13, color: "rgba(248,242,228,0.4)", marginTop: 10 }}>* النقاط تذهب للفريق الآخر (الخاصم). &quot;باون&quot; = 36 للخصم إذا فاز الحكم، 18 للخصم إذا خسر الحكم.</p>
          </section>

          <section>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>51 أم 101؟</h2>
            <p><strong style={{ color: IVORY }}>51 نقطة:</strong> جولات أسرع وأكثر إثارة — مناسب لوقت قصير.</p>
            <p><strong style={{ color: IVORY }}>101 نقطة:</strong> اللعبة الكلاسيكية الطويلة — تحتاج استراتيجية أعمق.</p>
          </section>

          <div style={{ background: "rgba(200,16,46,0.08)", border: "1.5px solid rgba(200,16,46,0.2)", borderRadius: 16, padding: "20px 22px", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 32 }}>🃏</div>
            <div>
              <div style={{ color: CRIMSON, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>سجّل نقاط كوت تلقائياً</div>
              <div style={{ fontSize: 14, color: "rgba(248,242,228,0.6)", marginBottom: 12 }}>الجيكر يحسب نقاط كل هوكم بشكل تلقائي وبدون أخطاء</div>
              <Link href="/kout/setup" style={{ background: CRIMSON, color: "#fff", fontSize: 13, fontWeight: 800, padding: "9px 20px", borderRadius: 9, textDecoration: "none", display: "inline-block" }}>
                ابدأ لعبة كوت
              </Link>
            </div>
          </div>

        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          {[["trix","تريكس"],["spide","سبيدة"],["hand","هند"]].map(([slug, label]) => (
            <Link key={slug} href={`/blog/${slug}`} style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, textDecoration: "none" }}>دليل {label} ←</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
