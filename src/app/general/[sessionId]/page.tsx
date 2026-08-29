"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  GeneralSession,
  GeneralRound,
  getSession,
  saveSession,
  getPlayerTotals,
  getStandings,
} from "@/lib/general";

const AVATAR_COLORS = ["#CE1F26", "#1C9245", "#F5BC22", "#5B3FA6", "#0077B6", "#E07B39"];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Round Entry bottom sheet ──────────────────────────────────────────────────

function RoundEntry({
  session,
  roundNumber,
  onConfirm,
  onCancel,
  initialScores,
}: {
  session: GeneralSession;
  roundNumber: number;
  onConfirm: (scores: number[]) => void;
  onCancel: () => void;
  initialScores?: number[];
}) {
  const [inputs, setInputs] = useState<string[]>(
    session.players.map((_, i) => initialScores ? String(initialScores[i]) : "")
  );

  const setInput = (i: number, val: string) => {
    const next = [...inputs];
    next[i] = val;
    setInputs(next);
  };

  const canConfirm = inputs.every(v => v.trim() !== "" && !isNaN(Number(v)));

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(inputs.map(v => Number(v)));
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        width: "100%", maxWidth: 390, margin: "0 auto",
        background: "#FFFFFF",
        borderRadius: "20px 20px 0 0",
        padding: "16px 16px 36px",
        direction: "rtl",
      }}>
        <div style={{ width: 40, height: 4, background: "#E4E0DD", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ color: "#14110F", fontSize: 15, fontWeight: 700, textAlign: "right", marginBottom: 16 }}>
          تسجيل جولة {roundNumber}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {session.players.map((name, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {name.charAt(0)}
              </div>
              <div style={{ flex: 1, color: "#14110F", fontSize: 15, fontWeight: 600 }}>{name}</div>
              <input
                type="number"
                value={inputs[i]}
                onChange={e => setInput(i, e.target.value)}
                placeholder="0"
                dir="ltr"
                style={{
                  width: 84,
                  background: "#FFFFFF",
                  border: `1px solid ${inputs[i].trim() !== "" && !isNaN(Number(inputs[i])) ? "#F5BC22" : "#E4E0DD"}`,
                  borderRadius: 8,
                  padding: "9px 10px",
                  color: inputs[i].trim() !== "" && !isNaN(Number(inputs[i])) ? "#F5BC22" : "#14110F",
                  fontSize: 16, fontWeight: 700,
                  textAlign: "center",
                  outline: "none",
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "13px 0", borderRadius: 12, border: "none",
              background: "#F2F0EE", color: "#3A3330",
              fontSize: 14, cursor: "pointer",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              flex: 2, padding: "13px 0", borderRadius: 12, border: "none",
              background: canConfirm ? "#1C9245" : "#E4E0DD",
              color: canConfirm ? "#FFFFFF" : "#9E9B99",
              fontSize: 15, fontWeight: 700, cursor: canConfirm ? "pointer" : "not-allowed",
            }}
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Scoreboard ────────────────────────────────────────────────────────────────

function Scoreboard({
  session,
  onNewRound,
  onEditRound,
  onEndGame,
}: {
  session: GeneralSession;
  onNewRound: () => void;
  onEditRound: (round: GeneralRound) => void;
  onEndGame: () => void;
}) {
  const totals = getPlayerTotals(session);
  const standings = getStandings(totals, session.winMode);
  const leaderIdx = standings[0];

  // columns: round# + one per player
  const colTemplate = `28px ${session.players.map(() => "1fr").join(" ")}`;

  // alternating column backgrounds for player columns (1-indexed: odd=#F1FAF4, even=#FEF6E0)
  const colBg = (playerIdx: number) => playerIdx % 2 === 0 ? "#F1FAF4" : "#FEF6E0";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

      {/* Score strip */}
      <div style={{
        background: "#F1FAF4",
        borderBottom: "1px solid #E2F4E8",
        padding: "14px 10px 10px",
        display: "flex", gap: 8,
        direction: "rtl",
      }}>
        {session.players.map((name, idx) => {
          const isLeader = idx === leaderIdx;
          return (
            <div key={idx} style={{
              flex: 1, textAlign: "center",
              background: isLeader ? "#FFFBF0" : "#FFFFFF",
              border: `1.5px solid ${isLeader ? "#F5BC22" : "#E4E0DD"}`,
              borderRadius: 14,
              padding: "8px 4px 10px",
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700, marginBottom: 4,
                color: "#3A3330",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {name}
              </div>
              <div style={{
                fontSize: 44,
                fontWeight: 900,
                color: "#14110F",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}>
                {totals[idx]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Win mode label */}
      <div style={{ padding: "5px 12px", textAlign: "center", direction: "rtl" }}>
        <span style={{
          fontSize: 13,
          color: session.winMode === "highest" ? "#1C9245" : "#CE1F26",
          fontWeight: 600,
        }}>
          {session.winMode === "highest" ? "▲ الأعلى يفوز" : "▼ الأقل يفوز"}
        </span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 120, background: "#FFFFFF" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: colTemplate,
          padding: "7px 10px",
          borderBottom: "1px solid #E4E0DD",
          direction: "rtl",
        }}>
          <div style={{ color: "#9E9B99", fontSize: 13, textAlign: "center" }}>#</div>
          {session.players.map((name, idx) => (
            <div key={idx} style={{
              color: "#9E9B99", fontSize: 13, textAlign: "center",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              background: colBg(idx),
              padding: "4px 0",
            }}>
              {name.length > 4 ? name.slice(0, 3) + "…" : name}
            </div>
          ))}
        </div>

        {session.rounds.length === 0 && (
          <div style={{ color: "#9E9B99", fontSize: 15, textAlign: "center", padding: "40px 0" }}>
            لم تُسجَّل أي جولة بعد
          </div>
        )}

        {session.rounds.map((round, rIdx) => {
          // running totals up to this round
          const runningTotals = session.players.map((_, pIdx) =>
            session.rounds.slice(0, rIdx + 1).reduce((sum, r) => sum + r.scores[pIdx], 0)
          );
          const roundLeader = getStandings(runningTotals, session.winMode)[0];

          return (
            <div
              key={round.id}
              style={{
                display: "grid", gridTemplateColumns: colTemplate,
                borderBottom: "1px solid #F0EDEB",
                alignItems: "center",
                direction: "rtl",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "9px 0" }}>
                <div style={{ color: "#9E9B99", fontSize: 13 }}>{round.number}</div>
                <button
                  onClick={() => onEditRound(round)}
                  style={{ background: "none", border: "none", color: "#C4C0BD", fontSize: 13, cursor: "pointer", padding: 0 }}
                >
                  ✎
                </button>
              </div>
              {round.scores.map((score, pIdx) => (
                <div key={pIdx} style={{
                  textAlign: "center",
                  background: colBg(pIdx),
                  padding: "9px 0",
                  alignSelf: "stretch",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                    color: "#14110F",
                  }}>
                    {score > 0 ? `+${score}` : score}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        maxWidth: 390, margin: "0 auto",
        padding: "10px 16px 28px",
        background: "linear-gradient(to top, rgba(255,255,255,1) 80%, rgba(255,255,255,0))",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <button
          onClick={onNewRound}
          style={{
            width: "100%", padding: "14px 0",
            background: "#1C9245", border: "none", borderRadius: 28,
            color: "#FFFFFF", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}
        >
          + تسجيل جولة
        </button>
        <button
          onClick={onEndGame}
          disabled={session.rounds.length === 0}
          style={{
            width: "100%", padding: "12px 0",
            background: "#CE1F26",
            border: "none",
            borderRadius: 28,
            color: "#FFFFFF",
            fontSize: 15, fontWeight: 700,
            cursor: session.rounds.length > 0 ? "pointer" : "not-allowed",
            opacity: session.rounds.length === 0 ? 0.4 : 1,
          }}
        >
          إنهاء اللعبة
        </button>
      </div>
    </div>
  );
}

// ── Game Over ─────────────────────────────────────────────────────────────────

function GameOver({
  session,
  onRestart,
  onHome,
}: {
  session: GeneralSession;
  onRestart: () => void;
  onHome: () => void;
}) {
  const totals = getPlayerTotals(session);
  const standings = getStandings(totals, session.winMode);
  const winnerIdx = standings[0];

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>

      {/* Winner hero */}
      <div style={{
        background: "linear-gradient(160deg, #1B5E38 0%, #0A2E1A 100%)",
        padding: "30px 20px 24px",
        textAlign: "center",
        borderBottom: "1px solid rgba(212,164,32,0.3)",
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
        <div style={{ color: "#F5BC22", fontSize: 13, fontWeight: 700, letterSpacing: 3, marginBottom: 6 }}>
          الفائز
        </div>
        <div style={{ color: "#FFFFFF", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
          {session.players[winnerIdx]}
        </div>
        <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 15 }}>
          {session.winMode === "highest" ? "أعلى النقاط" : "أقل النقاط"} · {totals[winnerIdx]} نقطة
        </div>
      </div>

      {/* Standings */}
      <div style={{ padding: "16px 16px 0", direction: "rtl" }}>
        <div style={{ color: "#7A736E", fontSize: 13, textAlign: "right", marginBottom: 10, fontWeight: 700 }}>
          الترتيب النهائي
        </div>
        <div style={{
          background: "#F2F0EE",
          borderRadius: 12,
          border: "1px solid #E4E0DD",
          overflow: "hidden",
        }}>
          {standings.map((pIdx, rank) => (
            <div
              key={pIdx}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px",
                borderBottom: rank < standings.length - 1 ? "1px solid #E4E0DD" : "none",
                background: rank === 0 ? "rgba(212,164,32,0.08)" : "transparent",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: rank === 0 ? "#F5BC22" : "#E4E0DD",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: rank === 0 ? "#0F5F2C" : "#7A736E",
                fontSize: 14, fontWeight: 900, flexShrink: 0,
              }}>
                {rank + 1}
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: AVATAR_COLORS[pIdx % AVATAR_COLORS.length],
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {session.players[pIdx].charAt(0)}
              </div>
              <div style={{ flex: 1, color: "#14110F", fontSize: 14, fontWeight: 700, textAlign: "right" }}>
                {session.players[pIdx]}
              </div>
              <div style={{
                color: rank === 0 ? "#F5BC22" : "#7A736E",
                fontSize: 18, fontWeight: 900, fontVariantNumeric: "tabular-nums",
              }}>
                {totals[pIdx]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 8, direction: "rtl" }}>
        <button
          onClick={onRestart}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: "#1C9245", color: "#FFFFFF", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}
        >
          لعبة جديدة بنفس اللاعبين
        </button>
        <button
          onClick={onHome}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 12,
            border: "1px solid #E4E0DD",
            background: "#F2F0EE", color: "#3A3330",
            fontSize: 14, cursor: "pointer",
          }}
        >
          الرئيسية
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GeneralGamePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<GeneralSession | null>(null);
  const [showEntry, setShowEntry] = useState(false);
  const [editingRound, setEditingRound] = useState<GeneralRound | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession(sessionId);
    if (!s) { router.push("/app"); return; }
    setSession(s);
    setLoading(false);
  }, [sessionId]);

  const handleRound = (scores: number[]) => {
    if (!session) return;
    let updatedRounds: GeneralRound[];

    if (editingRound) {
      updatedRounds = session.rounds.map(r =>
        r.id === editingRound.id ? { ...r, scores } : r
      );
    } else {
      const newRound: GeneralRound = {
        id: generateId(),
        number: session.rounds.length + 1,
        scores,
      };
      updatedRounds = [...session.rounds, newRound];
    }

    const updated: GeneralSession = { ...session, rounds: updatedRounds };
    saveSession(updated);
    setSession(updated);
    setShowEntry(false);
    setEditingRound(null);
  };

  const handleEndGame = () => {
    if (!session) return;
    const updated: GeneralSession = { ...session, status: "finished" };
    saveSession(updated);
    setSession(updated);
  };

  const handleRestart = () => {
    if (!session) return;
    const newSession: GeneralSession = {
      ...session,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      rounds: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };
    saveSession(newSession);
    router.push(`/general/${newSession.id}`);
  };

  if (loading || !session) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F5F2C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 14 }}>جاري التحميل...</div>
      </div>
    );
  }

  const gameOver = session.status === "finished";

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
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push("/app")}
          style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "none", color: "#FFFFFF", fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 700, textAlign: "right" }}>
            {gameOver ? "انتهت اللعبة" : "تسجيل عام"}
          </div>
          <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 13, textAlign: "right" }}>
            {gameOver
              ? `${session.rounds.length} جولات`
              : `جولة ${session.rounds.length + 1} · ${session.winMode === "highest" ? "الأعلى يفوز" : "الأقل يفوز"}`}
          </div>
        </div>
        <div style={{ fontSize: 20 }}>★</div>
      </div>

      {gameOver ? (
        <GameOver session={session} onRestart={handleRestart} onHome={() => router.push("/app")} />
      ) : (
        <Scoreboard
          session={session}
          onNewRound={() => setShowEntry(true)}
          onEditRound={r => { setEditingRound(r); setShowEntry(true); }}
          onEndGame={handleEndGame}
        />
      )}

      {showEntry && !gameOver && (
        <RoundEntry
          session={session}
          roundNumber={editingRound ? editingRound.number : session.rounds.length + 1}
          onConfirm={handleRound}
          onCancel={() => { setShowEntry(false); setEditingRound(null); }}
          initialScores={editingRound?.scores}
        />
      )}
    </div>
  );
}
