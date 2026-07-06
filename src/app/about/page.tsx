import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "عنّا — الجيكر",
  description: "الجيكر تطبيق كويتي مصمم لتسجيل نقاط ألعاب الورق الكلاسيكية. اعرف قصتنا وهدفنا.",
};

const FELT = "#1B5E38"; const FELT_DK = "#0F3D24"; const IVORY = "#F8F2E4"; const GOLD = "#F2D060"; const JET = "#1A1210";

export default function AboutPage() {
  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: GOLD, fontSize: 20, fontWeight: 900, textDecoration: "none" }}>الجيكر</Link>
        <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "7px 16px", borderRadius: 9, textDecoration: "none" }}>افتح التطبيق</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, marginBottom: 12 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>الرئيسية</Link> ← عنّا
        </div>

        <h1 style={{ fontSize: 38, fontWeight: 900, color: IVORY, marginBottom: 8, letterSpacing: -0.5 }}>عنّا</h1>
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 2, marginBottom: 40 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 32, fontSize: 16, lineHeight: 1.9, color: "rgba(248,242,228,0.75)" }}>

          <div>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>القصة</h2>
            <p>الجيكر وُلد من ديوانية — كنّا نجلس نلعب تريكس وكوت، والورق والقلم دايم يضيع أو يصير خطأ في الحساب. قلنا: لازم يكون فيه شيء أسهل.</p>
            <p>الهدف كان بسيط: تطبيق يشتغل على أي جوال، بدون تحميل، ويسجّل النقاط بدقة لكل الألعاب الكويتية الكلاسيكية.</p>
          </div>

          <div>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>رؤيتنا</h2>
            <p>نحافظ على الألعاب الكويتية الأصيلة ونجعلها أسهل وأمتع للجيل الجديد. تريكس وكوت وسبيدة وهند — هذي موروث اجتماعي، مو بس ألعاب.</p>
            <p>كل لعبة في الجيكر مبنية على القواعد الكويتية الأصلية، مع مرونة في الإعدادات تناسب كل ديوانية.</p>
          </div>

          <div>
            <h2 style={{ color: IVORY, fontSize: 22, fontWeight: 800, marginBottom: 12 }}>مبادئنا</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["بدون إجبار", "التطبيق يشتغل 100٪ بدون تسجيل. التسجيل اختياري فقط لمن يريد الديوانية والسجل."],
                ["بسيط ومباشر", "بدون إعلانات، بدون تعقيد. تفتح التطبيق وتبدأ اللعب."],
                ["للكويت والخليج", "مصمم للألعاب والمصطلحات الكويتية بشكل كامل."],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ color: GOLD, fontWeight: 800, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 14, color: "rgba(248,242,228,0.6)" }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(242,208,96,0.08)", border: "1.5px solid rgba(242,208,96,0.2)", borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
            <p style={{ color: GOLD, fontWeight: 700, marginBottom: 16, fontSize: 17 }}>جاهز تجرّب؟</p>
            <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 15, fontWeight: 800, padding: "13px 32px", borderRadius: 12, textDecoration: "none", display: "inline-block" }}>
              افتح التطبيق
            </Link>
          </div>

        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {[["privacy","سياسة الخصوصية"],["terms","شروط الاستخدام"],["contact","تواصل معنا"],["blog","دليل الألعاب"]].map(([href, label]) => (
            <Link key={href} href={`/${href}`} style={{ color: "rgba(248,242,228,0.35)", fontSize: 13, textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
