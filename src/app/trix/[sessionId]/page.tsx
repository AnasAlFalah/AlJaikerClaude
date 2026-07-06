"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import LiveShareButton from "@/components/LiveShareButton";
import {
  TrixSession, TrixKingdom, TrixRound, TrixResult, TrixDeclType, TrixQueenEntry,
  ALL_DECL, TRIX_SCORES_4, TRIX_SCORES_5, DIAMONDS_PER, EAT_PER, HEARTS_PENALTY, QUEEN_PTS,
  calcTrixScores, calcHeartsScores, calcQueensScores, calcDistScores,
  getPlayerTotals, getKingdomTotals, getTrixScores, getPlayerStatsByDecl,
  getSession, saveSession,
} from "@/lib/trix";

const AVATAR_COLORS = ["#C8102E", "#1B5E38", "#D4A420", "#5B3FA6", "#0077B6"];
const FELT = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY = "#F8F2E4";
const IVORY_DK = "#EDE3D0";
const IVORY_MID = "#E0D4BC";
const JET = "#1A1210";
const CRIMSON = "#C8102E";
const GOLD = "#D4A420";
const PURPLE = "#5B3FA6";
const BLUE = "#0077B6";
const SAGE = "#4A7C5A";

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

const DECL_LABELS: Record<TrixDeclType, string> = {
  trix: "تريكس", hearts: "باش الحاس", queens: "الميمات", diamonds: "الديامن", eat: "اكلات",
};
const DECL_ICONS: Record<TrixDeclType, string> = {
  trix: "🃏", hearts: "♥", queens: "♛", diamonds: "♦", eat: "🍴",
};
const DECL_COLORS: Record<TrixDeclType, string> = {
  trix: PURPLE, hearts: CRIMSON, queens: GOLD, diamonds: BLUE, eat: SAGE,
};

function Av({ idx, size = 28, players }: { idx: number; size?: number; players: string[] }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.42, fontWeight: 800, flexShrink: 0,
    }}>
      {players[idx]?.charAt(0) || (idx + 1)}
    </div>
  );
}

function PlayerSelector({
  players, value, onChange, placeholder = "اختر لاعباً", exclude = [],
}: {
  players: string[]; value: number | null; onChange: (i: number) => void;
  placeholder?: string; exclude?: number[];
}) {
  return (
    <select
      value={value ?? ""}
      onChange={e => onChange(Number(e.target.value))}
      dir="rtl"
      style={{
        width: "100%", appearance: "none",
        background: value !== null ? "rgba(212,164,32,0.08)" : IVORY_DK,
        border: `1px solid ${value !== null ? "rgba(212,164,32,0.4)" : IVORY_MID}`,
        borderRadius: 8, padding: "8px 12px",
        fontSize: 13, fontWeight: 600, color: value !== null ? JET : "#AAA",
        fontFamily: "inherit", cursor: "pointer", outline: "none",
      }}
    >
      <option value="" disabled>{placeholder}</option>
      {players.map((name, i) => (
        !exclude.includes(i) && <option key={i} value={i}>{name}</option>
      ))}
    </select>
  );
}

