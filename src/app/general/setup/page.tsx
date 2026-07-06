"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GeneralSession, GeneralWinMode, saveSession } from "@/lib/general";

const AVATAR_COLORS = ["#C8102E", "#1B5E38", "#D4A420", "#5B3FA6", "#0077B6", "#E07B39"];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function GeneralSetupPage() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4 | 5 | 6>(4);
  const [winMode, setWinMode] = useState<GeneralWinMode>("highest");
  const [players, setPlayers] = useState<string[]>(["", "", "", "", "", ""]);

  const setPlayer = (i: number, val: string) => {
    const next = [...players];
    next[i] = val;
    setPlayers(next);
  };

  const activePlayers = players.slice(0, playerCount);
  const canStart = activePlayers.every(p => p.trim().length > 0);

  const handleStart = () => {
    const session: GeneralSession = {
      id: generateId(),
      playerCount,
      players: activePlayers.map(p => p.trim()),
      winMode,
      rounds: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };
    saveSession(session);
    router.push(`/general/${session.id}`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F3D24",
      display: "flex",
      flexDirection: "column",
      maxWidth: 390,
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Topbar */}
      <div style={{
        background: "#1B5E38",
        padding: "44px 16px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        direction: "rtl",
      }}>
        <button
          onClick={() => router.push("/app")}
          style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "none", color: "#F8F2E4", fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#F8F2E4", fontSize: 15, fontWeight: 700, textAlign: "right" }}>لعبة جديدة</div>
          <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 10, textAlign: "right" }}>تسجيل عام</div>
        </div>
        <div style={{ fontSize: 20 }}>★</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px", direction: "rtl" }}>

        {/* Player count */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "rgba(248,242,228,0.55)", fontSize: 11, fontWeight: 700, textAlign: "right", marginBottom: 8 }}>
            عدد اللاعبين
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: 4, gap: 4,
          }}>
            {([2, 3, 4, 5, 6] as const).map(n => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                style={{
                  padding: "10px 0", borderRadius: 8, border: "none",
                  background: playerCount === n ? "#1B5E38" : "transparent",
                  color: playerCount === n ? "#F8F2E4" : "rgba(248,242,228,0.45)",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: playerCount === n ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Win mode */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "rgba(248,242,228,0.55)", fontSize: 11, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>
            من يفوز؟
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              onClick={() => setWinMode("highest")}
              style={{
                padding: "14px 8px",
                borderRadius: 14,
                border: `2px solid ${winMode === "highest" ? "#2ECC71" : "rgba(255,255,255,0.1)"}`,
                background: winMode === "highest" ? "rgba(46,204,113,0.08)" : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}
            >
              <div style={{ fontSize: 22, color: winMode === "highest" ? "#2ECC71" : "rgba(248,242,228,0.25)" }}>▲</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: winMode === "highest" ? "#2ECC71" : "rgba(248,242,228,0.35)" }}>
                الأعلى نقطة
              </div>
              <div style={{ fontSize: 10, color: winMode === "highest" ? "rgba(46,204,113,0.5)" : "rgba(248,242,228,0.2)" }}>
                يفوز الأكثر
              </div>
            </button>
            <button
              onClick={() => setWinMode("lowest")}
              style={{
                padding: "14px 8px",
                borderRadius: 14,
                border: `2px solid ${winMode === "lowest" ? "#E74C3C" : "rgba(255,255,255,0.1)"}`,
                background: winMode === "lowest" ? "rgba(231,76,60,0.08)" : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}
            >
              <div style={{ fontSize: 22, color: winMode === "lowest" ? "#E74C3C" : "rgba(248,242,228,0.25)" }}>▼</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: winMode === "lowest" ? "#E74C3C" : "rgba(248,242,228,0.35)" }}>
                الأقل نقطة
              </div>
              <div style={{ fontSize: 10, color: winMode === "lowest" ? "rgba(231,76,60,0.5)" : "rgba(248,242,228,0.2)" }}>
                يفوز الأقل
              </div>
            </button>
          </div>
        </div>

        {/* Players */}
        <div>
          <div style={{ color: "rgba(248,242,228,0.55)", fontSize: 11, fontWeight: 700, textAlign: "right", marginBottom: 10 }}>
            اللاعبون
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {players[i].trim().charAt(0).toUpperCase() || (i + 1)}
                </div>
                <input
                  value={players[i]}
                  onChange={e => setPlayer(i, e.target.value)}
                  placeholder={`اللاعب ${i + 1}`}
                  dir="rtl"
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: "#F8F2E4",
                    fontSize: 14,
                    outline: "none",
                    textAlign: "right",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start button */}
      <div style={{
        padding: "12px 16px 32px",
        position: "sticky", bottom: 0,
        background: "linear-gradient(to top, #0F3D24 70%, transparent)",
      }}>
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            width: "100%", padding: "15px 0",
            background: canStart ? "#1B5E38" : "rgba(27,94,56,0.3)",
            border: "none", borderRadius: 12,
            color: canStart ? "#F8F2E4" : "rgba(248,242,228,0.3)",
            fontSize: 16, fontWeight: 700,
            cursor: canStart ? "pointer" : "not-allowed",
          }}
        >
          ابدأ
        </button>
      </div>
    </div>
  );
}
