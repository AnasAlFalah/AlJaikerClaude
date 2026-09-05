"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandSession, HandRoundCount, saveSession } from "@/lib/hand";

const AVATAR_COLORS = ["#CE1F26", "#1C9245", "#3B8BEB", "#5B3FA6", "#E07B39", "#F5BC22"];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function HandSetupPage() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4 | 5>(4);
  const [roundCount, setRoundCount] = useState<HandRoundCount>(7);
  const [players, setPlayers] = useState<string[]>(["", "", "", "", ""]);

  const setPlayer = (i: number, val: string) => {
    const next = [...players];
    next[i] = val;
    setPlayers(next);
  };

  const activePlayers = players.slice(0, playerCount);
  const canStart = activePlayers.every(p => p.trim().length > 0);

  const handleStart = () => {
    const session: HandSession = {
      id: generateId(),
      playerCount,
      players: activePlayers.map(p => p.trim()),
      roundCount,
      rounds: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };
    saveSession(session);
    router.push(`/hand/${session.id}`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      maxWidth: 390,
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Topbar */}
      <div style={{
        background: "#0F5F2C",
        padding: "44px 16px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        direction: "rtl",
      }}>
        <button
          onClick={() => router.push("/app")}
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "none", color: "#FFFFFF", fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <img src="/images/AlJaiker%20Profile.png" alt="AlJaiker" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
        <div style={{ flex: 1 }}>
          <div style={{ color: "#FFFFFF", fontSize: 17, fontWeight: 800, textAlign: "right" }}>لعبة جديدة</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textAlign: "right" }}>هند</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px", direction: "rtl", background: "#FFFFFF" }}>

        {/* Player count */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#7A736E", fontSize: 13, textAlign: "right", marginBottom: 8, fontWeight: 700 }}>
            عدد اللاعبين
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
            background: "#F2F0EE", borderRadius: 10, padding: 4, gap: 4,
          }}>
            {([2, 3, 4, 5] as const).map(n => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                style={{
                  padding: "10px 0",
                  borderRadius: 8, border: "none",
                  background: playerCount === n ? "#1C9245" : "transparent",
                  color: playerCount === n ? "#FFFFFF" : "#7A736E",
                  fontSize: 15, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: playerCount === n ? "0 2px 8px rgba(28,146,69,0.3)" : "none",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Round count */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#7A736E", fontSize: 13, textAlign: "right", marginBottom: 8, fontWeight: 700 }}>
            عدد الجولات
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "#F2F0EE", borderRadius: 10, padding: 4, gap: 4,
          }}>
            {([7, 9] as HandRoundCount[]).map(n => (
              <button
                key={n}
                onClick={() => setRoundCount(n)}
                style={{
                  padding: "10px 0",
                  borderRadius: 8, border: "none",
                  background: roundCount === n ? "#1C9245" : "transparent",
                  color: roundCount === n ? "#FFFFFF" : "#7A736E",
                  fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: roundCount === n ? "0 2px 8px rgba(28,146,69,0.3)" : "none",
                }}
              >
                {n} جولات
              </button>
            ))}
          </div>
        </div>

        {/* Players */}
        <div>
          <div style={{ color: "#7A736E", fontSize: 13, textAlign: "right", marginBottom: 10, fontWeight: 700 }}>
            اللاعبون
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0,
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
                    background: "#FFFFFF",
                    border: "1.5px solid #E4E0DD",
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: "#14110F",
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
        background: "linear-gradient(to top, #FFFFFF 70%, transparent)",
        borderTop: "1px solid #F2F0EE",
      }}>
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            width: "100%", padding: "15px 0",
            background: canStart ? "#1C9245" : "#E4E0DD",
            border: "none", borderRadius: 28,
            color: canStart ? "#FFFFFF" : "#A59F9A",
            fontSize: 17, fontWeight: 800,
            cursor: canStart ? "pointer" : "not-allowed",
            boxShadow: canStart ? "0 4px 16px rgba(28,146,69,0.3)" : "none",
          }}
        >
          ابدأ اللعبة
        </button>
      </div>
    </div>
  );
}