// ── Round Summary ─────────────────────────────────────────────────────────────
function RoundSummary({ results, players, onContinue }: {
  results: TrixResult[]; players: string[]; onContinue: () => void;
}) {
  const n = players.length;
  const roundTotals = Array(n).fill(0);
  results.forEach(r => r.scores.forEach((s, i) => { roundTotals[i] += s; }));
  const best = Math.min(...roundTotals);

  return (
    <div style={{ background: IVORY, flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "rgba(27,94,56,0.08)", borderRadius: 8, margin: "16px 14px 0", padding: "10px 12px", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: FELT }}>ملخص الجولة</div>
      </div>

      <div style={{ flex: 1, padding: "12px 14px", overflowY: "auto" }}>
        {/* Per-declaration breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {results.map((res, ri) => (
            <div key={ri} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: `1.5px solid ${DECL_COLORS[res.type]}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{DECL_ICONS[res.type]}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: DECL_COLORS[res.type] }}>{DECL_LABELS[res.type]}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {players.map((name, i) => {
                  const s = res.scores[i];
                  if (s === 0) return null;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: s < 0 ? "rgba(27,94,56,0.08)" : "rgba(200,16,46,0.08)",
                      borderRadius: 20, padding: "4px 10px 4px 5px",
                    }}>
                      <Av idx={i} size={20} players={players} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: s < 0 ? FELT : CRIMSON, direction: "ltr" }}>
                        {s > 0 ? `+${s}` : s}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Round totals */}
        <div style={{ background: "#fff", borderRadius: 10, border: `2px solid ${FELT}30`, overflow: "hidden" }}>
          <div style={{ background: "rgba(27,94,56,0.06)", padding: "8px 12px", fontSize: 11, fontWeight: 800, color: FELT }}>مجموع هذه الجولة</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {players.map((name, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderTop: i > 0 ? `1px solid ${IVORY_DK}` : "none" }}>
                <Av idx={i} size={28} players={players} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: JET }}>{name}</span>
                <span style={{
                  fontSize: 20, fontWeight: 900, fontVariantNumeric: "tabular-nums", direction: "ltr",
                  color: roundTotals[i] === best ? FELT : roundTotals[i] < 0 ? FELT : roundTotals[i] > 0 ? CRIMSON : "#888",
                }}>
                  {roundTotals[i] > 0 ? `+${roundTotals[i]}` : roundTotals[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 14px 28px" }}>
        <button onClick={onContinue} style={{
          width: "100%", padding: "14px 0", background: FELT, border: "none", borderRadius: 12,
          color: IVORY, fontSize: 15, fontWeight: 700, cursor: "pointer",
        }}>متابعة ▶</button>
      </div>
    </div>
  );
}

// ── Entry: Trix ───────────────────────────────────────────────────────────────
function TrixEntry({ session, onConfirm, onCancel }: {
  session: TrixSession; onConfirm: (r: TrixResult) => void; onCancel: () => void;
}) {
  const pts = getTrixScores(session.playerCount);
  const [rankings, setRankings] = useState<(number | null)[]>(Array(session.playerCount).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const assigned = rankings.filter(r => r !== null) as number[];
  const canConfirm = rankings.every(r => r !== null);

  const handleSlot = (rank: number) => {
    if (selected === null) return;
    const next = [...rankings];
    const prev = next.findIndex(r => r === selected);
    if (prev !== -1) next[prev] = null;
    if (next[rank] !== null && prev !== -1) next[prev] = next[rank];
    next[rank] = selected;
    setRankings(next);
    setSelected(null);
  };

  const RANK_BG = ["#D4A420", "#C0C0C0", "#CD7F32", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.08)"];

  return (
    <div style={{ background: IVORY, flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "rgba(91,63,166,0.15)", border: "1px solid rgba(91,63,166,0.3)", borderRadius: 8, margin: "16px 14px 0", padding: "10px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: PURPLE, marginBottom: 3 }}>تريكس — ترتيب الحيل</div>
        <div style={{ fontSize: 10, color: "rgba(91,63,166,0.6)" }}>① اضغط اللاعب ② ثم اضغط المركز</div>
      </div>
      <div style={{ display: "flex", gap: 7, padding: "12px 14px", flexWrap: "wrap" }}>
        {session.players.map((name, i) => {
          const isAssigned = assigned.includes(i);
          const isSel = selected === i;
          return (
            <button key={i} onClick={() => !isAssigned && setSelected(isSel ? null : i)} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isSel ? "rgba(212,164,32,0.08)" : IVORY,
              borderRadius: 20, padding: "5px 10px 5px 5px",
              border: `2.5px solid ${isSel ? GOLD : "transparent"}`,
              opacity: isAssigned ? 0.35 : 1,
              cursor: isAssigned ? "default" : "pointer",
            }}>
              <Av idx={i} size={24} players={session.players} />
              <span style={{ fontSize: 12, fontWeight: 700, color: JET }}>{name}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 14px 20px" }}>
        {pts.map((score, rank) => {
          const occupant = rankings[rank];
          const isTarget = selected !== null && occupant === null;
          return (
            <div key={rank} onClick={() => occupant === null ? handleSlot(rank) : setRankings(prev => { const n = [...prev]; n[rank] = null; return n; })} style={{
              background: IVORY, borderRadius: 10, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12,
              border: isTarget ? `1.5px solid ${GOLD}` : `1px solid ${IVORY_MID}`, cursor: "pointer",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: RANK_BG[rank] ?? IVORY_DK,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900, color: rank < 3 ? JET : "#888", flexShrink: 0,
              }}>{rank + 1}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: FELT, fontVariantNumeric: "tabular-nums", flexShrink: 0, direction: "ltr" }}>{score}</div>
              <div style={{ width: 1, height: 28, background: IVORY_MID, flexShrink: 0 }} />
              {occupant !== null ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <Av idx={occupant} size={30} players={session.players} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: JET }}>{session.players[occupant]}</span>
                  <span style={{ marginLeft: "auto", color: "#CCC", fontSize: 14 }}>✕</span>
                </div>
              ) : (
                <div style={{ flex: 1, border: isTarget ? `1.5px dashed ${GOLD}` : "1.5px dashed " + IVORY_MID, borderRadius: 8, padding: "5px 10px" }}>
                  <span style={{ fontSize: 12, color: isTarget ? GOLD : "#CCC", fontWeight: 600 }}>
                    {isTarget ? `اضغط لوضع ${session.players[selected!]}` : "فارغ"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 14px 24px", marginTop: "auto" }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: IVORY_DK, color: "#888", fontSize: 14, cursor: "pointer" }}>إلغاء</button>
        <button onClick={() => {
          if (!canConfirm) return;
          onConfirm({ type: "trix", rankings: rankings as number[], scores: calcTrixScores(rankings as number[], session.playerCount) });
        }} disabled={!canConfirm} style={{
          flex: 2, padding: "13px 0", borderRadius: 12, border: "none",
          background: canConfirm ? FELT : "rgba(27,94,56,0.3)",
          color: canConfirm ? IVORY : "rgba(248,242,228,0.3)",
          fontSize: 15, fontWeight: 700, cursor: canConfirm ? "pointer" : "not-allowed",
        }}>✓ تأكيد تريكس</button>
      </div>
    </div>
  );
}

// ── Entry: Hearts ─────────────────────────────────────────────────────────────
function HeartsEntry({ session, onConfirm, onCancel }: {
  session: TrixSession; onConfirm: (r: TrixResult) => void; onCancel: () => void;
}) {
  const [loserIdx, setLoserIdx] = useState<number | null>(null);
  const [kingDoubled, setKingDoubled] = useState(false);
  const penalty = kingDoubled ? HEARTS_PENALTY * 2 : HEARTS_PENALTY;

  return (
    <div style={{ background: IVORY, flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.25)", borderRadius: 8, margin: "16px 14px 0", padding: "10px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: CRIMSON, marginBottom: 3 }}>باش الحاس</div>
        <div style={{ fontSize: 10, color: "rgba(200,16,46,0.6)" }}>من أخذ الباش؟ — يدفع {penalty} نقطة</div>
      </div>

      <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* King of hearts toggle */}
        <div style={{
          background: kingDoubled ? "rgba(200,16,46,0.06)" : "#fff",
          border: `2px solid ${kingDoubled ? CRIMSON : IVORY_MID}`,
          borderRadius: 10, padding: "12px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: kingDoubled ? CRIMSON : JET }}>ملك الحاس 🫀</div>
            <div style={{ fontSize: 10, color: "#AAA", marginTop: 2 }}>إذا أخذ الباش مع ملك الحاس تضاعف النقاط ({HEARTS_PENALTY * 2})</div>
          </div>
          <div onClick={() => setKingDoubled(d => !d)} style={{
            width: 44, height: 26, background: kingDoubled ? CRIMSON : IVORY_MID,
            borderRadius: 13, position: "relative", cursor: "pointer", flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", width: 20, height: 20, background: "#fff",
              borderRadius: "50%", top: 3, left: kingDoubled ? 21 : 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textAlign: "right" }}>من أخذ الباش؟</div>
        {session.players.map((name, i) => {
          const sel = loserIdx === i;
          return (
            <button key={i} onClick={() => setLoserIdx(sel ? null : i)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              background: sel ? "rgba(200,16,46,0.06)" : IVORY,
              border: `2px solid ${sel ? CRIMSON : IVORY_MID}`,
              borderRadius: 10, cursor: "pointer",
            }}>
              <Av idx={i} size={32} players={session.players} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: sel ? CRIMSON : JET, textAlign: "right" }}>{name}</div>
              {sel && <div style={{ color: CRIMSON, fontSize: 16, fontWeight: 900 }}>+{penalty}</div>}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 14px 24px", marginTop: "auto" }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: IVORY_DK, color: "#888", fontSize: 14, cursor: "pointer" }}>إلغاء</button>
        <button onClick={() => {
          if (loserIdx === null) return;
          onConfirm({ type: "hearts", loserIdx, kingDoubled, scores: calcHeartsScores(loserIdx, session.playerCount, kingDoubled) });
        }} disabled={loserIdx === null} style={{
          flex: 2, padding: "13px 0", borderRadius: 12, border: "none",
          background: loserIdx !== null ? FELT : "rgba(27,94,56,0.3)",
          color: loserIdx !== null ? IVORY : "rgba(248,242,228,0.3)",
          fontSize: 15, fontWeight: 700, cursor: loserIdx !== null ? "pointer" : "not-allowed",
        }}>✓ تأكيد باش الحاس</button>
      </div>
    </div>
  );
}

// ── Entry: Queens ─────────────────────────────────────────────────────────────
const QUEEN_SUITS: { suit: TrixQueenEntry["suit"]; label: string; color: string; symbol: string }[] = [
  { suit: "spades", label: "ميم السبيت", color: "#222", symbol: "♠" },
  { suit: "hearts", label: "ميم الحاس", color: CRIMSON, symbol: "♥" },
  { suit: "diamonds", label: "ميم الديمن", color: BLUE, symbol: "♦" },
  { suit: "clubs", label: "ميم الكلفس", color: "#333", symbol: "♣" },
];

function QueensEntry({ session, onConfirm, onCancel }: {
  session: TrixSession; onConfirm: (r: TrixResult) => void; onCancel: () => void;
}) {
  const [queens, setQueens] = useState<(Partial<TrixQueenEntry> & { suit: TrixQueenEntry["suit"] })[]>(
    QUEEN_SUITS.map(s => ({ suit: s.suit, takerIdx: undefined, announced: false, announcerIdx: null }))
  );

  const updateQueen = (i: number, patch: Partial<TrixQueenEntry>) => {
    setQueens(queens.map((q, qi) => qi === i ? { ...q, ...patch } : q));
  };

  const doneCount = queens.filter(q => q.takerIdx !== undefined).length;
  const canConfirm = doneCount === 4;

  return (
    <div style={{ background: IVORY, flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "rgba(212,164,32,0.12)", border: "1px solid rgba(212,164,32,0.3)", borderRadius: 8, margin: "16px 14px 0", padding: "10px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#B8900A", marginBottom: 3 }}>الميمات — 4 × {QUEEN_PTS} نقطة</div>
        <div style={{ fontSize: 10, color: "rgba(180,140,0,0.6)" }}>من أخذ كل ميم؟ · الإعلان يضاعف — المُعلِن −{QUEEN_PTS}</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {queens.map((q, qi) => {
            const info = QUEEN_SUITS[qi];
            const hasAnn = q.announced;
            const pts = hasAnn ? QUEEN_PTS * 2 : QUEEN_PTS;
            return (
              <div key={qi} style={{
                background: "#fff", borderRadius: 10, padding: 12,
                border: `1.5px solid ${q.takerIdx !== undefined ? "rgba(212,164,32,0.4)" : IVORY_MID}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 48, background: "#fff", border: `1px solid ${IVORY_MID}`, borderRadius: 5, boxShadow: "0 1px 4px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 16, color: info.color }}>{info.symbol}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#888" }}>Q</span>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: JET }}>{info.label}</div>
                    <div style={{ fontSize: 10, color: "#AAA", marginTop: 2 }}>{hasAnn ? `معلنة · ${pts} نقطة` : `${QUEEN_PTS} نقطة`}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <PlayerSelector players={session.players} value={q.takerIdx ?? null} onChange={v => updateQueen(qi, { takerIdx: v })} placeholder="من أخذها؟" />
                  {q.takerIdx !== undefined && (
                    <div style={{ textAlign: "left", marginTop: 4, fontSize: 11, color: CRIMSON, fontWeight: 700, direction: "ltr" }}>
                      {session.players[q.takerIdx]} +{pts}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 11, color: hasAnn ? GOLD : "#AAA", fontWeight: hasAnn ? 700 : 400 }}>{hasAnn ? "★ إعلان" : "إعلان"}</span>
                  <div onClick={() => updateQueen(qi, { announced: !hasAnn, announcerIdx: null })} style={{
                    width: 38, height: 22, background: hasAnn ? GOLD : IVORY_MID,
                    borderRadius: 11, position: "relative", cursor: "pointer", flexShrink: 0,
                  }}>
                    <div style={{ position: "absolute", width: 18, height: 18, background: "#fff", borderRadius: "50%", top: 2, right: hasAnn ? 18 : 2, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
                {hasAnn && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, marginBottom: 4, textAlign: "right" }}>من أعلن؟</div>
                    <PlayerSelector players={session.players} value={q.announcerIdx ?? null} onChange={v => updateQueen(qi, { announcerIdx: v })} placeholder="اختر المُعلِن" />
                    {q.announcerIdx != null && (
                      <div style={{ textAlign: "left", marginTop: 4, fontSize: 11, color: FELT, fontWeight: 700, direction: "ltr" }}>
                        {session.players[q.announcerIdx!]} −{QUEEN_PTS}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 12, borderRadius: 8, padding: "10px 14px",
          background: canConfirm ? "rgba(27,94,56,0.08)" : "rgba(200,16,46,0.08)",
          border: `1.5px solid ${canConfirm ? "rgba(27,94,56,0.3)" : "rgba(200,16,46,0.3)"}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>{canConfirm ? "✅" : "⚠️"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: JET }}>الميمات المُسجَّلة</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: canConfirm ? FELT : CRIMSON, direction: "ltr" }}>{doneCount} من 4</span>
            </div>
            <div style={{ height: 5, background: IVORY_MID, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(doneCount / 4) * 100}%`, background: canConfirm ? FELT : CRIMSON, borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "12px 14px 24px" }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: IVORY_DK, color: "#888", fontSize: 14, cursor: "pointer" }}>إلغاء</button>
        <button onClick={() => {
          if (!canConfirm) return;
          const qs = queens as TrixQueenEntry[];
          onConfirm({ type: "queens", queens: qs, scores: calcQueensScores(qs, session.playerCount) });
        }} disabled={!canConfirm} style={{
          flex: 2, padding: "13px 0", borderRadius: 12, border: "none",
          background: canConfirm ? FELT : "rgba(27,94,56,0.3)",
          color: canConfirm ? IVORY : "rgba(248,242,228,0.3)",
          fontSize: 15, fontWeight: 700, cursor: canConfirm ? "pointer" : "not-allowed",
        }}>✓ تأكيد الميمات</button>
      </div>
    </div>
  );
}

// ── Entry: Distribution (Diamonds / Eat) ──────────────────────────────────────
function DistEntry({ session, declType, onConfirm, onCancel }: {
  session: TrixSession; declType: "diamonds" | "eat";
  onConfirm: (r: TrixResult) => void; onCancel: () => void;
}) {
  const ptsEach = declType === "diamonds" ? DIAMONDS_PER : EAT_PER;
  const label = declType === "diamonds" ? "الديامن" : "اكلات";
  const color = declType === "diamonds" ? BLUE : SAGE;
  const unit = declType === "diamonds" ? "ورقة" : "حيلة";

  const [counts, setCounts] = useState<number[]>(Array(session.playerCount).fill(0));
  const total = counts.reduce((a, b) => a + b, 0);
  const ok = total === 13;

  const setCount = (i: number, val: number) => {
    const next = [...counts];
    next[i] = Math.max(0, Math.min(13, val));
    setCounts(next);
  };

  return (
    <div style={{ background: IVORY, flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 8, margin: "16px 14px 0", padding: "10px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color, marginBottom: 3 }}>{label} — 13 × {ptsEach} نقطة</div>
        <div style={{ fontSize: 10, color: `${color}99` }}>المجموع يجب أن يساوي 13 {unit} · متبقي: {13 - total}</div>
      </div>

      <div style={{ flex: 1, padding: "12px 14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {session.players.map((name, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: `1px solid ${IVORY_MID}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Av idx={i} size={30} players={session.players} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: JET }}>{name}</span>
                <span style={{ fontSize: 18, fontWeight: 900, fontVariantNumeric: "tabular-nums", color, direction: "ltr", minWidth: 28, textAlign: "center" }}>{counts[i]}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: CRIMSON, direction: "ltr", minWidth: 40, textAlign: "right" }}>+{counts[i] * ptsEach}</span>
              </div>
              {/* Slider */}
              <input
                type="range"
                min={0}
                max={13}
                step={1}
                value={counts[i]}
                onChange={e => setCount(i, Number(e.target.value))}
                style={{ width: "100%", accentColor: color, cursor: "pointer", height: 4 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 9, color: "#CCC" }}>13</span>
                <span style={{ fontSize: 9, color: "#CCC" }}>0</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 12, borderRadius: 8, padding: "10px 14px",
          background: ok ? "rgba(27,94,56,0.08)" : total > 13 ? "rgba(200,16,46,0.08)" : "rgba(212,164,32,0.08)",
          border: `1.5px solid ${ok ? "rgba(27,94,56,0.3)" : total > 13 ? "rgba(200,16,46,0.3)" : "rgba(212,164,32,0.3)"}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>{ok ? "✅" : total > 13 ? "❌" : "⚠️"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: JET }}>{ok ? "مكتمل" : total > 13 ? "تجاوز الحد!" : "غير مكتمل"}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: ok ? FELT : total > 13 ? CRIMSON : "#B8900A", direction: "ltr" }}>{total} من 13</span>
            </div>
            <div style={{ height: 5, background: IVORY_MID, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((total / 13) * 100, 100)}%`, background: ok ? FELT : total > 13 ? CRIMSON : GOLD, borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 14px 24px" }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: IVORY_DK, color: "#888", fontSize: 14, cursor: "pointer" }}>إلغاء</button>
        <button onClick={() => {
          if (!ok) return;
          onConfirm({ type: declType, counts: [...counts], scores: calcDistScores(counts, ptsEach) });
        }} disabled={!ok} style={{
          flex: 2, padding: "13px 0", borderRadius: 12, border: "none",
          background: ok ? FELT : "rgba(27,94,56,0.3)",
          color: ok ? IVORY : "rgba(248,242,228,0.3)",
          fontSize: 15, fontWeight: 700, cursor: ok ? "pointer" : "not-allowed",
        }}>✓ تأكيد {label}</button>
      </div>
    </div>
  );
}

// ── Declaration Picker ────────────────────────────────────────────────────────
function DeclarationPicker({ session, kingdom, onConfirm, onCancel }: {
  session: TrixSession; kingdom: TrixKingdom;
  onConfirm: (selected: TrixDeclType[]) => void; onCancel: () => void;
}) {
  const [selected, setSelected] = useState<TrixDeclType[]>([]);

  const toggle = (d: TrixDeclType) => {
    if (kingdom.done.includes(d)) return;
    if (d === "trix") { setSelected(selected.includes("trix") ? [] : ["trix"]); return; }
    const withoutTrix = selected.filter(s => s !== "trix");
    if (withoutTrix.includes(d)) setSelected(withoutTrix.filter(s => s !== d));
    else setSelected([...withoutTrix, d]);
  };

  const canConfirm = selected.length > 0;

  const DECL_INFO = [
    { type: "trix" as TrixDeclType, pts: "−200/−150/−100/−50", color: PURPLE },
    { type: "hearts" as TrixDeclType, pts: `${HEARTS_PENALTY} نقطة`, color: CRIMSON },
    { type: "queens" as TrixDeclType, pts: "4 × 25 نقطة", color: GOLD },
    { type: "diamonds" as TrixDeclType, pts: "13 × 10 نقاط", color: BLUE },
    { type: "eat" as TrixDeclType, pts: "13 × 15 نقطة", color: SAGE },
  ];

  return (
    <div style={{ background: IVORY, flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "rgba(91,63,166,0.12)", border: "1px solid rgba(91,63,166,0.3)", borderRadius: 8, margin: "16px 14px 0", padding: "10px 12px", fontSize: 11, color: "rgba(91,63,166,0.7)", lineHeight: 1.6 }}>
        🃏 <strong>تريكس</strong> يُلعب منفرداً · الباقي يمكن تجميعه في جولة واحدة
      </div>
      <div style={{ flex: 1, padding: "12px 14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DECL_INFO.map(({ type, pts, color }) => {
            const done = kingdom.done.includes(type);
            const sel = selected.includes(type);
            const isTrixConflict = type !== "trix" && selected.includes("trix");
            const isOtherConflict = type === "trix" && selected.some(s => s !== "trix");
            const disabled = done || isTrixConflict || isOtherConflict;
            return (
              <button key={type} onClick={() => toggle(type)} style={{
                background: done ? "#fff" : sel ? `${color}10` : "#fff",
                border: `2.5px solid ${done ? IVORY_MID : sel ? color : IVORY_MID}`,
                borderRadius: 10, padding: 14,
                display: "flex", alignItems: "center", gap: 12,
                cursor: disabled ? "default" : "pointer",
                opacity: (disabled && !done) ? 0.4 : done ? 0.5 : 1,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{DECL_ICONS[type]}</span>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: done ? "#AAA" : sel ? color : JET }}>{DECL_LABELS[type]}</div>
                  <div style={{ fontSize: 10, color: "#AAA", marginTop: 2 }}>{done ? "تم لعبه ✓" : pts}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  background: sel ? color : "transparent",
                  border: `2px solid ${sel ? color : IVORY_MID}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12,
                }}>{sel ? "✓" : ""}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "12px 14px 24px" }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: IVORY_DK, color: "#888", fontSize: 14, cursor: "pointer" }}>إلغاء</button>
        <button onClick={() => canConfirm && onConfirm(selected)} disabled={!canConfirm} style={{
          flex: 2, padding: "13px 0", borderRadius: 12, border: "none",
          background: canConfirm ? FELT : "rgba(27,94,56,0.3)",
          color: canConfirm ? IVORY : "rgba(248,242,228,0.3)",
          fontSize: 15, fontWeight: 700, cursor: canConfirm ? "pointer" : "not-allowed",
        }}>▶ ابدأ الجولة {selected.length > 0 ? `— ${selected.map(d => DECL_LABELS[d]).join(" + ")}` : ""}</button>
      </div>
    </div>
  );
}

// ── Kingdom Board ─────────────────────────────────────────────────────────────
function KingdomBoard({ session, onStartRound, onViewScores }: {
  session: TrixSession; onStartRound: () => void; onViewScores: () => void;
}) {
  const totals = getPlayerTotals(session);
  const best = Math.min(...totals);
  const ck = session.kingdoms[session.currentKingdomIdx];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px 10px 10px", display: "flex", gap: 4, overflowX: "auto", direction: "rtl" }}>
        {session.players.map((name, i) => (
          <div key={i} style={{ flexShrink: 0, minWidth: 64, textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 6px" }}>
            <div style={{ fontSize: 10, color: "rgba(248,242,228,0.55)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: totals[i] === best ? "#F2D060" : totals[i] > 0 ? "#FF8080" : IVORY }}>{totals[i]}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#256B45", padding: "8px 14px", display: "flex", gap: 6, alignItems: "center", direction: "rtl" }}>
        <span style={{ fontSize: 10, color: "rgba(248,242,228,0.45)", flexShrink: 0 }}>ممالك</span>
        <div style={{ display: "flex", gap: 5 }}>
          {session.kingdoms.map((k, ki) => {
            const isDone = ki < session.currentKingdomIdx;
            const isCurrent = ki === session.currentKingdomIdx;
            return (
              <div key={ki} style={{
                width: 22, height: 22, borderRadius: "50%",
                background: AVATAR_COLORS[k.kingIdx % AVATAR_COLORS.length],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800, color: "#fff",
                opacity: isDone ? 1 : isCurrent ? 1 : 0.35,
                boxShadow: isCurrent ? `0 0 0 2.5px ${GOLD}` : "none",
              }}>{session.players[k.kingIdx]?.charAt(0)}</div>
            );
          })}
        </div>
        <span style={{ fontSize: 10, color: "rgba(248,242,228,0.4)", marginRight: "auto" }}>
          مملكة {session.currentKingdomIdx + 1} من {session.playerCount}
        </span>
        <button onClick={onViewScores} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 6, padding: "3px 10px", color: "rgba(248,242,228,0.7)", fontSize: 10, cursor: "pointer" }}>
          النقاط ↗
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 100px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, fontWeight: 700, marginBottom: 10, textAlign: "right" }}>جميع الممالك</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {session.kingdoms.map((k, ki) => {
            const isDone = ki < session.currentKingdomIdx;
            const isCurrent = ki === session.currentKingdomIdx;
            const kTotals = getKingdomTotals(k, session.playerCount);
            const kingScore = kTotals[k.kingIdx];
            return (
              <div key={ki} style={{
                background: isCurrent ? "rgba(212,164,32,0.06)" : IVORY, borderRadius: 10, padding: "12px 10px",
                border: `2.5px solid ${isCurrent ? GOLD : "transparent"}`,
                opacity: isDone ? 0.55 : isCurrent ? 1 : 0.45,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <Av idx={k.kingIdx} size={26} players={session.players} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: JET, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.players[k.kingIdx]}</span>
                  <span style={{ fontSize: 13 }}>{isDone ? "✓" : isCurrent ? "👑" : ""}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 9, color: "#AAA" }}>نقاط</span>
                  <span style={{ fontSize: 17, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: isDone || isCurrent ? (kingScore < 0 ? FELT : CRIMSON) : "#888" }}>
                    {isCurrent || isDone ? kingScore : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {ALL_DECL.map(d => (
                    <div key={d} style={{
                      width: 16, height: 16, borderRadius: 3, fontSize: 8, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: DECL_COLORS[d], color: "#fff",
                      opacity: k.done.includes(d) ? 1 : 0.2,
                    }}>
                      {d === "trix" ? "ت" : d === "hearts" ? "♥" : d === "queens" ? "م" : d === "diamonds" ? "♦" : "آ"}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, fontWeight: 700, marginBottom: 10, textAlign: "right" }}>
          مملكة {session.players[ck.kingIdx]} — الجارية
        </div>
        <div style={{ background: IVORY, borderRadius: 14, padding: 14, border: `2px solid ${GOLD}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Av idx={ck.kingIdx} size={38} players={session.players} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: JET }}>{session.players[ck.kingIdx]} 👑</div>
              <div style={{ fontSize: 10, color: "#AAA", marginTop: 1 }}>{5 - ck.done.length} إعلانات متبقية</div>
            </div>
            <div style={{ background: GOLD, borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: JET }}>المملكة {session.currentKingdomIdx + 1}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ALL_DECL.map(d => {
              const done = ck.done.includes(d);
              return (
                <div key={d} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8,
                  background: IVORY_DK, opacity: done ? 0.5 : 1,
                }}>
                  <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{DECL_ICONS[d]}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: JET }}>{DECL_LABELS[d]}</span>
                  <span style={{ fontSize: 11, color: "#AAA" }}>
                    {d === "trix" ? "−200/−150/−100/−50" : d === "hearts" ? `${HEARTS_PENALTY} نقطة` : d === "queens" ? "25 × 4" : d === "diamonds" ? "10 × 13" : "15 × 13"}
                  </span>
                  <span style={{ fontSize: 14, color: done ? FELT : "#CCC" }}>{done ? "✓" : "○"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 390, margin: "0 auto", padding: "10px 14px 28px", background: "linear-gradient(to top, #0F3D24 70%, transparent)" }}>
        <button onClick={onStartRound} style={{ width: "100%", padding: "14px 0", background: CRIMSON, border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          ▶ إعلان الجولة التالية
        </button>
      </div>
    </div>
  );
}

// ── Score Table ───────────────────────────────────────────────────────────────
function ScoreTable({ session, onBack }: { session: TrixSession; onBack: () => void }) {
  const totals = getPlayerTotals(session);
  const best = Math.min(...totals);
  const worst = Math.max(...totals);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: IVORY }}>
      <div style={{ background: FELT, padding: "12px 14px 10px" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {session.players.map((name, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 10px", textAlign: "center", flexShrink: 0, minWidth: 72 }}>
              <div style={{ fontSize: 10, color: "rgba(248,242,228,0.55)", marginBottom: 2, whiteSpace: "nowrap" }}>{name}</div>
              <div style={{ fontSize: 20, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: totals[i] === best ? "#F2D060" : totals[i] === worst ? "#FF8080" : IVORY }}>{totals[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowX: "auto", paddingBottom: 80 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 340 }}>
          <thead>
            <tr style={{ background: IVORY_DK }}>
              <th style={{ padding: "7px 8px", fontSize: 9, fontWeight: 700, color: "#999", textAlign: "right", width: 80 }}>الإعلان</th>
              {session.players.map((name, i) => (
                <th key={i} style={{ padding: "7px 5px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <Av idx={i} size={20} players={session.players} />
                    <span style={{ fontSize: 9, color: "#999" }}>{name.length > 4 ? name.slice(0, 3) + "…" : name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {session.kingdoms.map((k, ki) => {
              if (k.rounds.length === 0 && ki >= session.currentKingdomIdx) return null;
              const isCurrent = ki === session.currentKingdomIdx;
              const kt = getKingdomTotals(k, session.playerCount);
              return (
                <>
                  <tr key={`sep-${ki}`} style={{ background: FELT }}>
                    <td colSpan={session.playerCount + 1} style={{ padding: "8px 8px", fontSize: 10, fontWeight: 800, color: "rgba(248,242,228,0.9)", borderTop: "3px solid " + FELT_DK, borderBottom: "3px solid " + FELT_DK }}>
                      مملكة {session.players[k.kingIdx]} 👑{isCurrent ? " — جارية" : ""}
                    </td>
                  </tr>
                  {k.rounds.flatMap(r =>
                    r.results.map((res, ri) => (
                      <tr key={`${ki}-${r.id}-${ri}`} style={{ borderTop: `1px solid ${IVORY_DK}` }}>
                        <td style={{ padding: "7px 8px", textAlign: "right" }}>
                          <span style={{ display: "inline-block", borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 700, background: `${DECL_COLORS[res.type]}22`, color: DECL_COLORS[res.type] }}>{DECL_LABELS[res.type]}</span>
                        </td>
                        {res.scores.map((score, si) => (
                          <td key={si} style={{ padding: "7px 5px", textAlign: "center", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                            <span style={{ fontWeight: score !== 0 ? 700 : 400, color: score < 0 ? FELT : score > 0 ? CRIMSON : "#CCC" }}>
                              {score === 0 ? "0" : score > 0 ? `+${score}` : score}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                  {k.rounds.length > 0 && (
                    <tr key={`sub-${ki}`} style={{ background: "rgba(27,94,56,0.06)" }}>
                      <td style={{ padding: "7px 8px", fontSize: 9, color: FELT, fontWeight: 800, textAlign: "right" }}>مجموع</td>
                      {kt.map((t, ti) => (
                        <td key={ti} style={{ padding: "7px 5px", textAlign: "center", fontWeight: 900, fontVariantNumeric: "tabular-nums", fontSize: 12, color: t < 0 ? FELT : t > 0 ? CRIMSON : "#CCC" }}>
                          {t === 0 ? "0" : t > 0 ? `+${t}` : t}
                        </td>
                      ))}
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ background: IVORY_DK, fontSize: 9, color: "#AAA", padding: "10px 8px", textAlign: "right" }}>المجموع</td>
              {totals.map((t, i) => (
                <td key={i} style={{ background: IVORY_DK, fontSize: 15, fontWeight: 900, fontVariantNumeric: "tabular-nums", borderTop: `2.5px solid ${IVORY_MID}`, padding: "10px 5px", textAlign: "center", color: t === best ? FELT : t === worst ? CRIMSON : JET }}>{t}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 390, margin: "0 auto", padding: "10px 14px 28px", background: "linear-gradient(to top, #F8F2E4 70%, transparent)" }}>
        <button onClick={onBack} style={{ width: "100%", padding: "14px 0", background: FELT, border: "none", borderRadius: 12, color: IVORY, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          ← العودة للممالك
        </button>
      </div>
    </div>
  );
}

// ── Game Over ─────────────────────────────────────────────────────────────────
function GameOver({ session, onRestart, onHome }: { session: TrixSession; onRestart: () => void; onHome: () => void }) {
  const totals = getPlayerTotals(session);
  const byDecl = getPlayerStatsByDecl(session);
  const sorted = session.players
    .map((name, i) => ({ name, i, total: totals[i] }))
    .sort((a, b) => a.total - b.total);
  const winner = sorted[0];

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40, background: IVORY }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(155deg, ${FELT}, #0A2816)`, padding: "28px 20px 20px", textAlign: "center" }}>
        <span style={{ fontSize: 52, display: "block", marginBottom: 10 }}>🏆</span>
        <div style={{ fontSize: 12, color: "rgba(248,242,228,0.45)", letterSpacing: 1, marginBottom: 5 }}>الفائز — الأقل نقاطاً</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#F2D060" }}>{winner.name}</div>
        <div style={{ fontSize: 13, color: "rgba(248,242,228,0.5)", marginTop: 4 }}>{winner.total} نقطة · {session.playerCount} ممالك</div>
      </div>

      {/* Standings */}
      <div style={{ background: "#fff" }}>
        {sorted.map(({ name, i, total }, rank) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: rank < sorted.length - 1 ? `1px solid ${IVORY_DK}` : "none" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: ["#D4A420","#C0C0C0","#CD7F32"][rank] ?? IVORY_DK, width: 28, textAlign: "center", flexShrink: 0 }}>{rank + 1}</div>
            <Av idx={i} size={40} players={session.players} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: JET }}>{name}</div>
              {rank === 0 && <div style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>أقل نقاط · الفائز</div>}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: total < 0 ? FELT : total > 0 ? CRIMSON : JET, direction: "ltr" }}>{total}</div>
          </div>
        ))}
      </div>

      {/* Statistics per declaration */}
      <div style={{ background: IVORY_DK, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 10, textAlign: "right" }}>إحصائيات تفصيلية</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 300 }}>
            <thead>
              <tr style={{ background: IVORY }}>
                <th style={{ padding: "6px 8px", fontSize: 9, fontWeight: 700, color: "#AAA", textAlign: "right" }}>الإعلان</th>
                {session.players.map((name, i) => (
                  <th key={i} style={{ padding: "6px 4px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <Av idx={i} size={18} players={session.players} />
                      <span style={{ fontSize: 8, color: "#AAA" }}>{name.length > 4 ? name.slice(0, 3) + "…" : name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_DECL.map(d => (
                <tr key={d} style={{ borderTop: `1px solid ${IVORY_MID}` }}>
                  <td style={{ padding: "7px 8px", textAlign: "right" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: DECL_COLORS[d] }}>
                      <span>{DECL_ICONS[d]}</span>{DECL_LABELS[d]}
                    </span>
                  </td>
                  {session.players.map((_, i) => {
                    const s = byDecl[d][i];
                    return (
                      <td key={i} style={{ padding: "7px 4px", textAlign: "center", fontSize: 11, fontWeight: s !== 0 ? 800 : 400, fontVariantNumeric: "tabular-nums", color: s < 0 ? FELT : s > 0 ? CRIMSON : "#CCC" }}>
                        {s === 0 ? "—" : s > 0 ? `+${s}` : s}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: IVORY, borderTop: `2px solid ${IVORY_MID}` }}>
                <td style={{ padding: "8px 8px", fontSize: 10, fontWeight: 800, color: JET, textAlign: "right" }}>الإجمالي</td>
                {totals.map((t, i) => (
                  <td key={i} style={{ padding: "8px 4px", textAlign: "center", fontSize: 13, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: t < 0 ? FELT : t > 0 ? CRIMSON : JET }}>{t}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 16px 20px", background: "#fff" }}>
        <button onClick={onRestart} style={{ width: "100%", padding: 16, background: CRIMSON, border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          ↺ نفس اللاعبين — لعبة جديدة
        </button>
        <button onClick={onHome} style={{ width: "100%", padding: 13, background: IVORY_DK, border: "none", borderRadius: 14, color: JET, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          → العودة للرئيسية
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type ViewState =
  | { type: "kingdoms" }
  | { type: "picker" }
  | { type: "entry"; current: TrixDeclType; queue: TrixDeclType[]; accumulated: TrixResult[] }
  | { type: "summary"; results: TrixResult[] }
  | { type: "scores" }
  | { type: "gameover" };

export default function TrixGamePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<TrixSession | null>(null);
  const [view, setView] = useState<ViewState>({ type: "kingdoms" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession(sessionId);
    if (!s) { router.push("/app"); return; }
    setSession(s);
    setLoading(false);
    if (s.status === "finished") setView({ type: "gameover" });
  }, [sessionId]);

  const handlePickerConfirm = (selected: TrixDeclType[]) => {
    const [first, ...rest] = selected;
    setView({ type: "entry", current: first, queue: rest, accumulated: [] });
  };

  const handleEntryConfirm = (result: TrixResult) => {
    if (view.type !== "entry" || !session) return;
    const newAccumulated = [...view.accumulated, result];

    if (view.queue.length > 0) {
      setView({ type: "entry", current: view.queue[0], queue: view.queue.slice(1), accumulated: newAccumulated });
    } else {
      const round: TrixRound = { id: genId(), results: newAccumulated };
      const newDone = [...session.kingdoms[session.currentKingdomIdx].done, ...newAccumulated.map(r => r.type)];
      const allDeclarationsDone = ALL_DECL.every(d => newDone.includes(d));

      const updatedKingdoms = session.kingdoms.map((k, ki) => {
        if (ki !== session.currentKingdomIdx) return k;
        return { ...k, rounds: [...k.rounds, round], done: newDone };
      });

      let newKingdomIdx = session.currentKingdomIdx;
      let newStatus: TrixSession["status"] = "active";
      if (allDeclarationsDone) {
        newKingdomIdx = session.currentKingdomIdx + 1;
        if (newKingdomIdx >= session.playerCount) newStatus = "finished";
      }

      const updated: TrixSession = { ...session, kingdoms: updatedKingdoms, currentKingdomIdx: newKingdomIdx, status: newStatus };
      saveSession(updated);
      setSession(updated);
      // Show summary before going back
      setView({ type: "summary", results: newAccumulated });
    }
  };

  const handleSummaryContinue = () => {
    if (!session) return;
    const s = getSession(sessionId);
    if (s?.status === "finished") setView({ type: "gameover" });
    else setView({ type: "kingdoms" });
  };

  const handleCancel = () => setView({ type: "kingdoms" });

  const handleRestart = () => {
    if (!session) return;
    const kingdoms = Array.from({ length: session.playerCount }, (_, i) => ({
      kingIdx: session.kingdoms[i]?.kingIdx ?? i, rounds: [], done: [] as TrixDeclType[],
    }));
    const newSession: TrixSession = {
      ...session,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      kingdoms, currentKingdomIdx: 0, status: "active",
      createdAt: new Date().toISOString(),
    };
    saveSession(newSession);
    router.push(`/trix/${newSession.id}`);
  };

  if (loading || !session) {
    return (
      <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 14 }}>جاري التحميل...</div>
      </div>
    );
  }

  const ck = session.kingdoms[Math.min(session.currentKingdomIdx, session.playerCount - 1)];
  const isIvoryBg = view.type !== "kingdoms";

  const topTitle = view.type === "kingdoms" ? "تريكس"
    : view.type === "picker" ? "اختر الإعلان"
    : view.type === "entry" ? `نتيجة ${DECL_LABELS[view.current]}`
    : view.type === "summary" ? "ملخص الجولة"
    : view.type === "scores" ? "النقاط التفصيلية"
    : "انتهت اللعبة";

  const topSub = view.type === "kingdoms" || view.type === "picker" || view.type === "entry"
    ? `مملكة ${session.players[ck.kingIdx]} · ${session.currentKingdomIdx + 1} من ${session.playerCount}`
    : view.type === "gameover" ? `${session.playerCount} ممالك` : "";

  const backAction = view.type === "kingdoms" || view.type === "gameover"
    ? () => router.push("/app")
    : view.type === "summary"
    ? handleSummaryContinue
    : handleCancel;

  const getTrixData = useCallback(() => getSession(sessionId), [sessionId]);

  return (
    <div style={{
      minHeight: "100vh",
      background: isIvoryBg ? IVORY : FELT_DK,
      display: "flex", flexDirection: "column",
      maxWidth: 390, margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Topbar */}
      <div style={{ background: FELT, padding: "44px 16px 14px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, direction: "rtl" }}>
        <button onClick={backAction} style={{
          width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
          border: "none", color: IVORY, fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: IVORY, fontSize: 15, fontWeight: 700, textAlign: "right" }}>{topTitle}</div>
          {topSub && <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 10, textAlign: "right" }}>{topSub}</div>}
        </div>
        <div style={{ background: PURPLE, borderRadius: 8, padding: "4px 10px", color: "#fff", fontSize: 12, fontWeight: 800 }}>♛</div>
      </div>

      {view.type === "kingdoms" && <KingdomBoard session={session} onStartRound={() => setView({ type: "picker" })} onViewScores={() => setView({ type: "scores" })} />}
      {view.type === "picker" && <DeclarationPicker session={session} kingdom={ck} onConfirm={handlePickerConfirm} onCancel={handleCancel} />}
      {view.type === "entry" && view.current === "trix" && <TrixEntry session={session} onConfirm={handleEntryConfirm} onCancel={handleCancel} />}
      {view.type === "entry" && view.current === "hearts" && <HeartsEntry session={session} onConfirm={handleEntryConfirm} onCancel={handleCancel} />}
      {view.type === "entry" && view.current === "queens" && <QueensEntry session={session} onConfirm={handleEntryConfirm} onCancel={handleCancel} />}
      {view.type === "entry" && (view.current === "diamonds" || view.current === "eat") && (
        <DistEntry key={view.current} session={session} declType={view.current} onConfirm={handleEntryConfirm} onCancel={handleCancel} />
      )}
      {view.type === "summary" && <RoundSummary results={view.results} players={session.players} onContinue={handleSummaryContinue} />}
      {view.type === "scores" && <ScoreTable session={session} onBack={() => setView({ type: "kingdoms" })} />}
      {view.type === "gameover" && <GameOver session={session} onRestart={handleRestart} onHome={() => router.push("/app")} />}
      {session.status === "active" && (
        <LiveShareButton sessionId={sessionId} game="trix" getData={getTrixData} />
      )}
    </div>
  );
}
