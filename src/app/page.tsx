import Link from "next/link";

const games = [
  { id: "kout",  img: "/images/Kout.png"  },
  { id: "trix",  img: "/images/Trix.png"  },
  { id: "spide", img: "/images/Spide.png" },
  { id: "hand",  img: "/images/Hand.png"  },
];

export default function HomePage() {
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
        direction: "rtl",
      }}>
        <div>
          <div style={{ color: "#F2D060", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
            الجيكر
          </div>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 12, marginTop: 2 }}>
            ديوانية الجمعة
          </div>
        </div>
        <img
          src="/images/AlJaiker.png"
          alt="AlJaiker"
          style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover" }}
        />
      </header>

      {/* Body */}
      <div style={{ flex: 1, padding: "20px 16px 40px", display: "flex", flexDirection: "column", gap: 24, direction: "rtl" }}>

        {/* Ongoing games */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 10, letterSpacing: 1 }}>
            الجلسات الجارية
          </div>
          <div style={{
            background: "white",
            borderRadius: 16,
            padding: "16px",
            border: "1.5px dashed #DDD",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{ fontSize: 24 }}>🃏</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#AAA" }}>لا توجد جلسات جارية</div>
              <div style={{ fontSize: 11, color: "#CCC", marginTop: 2 }}>ابدأ لعبة جديدة من الأسفل</div>
            </div>
          </div>
        </section>

        {/* New game */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 10, letterSpacing: 1 }}>
            لعبة جديدة
          </div>

          {/* 2×2 grid — card images */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {games.map((game) => (
              <Link key={game.id} href={`/${game.id}/setup`} style={{ textDecoration: "none", display: "block" }}>
                <img
                  src={game.img}
                  alt={game.id}
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    display: "block",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.18)",
                  }}
                />
              </Link>
            ))}
          </div>

          {/* General scoring — QaidAam image full width */}
          <Link href="/general/setup" style={{ textDecoration: "none", display: "block" }}>
            <img
              src="/images/QaidAam.png"
              alt="تسجيل عام"
              style={{
                width: "100%",
                borderRadius: 14,
                display: "block",
                boxShadow: "0 3px 12px rgba(0,0,0,0.18)",
              }}
            />
          </Link>
        </section>

        {/* History */}
        <section>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginBottom: 10, letterSpacing: 1 }}>
            السجل
          </div>
          <Link href="/history" style={{ textDecoration: "none" }}>
            <div style={{
              background: "white",
              borderRadius: 16,
              padding: 16,
              border: "1.5px solid #EEE",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(212,164,32,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>
                🏆
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1210" }}>السجل والترتيب</div>
                <div style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>الإحصائيات والانتصارات</div>
              </div>
              <div style={{ color: "#CCC", fontSize: 20 }}>←</div>
            </div>
          </Link>
        </section>

      </div>
    </main>
  );
}
