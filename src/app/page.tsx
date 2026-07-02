import Link from "next/link";

const games = [
  { id: "kout",  name: "كوت",    icon: "♠", color: "#C8102E", players: "4-6 لاعبين" },
  { id: "trix",  name: "تريكس",  icon: "♛", color: "#5B3FA6", players: "4-5 لاعبين" },
  { id: "spide", name: "سبيد",   icon: "♥", color: "#E74C3C", players: "4-6 لاعبين" },
  { id: "hand",  name: "هند",    icon: "♦", color: "#D4A420", players: "4 لاعبين"   },
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
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "#0F3D24",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#D4A420", fontSize: 18, fontWeight: 900,
        }}>
          J♦
        </div>
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

          {/* 2×2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            {games.map((game) => (
              <Link key={game.id} href={`/${game.id}/setup`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 16,
                  border: "1.5px solid #EEE",
                  minHeight: 110,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  cursor: "pointer",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${game.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, color: game.color,
                  }}>
                    {game.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1210" }}>{game.name}</div>
                    <div style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>{game.players}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* General scoring full width */}
          <Link href="/general/setup" style={{ textDecoration: "none" }}>
            <div style={{
              background: "#4A7C5A",
              borderRadius: 16,
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: "rgba(0,0,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, flexShrink: 0,
              }}>
                ★
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>تسجيل عام</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>2+ لاعبين</div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 20 }}>←</div>
            </div>
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
