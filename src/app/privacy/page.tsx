import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "سياسة الخصوصية — الجيكر",
  description: "سياسة خصوصية تطبيق الجيكر — كيف نجمع ونستخدم بياناتك.",
};

const FELT = "#1B5E38"; const FELT_DK = "#0F3D24"; const IVORY = "#F8F2E4"; const GOLD = "#F2D060"; const JET = "#1A1210";

const SECTIONS = [
  {
    title: "ما المعلومات التي نجمعها؟",
    body: [
      "**بدون تسجيل:** لا نجمع أي معلومات شخصية. بيانات اللعبة (أسماء اللاعبين والنقاط) تُحفظ فقط على جهازك ولا تُرسل لخوادمنا.",
      "**عند التسجيل (اختياري):** نجمع اسمك وبريدك الإلكتروني وصورتك الشخصية (في حالة تسجيل الدخول عبر Google). هذه البيانات تُستخدم فقط لتوفير خاصية الديوانية والسجل الشخصي.",
      "**البث المباشر:** عند تفعيل خاصية البث، يُرفع ملخص نقاط اللعبة الحالية مؤقتاً لخوادمنا لمشاركته مع المشاهدين.",
    ],
  },
  {
    title: "كيف نستخدم البيانات؟",
    body: [
      "لتشغيل خاصية الديوانية وتذكّر أعضائها.",
      "لحفظ تفضيلات اللغة (عربي / إنجليزي).",
      "لا نبيع بياناتك لأي طرف ثالث إطلاقاً.",
      "لا نستخدم بياناتك للإعلانات.",
    ],
  },
  {
    title: "خدمات الطرف الثالث",
    body: [
      "نستخدم **Firebase (Google)** للمصادقة وحفظ بيانات الديوانية. خضوع Firebase لسياسة خصوصية Google.",
      "بيانات اللعبة المحلية تُخزَّن في متصفحك (localStorage) ولا تغادر جهازك إلا عند تفعيل البث المباشر.",
    ],
  },
  {
    title: "حذف البيانات",
    body: [
      "يمكنك حذف حسابك في أي وقت من صفحة الملف الشخصي.",
      "لمسح بيانات الألعاب المحلية: امسح بيانات الموقع من إعدادات متصفحك.",
      "للتواصل بشأن حذف بياناتك: راسلنا عبر صفحة التواصل.",
    ],
  },
  {
    title: "الأطفال",
    body: [
      "التطبيق غير موجّه لمن هم دون 13 عاماً. لا نجمع بيانات الأطفال عن قصد.",
    ],
  },
  {
    title: "التحديثات",
    body: [
      "قد نُحدّث هذه السياسة من وقت لآخر. سنُعلمك بأي تغييرات جوهرية عبر التطبيق.",
      "آخر تحديث: يوليو 2025",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: GOLD, fontSize: 20, fontWeight: 900, textDecoration: "none" }}>الجيكر</Link>
        <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "7px 16px", borderRadius: 9, textDecoration: "none" }}>افتح التطبيق</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, marginBottom: 12 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>الرئيسية</Link> ← سياسة الخصوصية
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900, color: IVORY, marginBottom: 8 }}>سياسة الخصوصية</h1>
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 2, marginBottom: 12 }} />
        <p style={{ color: "rgba(248,242,228,0.5)", fontSize: 14, marginBottom: 40 }}>آخر تحديث: يوليو 2025</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {SECTIONS.map(sec => (
            <div key={sec.title}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: GOLD, marginBottom: 14 }}>{sec.title}</h2>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {sec.body.map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "rgba(248,242,228,0.7)", fontSize: 15, lineHeight: 1.75 }}>
                    <span style={{ color: GOLD, flexShrink: 0, marginTop: 3 }}>•</span>
                    <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#F8F2E4">$1</strong>') }} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: "20px", background: "rgba(255,255,255,0.04)", borderRadius: 14, fontSize: 14, color: "rgba(248,242,228,0.5)", lineHeight: 1.7 }}>
          أسئلة؟ <Link href="/contact" style={{ color: GOLD, textDecoration: "none" }}>تواصل معنا</Link>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {[["about","عنّا"],["terms","شروط الاستخدام"],["contact","تواصل معنا"],["blog","دليل الألعاب"]].map(([href, label]) => (
            <Link key={href} href={`/${href}`} style={{ color: "rgba(248,242,228,0.35)", fontSize: 13, textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
