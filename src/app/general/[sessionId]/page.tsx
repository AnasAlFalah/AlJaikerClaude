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

const AVATAR_COLORS = ["#C8102E", "#1B5E38", "#D4A420", "#5B3FA6", "#0077B6", "#E07B39"];

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
        background: "#0F3D24",
        borderRadius: "20px 20px 0 0",
        padding: "16px 16px 36px",
        direction: "rtl",
      }}>
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ color: "#F8F2E4", fontSize: 15, fontWeight: 700, textAlign: "right", marginBottom: 16 }}>
          تسجيل جولة {roundNumber}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {session.players.map((name, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {name.charAt(0)}
              </div>
              <div style={{ flex: 1, color: "#F8F2E4", fontSize: 13, fontWeight: 600 }}>{name}</div>
              <input
                type="number"
                value={inputs[i]}
                onChange={e => setInput(i, e.target.value)}
                placeholder="0"
                dir="ltr"
                style={{
                  width: 84,
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${inputs[i].trim() !== "" && !isNaN(Number(inputs[i])) ? "rgba(212,164,32,0.4)" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: 8,
                  padding: "9px 10px",
                  color: inputs[i].trim() !== "" && !isNaN(Number(inputs[i])) ? "#D4A420" : "#F8F2E4",
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
              background: "rgba(255,255,255,0.08)", color: "rgba(248,242,228,0.6)",
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
              background: canConfirm ? "#1B5E38" : "rgba(27,94,56,0.3)",
              color: canConfirm ? "#F8F2E4" : "rgba(248,242,228,0.3)",
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

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

      {/* Score strip */}
      <div style={{
        background: "rgba(0,0,0,0.2)",
        padding: "14px 10px 10px",
        display: "flex", gap: 4,
        direction: "rtl",
      }}>
        {session.players.map((name, idx) => {
          const isLeader = idx === leaderIdx;
          return (
            <div key={idx} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                fontSize: 11, fontWeight: 700, marginBottom: 2,
                color: isLeader ? "#D4A420" : "rgba(248,242,228,0.55)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {name}
              </div>
              <div style={{
                fontSize: session.playerCount > 4 ? 22 : 28,
                fontWeight: 900,
                color: isLeader ? "#fff" : "rgba(248,242,228,0.7)",
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
          fontSize: 10,
          color: session.winMode === "highest" ? "rgba(46,204,113,0.5)" : "rgba(231,76,60,0.5)",
          fontWeight: 600,
        }}>
          {session.winMode === "highest" ? "▲ الأعلى يفوز" : "▼ الأقل يفوز"}
        </span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 120 }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: colTemplate,
          padding: "7px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          direction: "rtl",
        }}>
          <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 10, textAlign: "center" }}>#</div>
          {session.players.map((name, idx) => (
            <div key={idx} style={{
              color: "rgba(248,242,228,0.35)", fontSize: 10, textAlign: "center",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {name.length > 4 ? name.slice(0, 3) + "…" : name}
            </div>
          ))}
        </div>

        {session.rounds.length === 0 && (
          <div style={{ color: "rgba(248,242,228,0.25)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
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
                padding: "9px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                alignItems: "center",
                direction: "rtl",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 11 }}>{round.number}</div>
                <button
                  onClick={() => onEditRound(round)}
                  style={{ background: "none", border: "none", color: "rgba(248,242,228,0.2)", fontSize: 10, cursor: "pointer", padding: 0 }}
                >
                  ✎
                </button>
              </div>
              {round.scores.map((score, pIdx) => (
                <div key={pIdx} style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                    color: pIdx === roundLeader ? "#D4A420" : "#F8F2E4",
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
        background: "linear-gradient(to top, #0F3D24 80%, transparent)",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <button
          onClick={onNewRound}
          style={{
            width: "100%", padding: "14px 0",
            background: "#1B5E38", border: "none", borderRadius: 12,
            color: "#F8F2E4", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}
        >
          + تسجيل جولة
        </button>
        <button
          onClick={onEndGame}
          disabled={session.rounds.length === 0}
          style={{
            width: "100%", padding: "12px 0",
            background: "transparent",
            border: `1px solid ${session.rounds.length > 0 ? "rgba(231,76,60,0.35)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 12,
            color: session.rounds.length > 0 ? "rgba(231,76,60,0.75)" : "rgba(248,242,228,0.2)",
            fontSize: 13, cursor: session.rounds.length > 0 ? "pointer" : "not-allowed",
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
        <div style={{ color: "#D4A420", fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 6 }}>
          الفائز
        </div>
        <div style={{ color: "#F8F2E4", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
          {session.players[winnerIdx]}
        </div>
        <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 13 }}>
          {session.winMode === "highest" ? "أعلى النقاط" : "أقل النقاط"} · {totals[winnerIdx]} نقطة
        </div>
      </div>

      {/* Standings */}
      <div style={{ padding: "16px 16px 0", direction: "rtl" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, textAlign: "right", marginBottom: 10, fontWeight: 700 }}>
          الترتيب النهائي
        </div>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          {standings.map((pIdx, rank) => (
            <div
              key={pIdx}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px",
                borderBottom: rank < standings.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                background: rank === 0 ? "rgba(212,164,32,0.08)" : "transparent",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: rank === 0 ? "#D4A420" : "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: rank === 0 ? "#0F3D24" : "rgba(248,242,228,0.35)",
                fontSize: 12, fontWeight: 900, flexShrink: 0,
              }}>
                {rank + 1}
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: AVATAR_COLORS[pIdx % AVATAR_COLORS.length],
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {session.players[pIdx].charAt(0)}
              </div>
              <div style={{ flex: 1, color: "#F8F2E4", fontSize: 14, fontWeight: 700, textAlign: "right" }}>
                {session.players[pIdx]}
              </div>
              <div style={{
                color: rank === 0 ? "#D4A420" : "rgba(248,242,228,0.5)",
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
            background: "#1B5E38", color: "#F8F2E4", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}
        >
          لعبة جديدة بنفس اللاعبين
        </button>
        <button
          onClick={onHome}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent", color: "rgba(248,242,228,0.7)",
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
      <div style={{ minHeight: "100vh", background: "#0F3D24", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 14 }}>جاري التحميل...</div>
      </div>
    );
  }

  const gameOver = session.status === "finished";

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
        flexShrink: 0,
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
          <div style={{ color: "#F8F2E4", fontSize: 15, fontWeight: 700, textAlign: "right" }}>
            {gameOver ? "انتهت اللعبة" : "تسجيل عام"}
          </div>
          <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 10, textAlign: "right" }}>
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
