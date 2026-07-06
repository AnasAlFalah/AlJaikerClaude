import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "شروط الاستخدام — الجيكر",
  description: "شروط استخدام تطبيق الجيكر لتسجيل نقاط ألعاب الورق الكويتية.",
};

const FELT = "#1B5E38"; const FELT_DK = "#0F3D24"; const IVORY = "#F8F2E4"; const GOLD = "#F2D060"; const JET = "#1A1210";

const SECTIONS = [
  {
    title: "قبول الشروط",
    body: "باستخدامك لتطبيق الجيكر (aljaiker.com)، فأنت توافق على هذه الشروط. إذا لم توافق عليها، يرجى عدم استخدام التطبيق.",
  },
  {
    title: "وصف الخدمة",
    body: "الجيكر هو تطبيق ويب مجاني لتسجيل نقاط ألعاب الورق الكويتية (تريكس، كوت، سبيدة، هند). التطبيق مقدَّم 'كما هو' دون ضمانات.",
  },
  {
    title: "حساب المستخدم",
    body: "التسجيل اختياري تماماً. إذا اخترت إنشاء حساب، فأنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك وعن جميع الأنشطة التي تجري تحت حسابك.",
  },
  {
    title: "الاستخدام المقبول",
    body: "توافق على عدم استخدام التطبيق لأي غرض غير قانوني، وعدم محاولة اختراق أو إضرار بالخدمة، وعدم نشر محتوى مسيء أو مضلل.",
  },
  {
    title: "الملكية الفكرية",
    body: "جميع محتويات التطبيق (التصميم، الكود، الشعار) هي ملك لفريق الجيكر. لا يُسمح بنسخ أو إعادة استخدام أي جزء منها دون إذن مسبق.",
  },
  {
    title: "إخلاء المسؤولية",
    body: "الجيكر غير مسؤول عن أي خسائر أو نزاعات تنشأ من استخدام التطبيق. نتائج الألعاب المسجّلة هي مسؤولية المستخدمين.",
  },
  {
    title: "إنهاء الخدمة",
    body: "نحتفظ بالحق في تعليق أو إنهاء حسابات تنتهك هذه الشروط. يمكنك حذف حسابك في أي وقت من صفحة الملف الشخصي.",
  },
  {
    title: "التغييرات",
    body: "قد نُحدّث هذه الشروط من وقت لآخر. الاستمرار في استخدام التطبيق بعد التغييرات يعني موافقتك عليها. آخر تحديث: يوليو 2025.",
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: FELT_DK, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif", direction: "rtl", color: IVORY }}>
      <nav style={{ background: FELT, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ color: GOLD, fontSize: 20, fontWeight: 900, textDecoration: "none" }}>الجيكر</Link>
        <Link href="/app" style={{ background: GOLD, color: JET, fontSize: 13, fontWeight: 800, padding: "7px 16px", borderRadius: 9, textDecoration: "none" }}>افتح التطبيق</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 13, marginBottom: 12 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>الرئيسية</Link> ← شروط الاستخدام
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900, color: IVORY, marginBottom: 8 }}>شروط الاستخدام</h1>
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 2, marginBottom: 12 }} />
        <p style={{ color: "rgba(248,242,228,0.5)", fontSize: 14, marginBottom: 40 }}>آخر تحديث: يوليو 2025</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {SECTIONS.map((sec, i) => (
            <div key={sec.title} style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(242,208,96,0.12)", border: "1.5px solid rgba(242,208,96,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>
                {i + 1}
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: IVORY, marginBottom: 8, marginTop: 0 }}>{sec.title}</h2>
                <p style={{ color: "rgba(248,242,228,0.65)", fontSize: 15, lineHeight: 1.8, margin: 0 }}>{sec.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: "20px", background: "rgba(255,255,255,0.04)", borderRadius: 14, fontSize: 14, color: "rgba(248,242,228,0.5)", lineHeight: 1.7 }}>
          أسئلة؟ <Link href="/contact" style={{ color: GOLD, textDecoration: "none" }}>تواصل معنا</Link>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {[["about","عنّا"],["privacy","سياسة الخصوصية"],["contact","تواصل معنا"],["blog","دليل الألعاب"]].map(([href, label]) => (
            <Link key={href} href={`/${href}`} style={{ color: "rgba(248,242,228,0.35)", fontSize: 13, textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
