"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  HandSession,
  HandRound,
  HandRoundScore,
  HandWinValue,
  WIN_VALUES,
  LOSER_PENALTY,
  getSession,
  saveSession,
  getPlayerTotals,
  getStandings,
  isGameOver,
  getPlayerStats,
} from "@/lib/hand";

const AVATAR_COLORS = ["#C8102E", "#1B5E38", "#D4A420", "#5B3FA6", "#0077B6", "#E07B39"];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Round Entry bottom sheet ──────────────────────────────────────────────────

interface RoundEntryProps {
  session: HandSession;
  onConfirm: (round: Omit<HandRound, "id" | "number">) => void;
  onCancel: () => void;
  initialValues?: { winnerIdx: number; winValue: HandWinValue; scores: HandRoundScore[] };
}

function RoundEntry({ session, onConfirm, onCancel, initialValues }: RoundEntryProps) {
  const [winnerIdx, setWinnerIdx] = useState<number | null>(
    initialValues?.winnerIdx ?? null
  );
  const [winValue, setWinValue] = useState<HandWinValue | null>(
    initialValues?.winValue ?? null
  );
  // per-loser override: index → custom score string
  const [overrides, setOverrides] = useState<Record<number, string>>(() => {
    if (!initialValues) return {};
    const init: Record<number, string> = {};
    for (const s of initialValues.scores) {
      if (s.hasCardsInHand) init[s.playerId] = String(s.score);
    }
    return init;
  });

  const canConfirm = winnerIdx !== null && winValue !== null;

  const toggleOverride = (idx: number) => {
    setOverrides(prev => {
      if (idx in prev) {
        const next = { ...prev };
        delete next[idx];
        return next;
      }
      return { ...prev, [idx]: String(LOSER_PENALTY[winValue!]) };
    });
  };

  const handleConfirm = () => {
    if (winnerIdx === null || winValue === null) return;
    const scores: HandRoundScore[] = session.players.map((_, idx) => {
      if (idx === winnerIdx) {
        return { playerId: idx, score: winValue, isWinner: true, hasCardsInHand: false };
      }
      const hasCardsInHand = idx in overrides;
      const score = hasCardsInHand
        ? (parseInt(overrides[idx], 10) || 0)
        : LOSER_PENALTY[winValue];
      return { playerId: idx, score, isWinner: false, hasCardsInHand };
    });
    onConfirm({ winnerIdx, winValue, scores });
  };

  const winBtnStyle = (val: HandWinValue) => ({
    padding: "14px 4px",
    borderRadius: 12,
    border: `2px solid ${winValue === val ? "#D4A420" : "rgba(255,255,255,0.1)"}`,
    background: winValue === val ? "rgba(212,164,32,0.12)" : "rgba(255,255,255,0.04)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 4,
  });

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
        maxHeight: "90vh",
        overflowY: "auto",
        direction: "rtl",
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 18px" }} />

        <div style={{ color: "#F8F2E4", fontSize: 15, fontWeight: 700, textAlign: "right", marginBottom: 16 }}>
          تسجيل جولة
        </div>

        {/* Who won */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 11, textAlign: "right", marginBottom: 8 }}>من فاز بالجولة؟</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {session.players.map((name, idx) => {
              const selected = winnerIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => { setWinnerIdx(idx); setOverrides({}); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${selected ? "rgba(212,164,32,0.4)" : "rgba(255,255,255,0.08)"}`,
                    background: selected ? "rgba(212,164,32,0.1)" : "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    textAlign: "right",
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, color: selected ? "#D4A420" : "#F8F2E4", fontSize: 14, fontWeight: selected ? 700 : 400 }}>
                    {name}
                  </div>
                  {selected && <div style={{ color: "#D4A420", fontSize: 16 }}>✓</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Win value */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 11, textAlign: "right", marginBottom: 8 }}>قيمة الفوز</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {WIN_VALUES.map(val => (
              <button key={val} onClick={() => setWinValue(val)} style={winBtnStyle(val)}>
                <div style={{
                  fontSize: 22, fontWeight: 900,
                  color: winValue === val ? "#D4A420" : "rgba(248,242,228,0.4)",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {val}
                </div>
                <div style={{ fontSize: 10, color: winValue === val ? "rgba(212,164,32,0.6)" : "rgba(248,242,228,0.2)" }}>
                  الخاسر +{LOSER_PENALTY[val]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Loser overrides — only shown when winner & value are selected */}
        {winnerIdx !== null && winValue !== null && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 11, textAlign: "right", marginBottom: 8 }}>نقاط الخاسرين</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {session.players.map((name, idx) => {
                if (idx === winnerIdx) return null;
                const hasOverride = idx in overrides;
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${hasOverride ? "rgba(255,165,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                      background: hasOverride ? "rgba(255,165,0,0.06)" : "rgba(255,255,255,0.04)",
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0,
                      }}>
                        {name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, color: "#F8F2E4", fontSize: 13, fontWeight: 600 }}>{name}</div>
                      <div style={{
                        color: hasOverride ? "rgba(255,165,0,0.9)" : "#E74C3C",
                        fontSize: 17, fontWeight: 900,
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        +{hasOverride ? (parseInt(overrides[idx], 10) || 0) : LOSER_PENALTY[winValue]}
                      </div>
                      <button
                        onClick={() => toggleOverride(idx)}
                        style={{
                          background: hasOverride ? "rgba(255,165,0,0.15)" : "rgba(255,255,255,0.08)",
                          border: "none",
                          borderRadius: 14,
                          padding: "4px 10px",
                          fontSize: 11,
                          color: hasOverride ? "rgba(255,165,0,0.8)" : "rgba(248,242,228,0.4)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {hasOverride ? "بيده ورق ✓" : "بيده ورق"}
                      </button>
                    </div>
                    {hasOverride && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="number"
                          value={overrides[idx]}
                          onChange={e => setOverrides(prev => ({ ...prev, [idx]: e.target.value }))}
                          placeholder="0"
                          dir="ltr"
                          style={{
                            flex: 1,
                            background: "rgba(0,0,0,0.3)",
                            border: "1px solid rgba(255,165,0,0.3)",
                            borderRadius: 8,
                            padding: "7px 10px",
                            color: "rgba(255,165,0,0.9)",
                            fontSize: 16, fontWeight: 700,
                            textAlign: "center",
                            outline: "none",
                          }}
                        />
                        <div style={{ fontSize: 11, color: "rgba(248,242,228,0.3)", whiteSpace: "nowrap" }}>
                          بدل +{LOSER_PENALTY[winValue]}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
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
            تأكيد الجولة
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
}: {
  session: HandSession;
  onNewRound: () => void;
  onEditRound: (round: HandRound) => void;
}) {
  const totals = getPlayerTotals(session);
  const standings = getStandings(totals);
  const leaderIdx = standings[0]; // lowest score = leading

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

      {/* Player score strip */}
      <div style={{
        background: "rgba(0,0,0,0.2)",
        padding: "14px 10px 10px",
        display: "flex",
        gap: 4,
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

      {/* Progress pill: rounds done / total */}
      <div style={{
        padding: "6px 12px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        direction: "rtl",
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: session.roundCount }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: i < session.rounds.length ? "#D4A420" : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
        <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 11 }}>
          {session.rounds.length} / {session.roundCount}
        </div>
      </div>

      {/* Round history table */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>

        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `28px 1fr ${session.players.map(() => "44px").join(" ")}`,
          padding: "7px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          direction: "rtl",
        }}>
          <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 10, textAlign: "center" }}>#</div>
          <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 10, textAlign: "right" }}>الفائز</div>
          {session.players.map((name, idx) => (
            <div key={idx} style={{ color: "rgba(248,242,228,0.35)", fontSize: 10, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name.charAt(0)}
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
            session.rounds.slice(0, rIdx + 1).reduce((sum, r) => {
              const s = r.scores.find(x => x.playerId === pIdx);
              return sum + (s?.score ?? 0);
            }, 0)
          );
          return (
            <div
              key={round.id}
              style={{
                display: "grid",
                gridTemplateColumns: `28px 1fr ${session.players.map(() => "44px").join(" ")}`,
                padding: "9px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                alignItems: "center",
                direction: "rtl",
              }}
            >
              {/* Round # + edit */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 11 }}>{round.number}</div>
                <button
                  onClick={() => onEditRound(round)}
                  style={{ background: "none", border: "none", color: "rgba(248,242,228,0.2)", fontSize: 10, cursor: "pointer", padding: 0 }}
                >
                  ✎
                </button>
              </div>

              {/* Winner name + win value */}
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#F8F2E4", fontSize: 12, fontWeight: 600 }}>
                  {session.players[round.winnerIdx]}
                </div>
                <div style={{ color: "#2ECC71", fontSize: 10, fontVariantNumeric: "tabular-nums" }}>
                  {round.winValue}
                </div>
              </div>

              {/* Score per player */}
              {session.players.map((_, pIdx) => {
                const s = round.scores.find(x => x.playerId === pIdx);
                const score = s?.score ?? 0;
                const isWinner = s?.isWinner;
                const isOverride = s?.hasCardsInHand;
                return (
                  <div key={pIdx} style={{ textAlign: "center" }}>
                    <div style={{
                      color: isWinner ? "#2ECC71" : isOverride ? "rgba(255,165,0,0.9)" : "#E74C3C",
                      fontSize: 12, fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {isWinner ? score : `+${score}`}
                      {isOverride ? "*" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Legend for * */}
        {session.rounds.some(r => r.scores.some(s => s.hasCardsInHand)) && (
          <div style={{ padding: "6px 12px", fontSize: 10, color: "rgba(248,242,228,0.25)", textAlign: "right", direction: "rtl" }}>
            * بيده ورق — نقاط يدوية
          </div>
        )}
      </div>

      {/* Add round button */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        maxWidth: 390, margin: "0 auto",
        padding: "10px 16px 28px",
        background: "linear-gradient(to top, #0F3D24 70%, transparent)",
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
  session: HandSession;
  onRestart: () => void;
  onHome: () => void;
}) {
  const totals = getPlayerTotals(session);
  const standings = getStandings(totals);
  const stats = getPlayerStats(session);

  const winnerIdx = standings[0];
  const winner = session.players[winnerIdx];
  const winnerScore = totals[winnerIdx];

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
          {winner}
        </div>
        <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 13 }}>
          أقل النقاط · {winnerScore} نقطة
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

      {/* Stats */}
      <div style={{ padding: "16px 16px 0", direction: "rtl" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, textAlign: "right", marginBottom: 10, fontWeight: 700 }}>
          إحصائيات اللاعبين
        </div>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 52px 64px 52px",
            padding: "8px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            {["اللاعب", "فاز بـ", "أعلى فوز", "نقاط"].map((h, i) => (
              <div key={i} style={{
                color: "rgba(248,242,228,0.4)", fontSize: 10, fontWeight: 600,
                textAlign: i === 0 ? "right" : "center",
              }}>{h}</div>
            ))}
          </div>

          {stats.map((s, i) => (
            <div
              key={s.idx}
              style={{
                display: "grid", gridTemplateColumns: "1fr 52px 64px 52px",
                padding: "10px 14px",
                borderBottom: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                <div style={{ color: "#F8F2E4", fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: AVATAR_COLORS[s.idx % AVATAR_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: "#fff",
                }}>
                  {s.name.charAt(0)}
                </div>
              </div>
              <div style={{ color: "#2ECC71", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                {s.wins}
              </div>
              <div style={{ color: "#D4A420", fontSize: 13, fontWeight: 700, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                {s.highestWin ?? "—"}
              </div>
              <div style={{
                color: s.total <= totals[winnerIdx] ? "#D4A420" : "rgba(248,242,228,0.5)",
                fontSize: 13, fontWeight: 900, textAlign: "center", fontVariantNumeric: "tabular-nums",
              }}>
                {s.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
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

export default function HandGamePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<HandSession | null>(null);
  const [showEntry, setShowEntry] = useState(false);
  const [editingRound, setEditingRound] = useState<HandRound | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession(sessionId);
    if (!s) { router.push("/"); return; }
    setSession(s);
    setLoading(false);
  }, [sessionId]);

  const gameOver = session ? isGameOver(session) : false;

  const handleRound = (roundData: Omit<HandRound, "id" | "number">) => {
    if (!session) return;
    let updatedRounds: HandRound[];

    if (editingRound) {
      updatedRounds = session.rounds.map(r =>
        r.id === editingRound.id
          ? { ...roundData, id: r.id, number: r.number }
          : r
      );
    } else {
      const newRound: HandRound = {
        ...roundData,
        id: generateId(),
        number: session.rounds.length + 1,
      };
      updatedRounds = [...session.rounds, newRound];
    }

    const updated: HandSession = {
      ...session,
      rounds: updatedRounds,
      status: updatedRounds.length >= session.roundCount ? "finished" : "active",
    };
    saveSession(updated);
    setSession(updated);
    setShowEntry(false);
    setEditingRound(null);
  };

  const handleRestart = () => {
    if (!session) return;
    const newSession: HandSession = {
      ...session,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      rounds: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };
    saveSession(newSession);
    router.push(`/hand/${newSession.id}`);
  };

  if (loading || !session) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F3D24", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 14 }}>جاري التحميل...</div>
      </div>
    );
  }

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
          onClick={() => router.push("/")}
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
          <div style={{ color: "#F8F2E4", fontSize: 15, fontWeight: 700, textAlign: "right" }}>هند</div>
          <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 10, textAlign: "right" }}>
            {gameOver ? "انتهت اللعبة" : `جولة ${session.rounds.length + 1} من ${session.roundCount}`}
          </div>
        </div>
        <div style={{ fontSize: 20 }}>♣</div>
      </div>

      {gameOver ? (
        <GameOver session={session} onRestart={handleRestart} onHome={() => router.push("/")} />
      ) : (
        <Scoreboard
          session={session}
          onNewRound={() => setShowEntry(true)}
          onEditRound={r => { setEditingRound(r); setShowEntry(true); }}
        />
      )}

      {showEntry && !gameOver && (
        <RoundEntry
          session={session}
          onConfirm={handleRound}
          onCancel={() => { setShowEntry(false); setEditingRound(null); }}
          initialValues={editingRound ? {
            winnerIdx: editingRound.winnerIdx,
            winValue: editingRound.winValue,
            scores: editingRound.scores,
          } : undefined}
        />
      )}
    </div>
  );
}
