import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import HomeClient from "@/components/HomeClient";

const games = [
  { id: "kout",  img: "/images/Kout.png"  },
  { id: "trix",  img: "/images/Trix.png"  },
  { id: "spide", img: "/images/Spide.png" },
  { id: "hand",  img: "/images/Hand.png"  },
];

export default async function HomePage() {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const locale = await getLocale();

  return (
    <main style={{
      minHeight: "100vh",
      background: "#F5F5F5",
      display: "flex",
      flexDirection: "column",
      maxWidth: 390,
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>

      {/* Header */}
      <header style={{
        background: "#1B5E38",
        padding: "48px 20px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        direction: locale === "ar" ? "rtl" : "ltr",
      }}>
        <div>
          <div style={{ color: "#F2D060", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
            {tc("appName")}
          </div>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 12, marginTop: 2 }}>
            {tc("appSubtitle")}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HomeClient locale={locale} />
          <img
            src="/images/AlJaiker.png"
            alt="AlJaiker"
            style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }}
          />
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, padding: "20px 16px 40px", display: "flex", flexDirection: "column", gap: 24, direction: locale === "ar" ? "rtl" : "ltr" }}>

        {/* Ongoing games */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 10, letterSpacing: 1 }}>
            {t("ongoing")}
          </div>
          <div style={{
            background: "white", borderRadius: 16, padding: "16px",
            border: "1.5px dashed #DDD", display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ fontSize: 24 }}>🃏</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#AAA" }}>{t("noOngoing")}</div>
              <div style={{ fontSize: 11, color: "#CCC", marginTop: 2 }}>{t("noOngoingSub")}</div>
            </div>
          </div>
        </section>

        {/* New game */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 10, letterSpacing: 1 }}>
            {t("newGame")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {games.map((game) => (
              <Link key={game.id} href={`/${game.id}/setup`} style={{ textDecoration: "none", display: "block" }}>
                <img
                  src={game.img} alt={game.id}
                  style={{ width: "100%", borderRadius: 14, display: "block", boxShadow: "0 3px 12px rgba(0,0,0,0.18)" }}
                />
              </Link>
            ))}
          </div>
          <Link href="/general/setup" style={{ textDecoration: "none", display: "block" }}>
            <img
              src="/images/QaidAam.png" alt="تسجيل عام"
              style={{ width: "100%", borderRadius: 14, display: "block", boxShadow: "0 3px 12px rgba(0,0,0,0.18)" }}
            />
          </Link>
        </section>

        {/* Diwanya */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 10, letterSpacing: 1 }}>
            {t("diwanya")}
          </div>
          <Link href="/diwanya" style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", borderRadius: 16, padding: 16,
              border: "1.5px solid #EEE", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(27,94,56,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏡</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1210" }}>{t("diwanyaTitle")}</div>
                <div style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>{t("diwanyaSub")}</div>
              </div>
              <div style={{ color: "#CCC", fontSize: 20 }}>{locale === "ar" ? "←" : "→"}</div>
            </div>
          </Link>
        </section>

        {/* History */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 10, letterSpacing: 1 }}>
            {t("history")}
          </div>
          <Link href="/history" style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", borderRadius: 16, padding: 16,
              border: "1.5px solid #EEE", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(212,164,32,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1210" }}>{t("history")}</div>
                <div style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>{t("historySub")}</div>
              </div>
              <div style={{ color: "#CCC", fontSize: 20 }}>{locale === "ar" ? "←" : "→"}</div>
            </div>
          </Link>
        </section>

      </div>
    </main>
  );
}
