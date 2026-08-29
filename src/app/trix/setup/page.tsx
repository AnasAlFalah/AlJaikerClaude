"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrixSession, TrixMode, saveSession } from "@/lib/trix";

const AVATAR_COLORS = ["#CE1F26", "#1C9245", "#F5BC22", "#5B3FA6", "#0077B6"];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function TrixSetupPage() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState<4 | 5>(4);
  const [mode, setMode] = useState<TrixMode>("individual");
  const [players, setPlayers] = useState(["", "", "", "", ""]);
  const [teamA, setTeamA] = useState([0, 2]);
  const [teamB, setTeamB] = useState([1, 3]);
  const [kingOrder, setKingOrder] = useState([0, 1, 2, 3, 4]);

  const setPlayer = (i: number, v: string) => {
    const next = [...players]; next[i] = v; setPlayers(next);
  };

  const swapPlayer = (fromTeam: "A" | "B", pos: number) => {
    const a = [...teamA], b = [...teamB];
    if (fromTeam === "A") { [a[pos], b[pos]] = [b[pos], a[pos]]; }
    else { [b[pos], a[pos]] = [a[pos], b[pos]]; }
    setTeamA(a); setTeamB(b);
  };

  const moveKing = (pos: number, dir: -1 | 1) => {
    const next = [...kingOrder];
    const target = pos + dir;
    if (target < 0 || target >= playerCount) return;
    [next[pos], next[target]] = [next[target], next[pos]];
    setKingOrder(next);
  };

  const activePlayers = players.slice(0, playerCount);
  const canStart = activePlayers.every(p => p.trim().length > 0);
  const effectiveMode = playerCount === 5 ? "individual" : mode;

  const handleStart = () => {
    const order = kingOrder.slice(0, playerCount);
    const kingdoms = order.map(kingIdx => ({
      kingIdx,
      rounds: [],
      done: [] as import("@/lib/trix").TrixDeclType[],
    }));

    const session: TrixSession = {
      id: generateId(),
      playerCount,
      players: activePlayers.map(p => p.trim()),
      mode: effectiveMode,
      teamA: effectiveMode === "teams" ? teamA : [],
      teamB: effectiveMode === "teams" ? teamB : [],
      kingdoms,
      currentKingdomIdx: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    saveSession(session);
    router.push(`/trix/${session.id}`);
  };

  const felt = "#0F5F2C";
  const ivory = "#FFFFFF";
  const ivoryDk = "#F2F0EE";
  const jet = "#14110F";
  const gold = "#F5BC22";
  const purple = "#5B3FA6";

  return (
    <div style={{
      minHeight: "100vh", background: "#FFFFFF",
      display: "flex", flexDirection: "column",
      maxWidth: 390, margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Topbar */}
      <div style={{ background: "#0F5F2C", padding: "44px 16px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/app")} style={{
          width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
          border: "none", color: "#FFFFFF", fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>←</button>
        <img src="/images/AlJaiker.png" alt="AlJaiker" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
        <div style={{ flex: 1 }}>
          <div style={{ color: "#FFFFFF", fontSize: 17, fontWeight: 800, textAlign: "right" }}>تريكس</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textAlign: "right" }}>لعبة جديدة</div>
        </div>
        <div style={{ background: purple, borderRadius: 8, padding: "4px 10px", color: "#fff", fontSize: 15, fontWeight: 800 }}>♛</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: "#FFFFFF", padding: "16px 16px 100px" }}>

        {/* Player count */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#7A736E", fontSize: 14, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>عدد اللاعبين</div>
          <div style={{ display: "flex", gap: 8 }}>
            {([4, 5] as const).map(n => (
              <button key={n} onClick={() => {
                setPlayerCount(n);
                if (n === 5) setMode("individual");
                setKingOrder([0, 1, 2, 3, 4].slice(0, n));
              }} style={{
                flex: 1, background: playerCount === n ? ivory : "#F2F0EE",
                border: `2.5px solid ${playerCount === n ? felt : "transparent"}`,
                borderRadius: 10, padding: "12px 0", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: playerCount === n ? felt : "#A59F9A" }}>{n}</span>
                <span style={{ fontSize: 9, color: playerCount === n ? "#888" : "#A59F9A" }}>لاعبين</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#7A736E", fontSize: 14, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>طريقة اللعب</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {([
              { val: "individual" as TrixMode, icon: "👤", label: "فردي", desc: "كل لاعب يسجل لحاله" },
              { val: "teams" as TrixMode, icon: "👥", label: "٢ ضد ٢", desc: "فريقان، النقاط تُجمع" },
            ]).map(opt => {
              const disabled = opt.val === "teams" && playerCount === 5;
              const sel = effectiveMode === opt.val;
              return (
                <button key={opt.val} onClick={() => !disabled && setMode(opt.val)} style={{
                  background: sel ? ivory : "#F2F0EE",
                  border: `2.5px solid ${sel ? felt : "transparent"}`,
                  borderRadius: 10, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1,
                }}>
                  <span style={{ fontSize: 18 }}>{opt.icon}</span>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: sel ? jet : "#3A3330" }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: "#7A736E", marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: sel ? felt : "transparent",
                    border: `2px solid ${sel ? felt : "#E4E0DD"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 13,
                  }}>{sel ? "✓" : ""}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Players */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#7A736E", fontSize: 14, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>اللاعبون</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} style={{
                background: "#FFFFFF", border: "1.5px solid #E4E0DD", borderRadius: 10,
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: AVATAR_COLORS[i],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 15, fontWeight: 800, flexShrink: 0,
                }}>
                  {players[i].trim().charAt(0).toUpperCase() || (i + 1)}
                </div>
                <input
                  value={players[i]}
                  onChange={e => setPlayer(i, e.target.value)}
                  placeholder={`اللاعب ${i + 1}`}
                  dir="rtl"
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    fontSize: 15, fontWeight: 600, color: "#14110F",
                    fontFamily: "inherit", outline: "none", textAlign: "right",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Kingdom order */}
        <div style={{ marginBottom: effectiveMode === "teams" ? 20 : 0 }}>
          <div style={{ color: "#7A736E", fontSize: 14, fontWeight: 700, textAlign: "right", marginBottom: 4 }}>ترتيب الممالك 👑</div>
          <div style={{ color: "#A59F9A", fontSize: 13, textAlign: "right", marginBottom: 10 }}>من يبدأ أولاً؟ اضغط ↑↓ لتغيير الترتيب</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {kingOrder.slice(0, playerCount).map((pIdx, pos) => {
              const name = players[pIdx]?.trim() || `لاعب ${pIdx + 1}`;
              const rankBg = pos === 0 ? gold : pos === 1 ? "#C0C0C0" : pos === 2 ? "#CD7F32" : "#F2F0EE";
              return (
                <div key={pos} style={{
                  background: ivory, border: "1.5px solid #E4E0DD", borderRadius: 10,
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: rankBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 900, color: pos < 3 ? jet : "#888",
                  }}>{pos + 1}</div>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    background: AVATAR_COLORS[pIdx % AVATAR_COLORS.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 14, fontWeight: 800,
                  }}>
                    {players[pIdx]?.trim().charAt(0).toUpperCase() || (pIdx + 1)}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: jet, textAlign: "right" }}>{name}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <button onClick={() => moveKing(pos, -1)} disabled={pos === 0} style={{
                      width: 26, height: 22, background: pos === 0 ? "transparent" : "rgba(27,94,56,0.12)",
                      border: "none", borderRadius: 5, cursor: pos === 0 ? "default" : "pointer",
                      color: pos === 0 ? "#CCC" : felt, fontSize: 14, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>↑</button>
                    <button onClick={() => moveKing(pos, 1)} disabled={pos === playerCount - 1} style={{
                      width: 26, height: 22, background: pos === playerCount - 1 ? "transparent" : "rgba(27,94,56,0.12)",
                      border: "none", borderRadius: 5, cursor: pos === playerCount - 1 ? "default" : "pointer",
                      color: pos === playerCount - 1 ? "#CCC" : felt, fontSize: 14, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>↓</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team assignment */}
        {effectiveMode === "teams" && (
          <div>
            <div style={{ color: "#7A736E", fontSize: 14, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>تعيين الفرق</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              <div style={{ background: "rgba(200,16,46,0.06)", border: "1.5px solid #FADADD", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#CE1F26", marginBottom: 8 }}>الفريق الأول</div>
                {teamA.map((pIdx, pos) => (
                  <div key={pos} onClick={() => swapPlayer("A", pos)} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "#fff", border: "1px solid #E4E0DD", borderRadius: 7, padding: "7px 8px", marginBottom: 5, cursor: "pointer",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", background: AVATAR_COLORS[pIdx],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
                    }}>{players[pIdx]?.charAt(0).toUpperCase() || (pIdx + 1)}</div>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: jet }}>{players[pIdx] || `لاعب ${pIdx + 1}`}</span>
                    <span style={{ fontSize: 15, color: "#CCC" }}>⇄</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(91,63,166,0.06)", border: "1.5px solid #D6EAF8", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#5B3FA6", marginBottom: 8 }}>الفريق الثاني</div>
                {teamB.map((pIdx, pos) => (
                  <div key={pos} onClick={() => swapPlayer("B", pos)} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "#fff", border: "1px solid #E4E0DD", borderRadius: 7, padding: "7px 8px", marginBottom: 5, cursor: "pointer",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", background: AVATAR_COLORS[pIdx],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
                    }}>{players[pIdx]?.charAt(0).toUpperCase() || (pIdx + 1)}</div>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: jet }}>{players[pIdx] || `لاعب ${pIdx + 1}`}</span>
                    <span style={{ fontSize: 15, color: "#CCC" }}>⇄</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", color: "#A59F9A", fontSize: 13 }}>اضغط على ⇄ لتبديل اللاعب بين الفريقين</div>
          </div>
        )}

        {/* Open-ended game notice */}
        <div style={{ marginTop: 20, background: "#F1FAF4", border: "1px solid #E2F4E8", borderRadius: 10, padding: "10px 14px", textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "#1C9245", fontWeight: 700, marginBottom: 2 }}>اللعبة مفتوحة النهاية</div>
          <div style={{ fontSize: 12, color: "#7A736E" }}>تنتهي اللعبة فقط عند الضغط على زر &quot;إنهاء اللعبة&quot;</div>
        </div>
      </div>

      {/* Start */}
      <div style={{
        padding: "12px 16px 32px",
        background: "linear-gradient(to top, #FFFFFF 70%, transparent)",
        borderTop: "1px solid #F2F0EE",
      }}>
        <button onClick={handleStart} disabled={!canStart} style={{
          width: "100%", padding: "15px 0",
          background: canStart ? "#1C9245" : "#E4E0DD",
          border: "none", borderRadius: 28,
          color: canStart ? "#FFFFFF" : "#A59F9A",
          fontSize: 17, fontWeight: 800, cursor: canStart ? "pointer" : "not-allowed",
          boxShadow: canStart ? "0 4px 16px rgba(28,146,69,0.3)" : "none",
        }}>
          ابدأ اللعبة ▶
        </button>
      </div>
    </div>
  );
}
