import Link from "next/link";

const games = [
  { id: "kout",    name: "كوت",        icon: "♠", color: "#C8102E", players: "4-6 لاعبين" },
  { id: "trix",    name: "تريكس",      icon: "♛", color: "#5B3FA6", players: "4-5 لاعبين" },
  { id: "spide",   name: "سبيد",       icon: "♥", color: "#C8102E", players: "4-6 لاعبين" },
  { id: "hand",    name: "هند",        icon: "♦", color: "#D4A420", players: "4 لاعبين"   },
  { id: "general", name: "تسجيل عام",  icon: "★", color: "#4A7C5A", players: "2+ لاعبين"  },
];

// Placeholder ongoing sessions — will come from DB later
const ongoingSessions: { id: string; game: string; players: string; round: string }[] = [];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#F5F5F5" }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-5 pt-12 pb-5"
        style={{ background: "var(--felt)" }}
      >
        <div>
          <div className="text-3xl font-black tracking-tight" style={{ color: "var(--gold-lt)" }}>
            الجيكر
          </div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(248,242,228,.5)" }}>
            ديوانية الجمعة
          </div>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
          style={{ background: "var(--felt-dk)", color: "var(--gold)" }}
        >
          J♦
        </div>
      </header>

      <div className="flex-1 px-4 pb-10 flex flex-col gap-6 pt-5">

        {/* ── SECTION 1: ONGOING GAMES ── */}
        <section>
          <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#999" }}>
            الجلسات الجارية
          </div>

          {ongoingSessions.length === 0 ? (
            <div
              className="rounded-2xl p-5 flex items-center gap-3"
              style={{ background: "white", border: "1.5px dashed #DDD" }}
            >
              <div className="text-2xl">🃏</div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#AAA" }}>
                  لا توجد جلسات جارية
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#CCC" }}>
                  ابدأ لعبة جديدة من الأسفل
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {ongoingSessions.map((s) => (
                <Link key={s.id} href={`/session/${s.id}`} className="block">
                  <div
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: "white", border: "1.5px solid #EEE" }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-bold" style={{ color: "var(--jet)" }}>{s.game}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#AAA" }}>
                        {s.players} · {s.round}
                      </div>
                    </div>
                    <div
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: "var(--crimson)", color: "white" }}
                    >
                      استأنف
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 2: NEW GAME ── */}
        <section>
          <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#999" }}>
            لعبة جديدة
          </div>

          <div className="flex flex-col gap-2">
            {/* 2×2 grid for the 4 main games */}
            <div className="grid grid-cols-2 gap-2">
              {games.slice(0, 4).map((game) => (
                <Link key={game.id} href={`/${game.id}/setup`} className="block">
                  <div
                    className="rounded-2xl p-4 flex flex-col gap-3 active:scale-[.98] transition-transform"
                    style={{ background: "white", border: "1.5px solid #EEE", minHeight: 110 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: `${game.color}18` }}
                    >
                      <span style={{ color: game.color }}>{game.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--jet)" }}>{game.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#AAA" }}>{game.players}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* General Scoring — featured full width at bottom */}
            <Link href="/general/setup" className="block">
              <div
                className="rounded-2xl p-5 flex items-center gap-4 active:scale-[.98] transition-transform"
                style={{ background: "var(--sage)" }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: "rgba(0,0,0,.15)" }}
                >
                  ★
                </div>
                <div className="flex-1">
                  <div className="text-xl font-black" style={{ color: "white" }}>تسجيل عام</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,.6)" }}>٢+ لاعبين</div>
                </div>
                <div style={{ color: "rgba(255,255,255,.4)", fontSize: 22 }}>←</div>
              </div>
            </Link>
          </div>
        </section>

        {/* ── SECTION 3: HISTORY ── */}
        <section>
          <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#999" }}>
            السجل
          </div>
          <Link href="/history" className="block">
            <div
              className="rounded-2xl p-4 flex items-center gap-3 active:scale-[.98] transition-transform"
              style={{ background: "white", border: "1.5px solid #EEE" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "rgba(212,164,32,.12)" }}
              >
                🏆
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: "var(--jet)" }}>السجل والترتيب</div>
                <div className="text-xs mt-0.5" style={{ color: "#AAA" }}>الإحصائيات والانتصارات</div>
              </div>
              <div style={{ color: "#CCC", fontSize: 20 }}>←</div>
            </div>
          </Link>
        </section>

      </div>
    </main>
  );
}
