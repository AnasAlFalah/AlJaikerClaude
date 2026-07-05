"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrixSession, TrixMode, saveSession } from "@/lib/trix";

const AVATAR_COLORS = ["#C8102E", "#1B5E38", "#D4A420", "#5B3FA6", "#0077B6"];

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

  const bg = "#0F3D24";
  const felt = "#1B5E38";
  const ivory = "#F8F2E4";
  const ivoryDk = "#EDE3D0";
  const jet = "#1A1210";
  const gold = "#D4A420";
  const purple = "#5B3FA6";

  return (
    <div style={{
      minHeight: "100vh", background: bg,
      display: "flex", flexDirection: "column",
      maxWidth: 390, margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Topbar */}
      <div style={{ background: felt, padding: "44px 16px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/")} style={{
          width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
          border: "none", color: ivory, fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: ivory, fontSize: 15, fontWeight: 700, textAlign: "right" }}>تريكس</div>
          <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 10, textAlign: "right" }}>لعبة جديدة</div>
        </div>
        <div style={{ background: purple, borderRadius: 8, padding: "4px 10px", color: "#fff", fontSize: 13, fontWeight: 800 }}>♛</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }}>

        {/* Player count */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "rgba(248,242,228,0.6)", fontSize: 12, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>عدد اللاعبين</div>
          <div style={{ display: "flex", gap: 8 }}>
            {([4, 5] as const).map(n => (
              <button key={n} onClick={() => {
                setPlayerCount(n);
                if (n === 5) setMode("individual");
                setKingOrder([0, 1, 2, 3, 4].slice(0, n));
              }} style={{
                flex: 1, background: playerCount === n ? ivory : "rgba(255,255,255,0.07)",
                border: `2.5px solid ${playerCount === n ? felt : "transparent"}`,
                borderRadius: 10, padding: "12px 0", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: playerCount === n ? felt : "rgba(248,242,228,0.4)" }}>{n}</span>
                <span style={{ fontSize: 9, color: playerCount === n ? "#888" : "rgba(248,242,228,0.25)" }}>لاعبين</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "rgba(248,242,228,0.6)", fontSize: 12, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>طريقة اللعب</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {([
              { val: "individual" as TrixMode, icon: "👤", label: "فردي", desc: "كل لاعب يسجل لحاله" },
              { val: "teams" as TrixMode, icon: "👥", label: "٢ ضد ٢", desc: "فريقان، النقاط تُجمع" },
            ]).map(opt => {
              const disabled = opt.val === "teams" && playerCount === 5;
              const sel = effectiveMode === opt.val;
              return (
                <button key={opt.val} onClick={() => !disabled && setMode(opt.val)} style={{
                  background: sel ? ivory : "rgba(255,255,255,0.06)",
                  border: `2.5px solid ${sel ? felt : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1,
                }}>
                  <span style={{ fontSize: 18 }}>{opt.icon}</span>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: sel ? jet : ivory }}>{opt.label}</div>
                    <div style={{ fontSize: 10, color: sel ? "#AAA" : "rgba(248,242,228,0.35)", marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: sel ? felt : "transparent",
                    border: `2px solid ${sel ? felt : ivoryDk}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11,
                  }}>{sel ? "✓" : ""}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Players */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "rgba(248,242,228,0.6)", fontSize: 12, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>اللاعبون</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} style={{
                background: ivory, borderRadius: 10,
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: AVATAR_COLORS[i],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0,
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
                    fontSize: 15, fontWeight: 600, color: jet,
                    fontFamily: "inherit", outline: "none", textAlign: "right",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Kingdom order */}
        <div style={{ marginBottom: effectiveMode === "teams" ? 20 : 0 }}>
          <div style={{ color: "rgba(248,242,228,0.6)", fontSize: 12, fontWeight: 700, textAlign: "right", marginBottom: 4 }}>ترتيب الممالك 👑</div>
          <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 10, textAlign: "right", marginBottom: 10 }}>من يبدأ أولاً؟ اضغط ↑↓ لتغيير الترتيب</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {kingOrder.slice(0, playerCount).map((pIdx, pos) => {
              const name = players[pIdx]?.trim() || `لاعب ${pIdx + 1}`;
              const rankBg = pos === 0 ? gold : pos === 1 ? "#C0C0C0" : pos === 2 ? "#CD7F32" : "rgba(0,0,0,0.1)";
              return (
                <div key={pos} style={{
                  background: ivory, borderRadius: 10,
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: rankBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, color: pos < 3 ? jet : "#888",
                  }}>{pos + 1}</div>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    background: AVATAR_COLORS[pIdx % AVATAR_COLORS.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 12, fontWeight: 800,
                  }}>
                    {players[pIdx]?.trim().charAt(0).toUpperCase() || (pIdx + 1)}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: jet, textAlign: "right" }}>{name}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <button onClick={() => moveKing(pos, -1)} disabled={pos === 0} style={{
                      width: 26, height: 22, background: pos === 0 ? "transparent" : "rgba(27,94,56,0.12)",
                      border: "none", borderRadius: 5, cursor: pos === 0 ? "default" : "pointer",
                      color: pos === 0 ? "#CCC" : felt, fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>↑</button>
                    <button onClick={() => moveKing(pos, 1)} disabled={pos === playerCount - 1} style={{
                      width: 26, height: 22, background: pos === playerCount - 1 ? "transparent" : "rgba(27,94,56,0.12)",
                      border: "none", borderRadius: 5, cursor: pos === playerCount - 1 ? "default" : "pointer",
                      color: pos === playerCount - 1 ? "#CCC" : felt, fontSize: 12, fontWeight: 700,
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
            <div style={{ color: "rgba(248,242,228,0.6)", fontSize: 12, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>تعيين الفرق</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              <div style={{ background: "rgba(200,16,46,0.08)", border: "2px solid rgba(200,16,46,0.25)", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#C8102E", marginBottom: 8 }}>الفريق الأول</div>
                {teamA.map((pIdx, pos) => (
                  <div key={pos} onClick={() => swapPlayer("A", pos)} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "#fff", borderRadius: 7, padding: "7px 8px", marginBottom: 5, cursor: "pointer",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", background: AVATAR_COLORS[pIdx],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0,
                    }}>{players[pIdx]?.charAt(0).toUpperCase() || (pIdx + 1)}</div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: jet }}>{players[pIdx] || `لاعب ${pIdx + 1}`}</span>
                    <span style={{ fontSize: 13, color: "#CCC" }}>⇄</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(91,63,166,0.08)", border: "2px solid rgba(91,63,166,0.25)", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#5B3FA6", marginBottom: 8 }}>الفريق الثاني</div>
                {teamB.map((pIdx, pos) => (
                  <div key={pos} onClick={() => swapPlayer("B", pos)} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "#fff", borderRadius: 7, padding: "7px 8px", marginBottom: 5, cursor: "pointer",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", background: AVATAR_COLORS[pIdx],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0,
                    }}>{players[pIdx]?.charAt(0).toUpperCase() || (pIdx + 1)}</div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: jet }}>{players[pIdx] || `لاعب ${pIdx + 1}`}</span>
                    <span style={{ fontSize: 13, color: "#CCC" }}>⇄</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", color: "rgba(248,242,228,0.4)", fontSize: 11 }}>اضغط على ⇄ لتبديل اللاعب بين الفريقين</div>
          </div>
        )}
      </div>

      {/* Start */}
      <div style={{ padding: "12px 16px 32px", background: bg }}>
        <button onClick={handleStart} disabled={!canStart} style={{
          width: "100%", padding: "15px 0",
          background: canStart ? felt : "rgba(27,94,56,0.3)",
          border: "none", borderRadius: 12,
          color: canStart ? ivory : "rgba(248,242,228,0.3)",
          fontSize: 16, fontWeight: 700, cursor: canStart ? "pointer" : "not-allowed",
        }}>
          ابدأ اللعبة ▶
        </button>
      </div>
    </div>
  );
}
