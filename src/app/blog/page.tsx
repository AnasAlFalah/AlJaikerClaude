import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "دليل ألعاب الورق الكويتية — الجيكر",
  description: "تعلّم قواعد تريكس، كوت بو ستة، سبيدة وهند — الدليل الكامل لألعاب الورق الكويتية الكلاسيكية.",
  keywords: ["قواعد تريكس", "كيفية لعب كوت", "سبيدة قواعد", "هند لعبة ورق", "ألعاب ورق كويتية"],
};

const FELT = "#1B5E38"; const FELT_DK = "#0F3D24"; const IVORY = "#F8F2E4"; const GOLD = "#F2D060"; const JET = "#1A1210";

const ARTICLES = [
  {
    slug: "trix",
    title: "كيف تلعب تريكس؟ — الدليل الكامل",
    desc: "تعلّم قواعد تريكس الكويتية: الممالك، الإعلانات الخمس (تريكس، باش الحاس، الميمات، الديامن، الأكلات)، والنقاط.",
    icon: "♛", color: "#5B3FA6",
    readTime: "5 دقائق",
    tags: ["تريكس", "قواعد", "ورق"],
  },
  {
    slug: "kout",
    title: "كوت بو ستة — القواعد والاستراتيجية",
    desc: "الدليل الكامل للعب كوت بو ستة: كيف تعلن الحكم، أنواع الهوكم، حساب النقاط، والفرق بين 51 و101.",
    icon: "🃏", color: "#C8102E",
    readTime: "6 دقائق",
    tags: ["كوت", "قواعد", "استراتيجية"],
  },
  {
    slug: "spide",
    title: "سبيدة (قلوب) — كيف تلعب وكيف تفوز",
    desc: "قواعد لعبة سبيدة الكاملة: تمرير الأوراق، احتساب النقاط، ميم البستون، عشر الديمن، وأسلوب 'اكل الكل'.",
    icon: "♥", color: "#0077B6",
    readTime: "5 دقائق",
    tags: ["سبيدة", "قلوب", "قواعد"],
  },
  {
    slug: "hand",
    title: "هند — لعبة السبع جولات",
    desc: "تعلّم كيف تلعب هند: سبع جولات، قيم الفوز، العقوبات، وكيف تحسب الفائز في النهاية.",
    icon: "✋", color: "#D4A420",
    readTime: "4 دقائق",
    tags: ["هند", "قواعد", "ورق"],
  },
];

export default function BlogIndexPage() {
  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: GOLD, fontSize: 20, fontWeight: 900, textDecoration: "none" }}>الجيكر</Link>
        <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "7px 16px", borderRadius: 9, textDecoration: "none" }}>افتح التطبيق</Link>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, marginBottom: 12 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>الرئيسية</Link> ← دليل الألعاب
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900, color: IVORY, marginBottom: 8 }}>دليل ألعاب الورق الكويتية</h1>
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 2, marginBottom: 16 }} />
        <p style={{ color: "rgba(248,242,228,0.55)", fontSize: 16, lineHeight: 1.7, marginBottom: 48, maxWidth: 600 }}>
          القواعد الكاملة لأشهر ألعاب الورق في الكويت والخليج — من المبتدئين للمحترفين.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {ARTICLES.map(a => (
            <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <article style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18, padding: 22, height: "100%",
                display: "flex", flexDirection: "column", gap: 14,
                transition: "border-color 0.2s",
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${a.color}18`, border: `2px solid ${a.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: a.color }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ color: IVORY, fontSize: 17, fontWeight: 800, lineHeight: 1.4, margin: "0 0 8px" }}>{a.title}</h2>
                  <p style={{ color: "rgba(248,242,228,0.5)", fontSize: 13, lineHeight: 1.65, margin: 0 }}>{a.desc}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {a.tags.map(tag => (
                      <span key={tag} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "rgba(248,242,228,0.4)" }}>{tag}</span>
                    ))}
                  </div>
                  <span style={{ color: "rgba(248,242,228,0.3)", fontSize: 11 }}>⏱ {a.readTime}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {[["about","عنّا"],["privacy","سياسة الخصوصية"],["terms","شروط الاستخدام"],["contact","تواصل معنا"]].map(([href, label]) => (
            <Link key={href} href={`/${href}`} style={{ color: "rgba(248,242,228,0.35)", fontSize: 13, textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
