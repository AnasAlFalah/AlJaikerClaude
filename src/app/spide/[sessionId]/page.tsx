"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  SpideSession, SpideRound, SpideRoundEntry,
  getSession, saveSession, getPlayerTotals, getLeaderIndex,
  isGameOver, getPassDirection, passDirectionLabel,
  calcRoundScores, calcEatAllScores,
} from "@/lib/spide";

// ─── Types ────────────────────────────────────────────────────────────────────
type View = "scoreboard" | "roundEntry" | "gameOver";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SpideGamePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SpideSession | null>(null);
  const [view, setView] = useState<View>("scoreboard");
  const [editingRound, setEditingRound] = useState<SpideRound | null>(null);

  useEffect(() => {
    const s = getSession(sessionId);
    if (!s) { router.push("/app"); return; }
    setSession(s);
    if (s.status === "finished") setView("gameOver");
  }, [sessionId, router]);

  const updateSession = useCallback((updated: SpideSession) => {
    saveSession(updated);
    setSession(updated);
  }, []);

  if (!session) return null;

  const totals = getPlayerTotals(session);
  const leaderIdx = getLeaderIndex(totals);
  const nextRoundNum = session.rounds.length + 1;
  const nextPassDir = getPassDirection(nextRoundNum);

  function handleRoundSubmit(round: SpideRound) {
    let updatedRounds: SpideRound[];
    if (editingRound) {
      updatedRounds = session!.rounds.map(r =>
        r.id === editingRound.id
          ? { ...round, id: r.id, number: r.number, passDirection: r.passDirection }
          : r
      );
    } else {
      updatedRounds = [...session!.rounds, round];
    }
    const newTotals = getPlayerTotals({ ...session!, rounds: updatedRounds });
    const totalsToCheck = session!.mode === "teams" && session!.teams
      ? session!.teams.map((_, t) =>
          newTotals.filter((_, i) => i % session!.teams!.length === t).reduce((a, b) => a + b, 0)
        )
      : newTotals;
    const over = isGameOver(totalsToCheck, session!.target);
    const updated: SpideSession = {
      ...session!,
      rounds: updatedRounds,
      status: over ? "finished" : "active",
    };
    updateSession(updated);
    setEditingRound(null);
    setView(over ? "gameOver" : "scoreboard");
  }

  if (view === "gameOver") {
    return <GameOver session={session} totals={totals} onRestart={() => router.push(`/spide/setup`)} onHome={() => router.push("/app")} />;
  }

  if (view === "roundEntry") {
    const editRoundNum = editingRound ? editingRound.number : nextRoundNum;
    const editPassDir = editingRound ? editingRound.passDirection : nextPassDir;
    return (
      <RoundEntry
        session={session}
        roundNumber={editRoundNum}
        passDirection={editPassDir}
        totals={totals}
        initialValues={editingRound ? {
          roundType: editingRound.type,
          eatAllWinner: editingRound.eatAllWinner ?? null,
          entries: editingRound.entries,
        } : undefined}
        onSubmit={handleRoundSubmit}
        onBack={() => { setView("scoreboard"); setEditingRound(null); }}
      />
    );
  }

  return (
    <Scoreboard
      session={session}
      totals={totals}
      leaderIdx={leaderIdx}
      nextPassDir={nextPassDir}
      onAddRound={() => setView("roundEntry")}
      onEditRound={(round) => { setEditingRound(round); setView("roundEntry"); }}
      onBack={() => router.push("/app")}
    />
  );
}

// ─── Scoreboard ───────────────────────────────────────────────────────────────
function Scoreboard({ session, totals, leaderIdx, nextPassDir, onAddRound, onEditRound, onBack }: {
  session: SpideSession;
  totals: number[];
  leaderIdx: number;
  nextPassDir: ReturnType<typeof getPassDirection>;
  onAddRound: () => void;
  onEditRound: (round: SpideRound) => void;
  onBack: () => void;
}) {
  const s = styles;
  const roundNum = session.rounds.length + 1;

  // Pass dot state: position in the 3-step cycle
  const cyclePos = ((roundNum - 1) % 3); // 0=right, 1=left, 2=none

  return (
    <main style={s.page}>
      {/* Topbar */}
      <div style={s.topbar}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={s.topTitle}>سبيد</div>
          <div style={s.topSub}>جولة {roundNum} من {session.target}</div>
        </div>
        <div style={s.topBadge}>♥</div>
      </div>

      {/* Score header */}
      <div style={s.scoreHeader}>
        {/* Pass indicator */}
        <div style={s.passIndicator}>
          <div>
            <div style={s.passLabel}>تمرير الجولة القادمة</div>
            <div style={s.passValue}>{passDirectionLabel(nextPassDir)}</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: i === cyclePos
                  ? "#D4A420"
                  : i < cyclePos
                    ? "rgba(212,164,32,0.5)"
                    : "rgba(212,164,32,0.25)",
              }} />
            ))}
          </div>
        </div>

        {/* Player scores — individual or team */}
        {session.mode === "teams" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 12 }}>
            {(session.teams ?? []).map((team, teamIdx) => {
              const n = session.teams!.length;
              const teamTotal = totals.filter((_, i) => i % n === teamIdx).reduce((a, b) => a + b, 0);
              const allTeamTotals = session.teams!.map((_, t) => totals.filter((_, i) => i % n === t).reduce((a, b) => a + b, 0));
              const minTotal = Math.min(...allTeamTotals);
              const isLead = teamTotal === minTotal;
              const COLORS = ["#3DEB7A", "#E74C3C", "#3B8BEB"];
              return (
                <div key={teamIdx} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 4px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 2, color: isLead ? COLORS[teamIdx] : "rgba(248,242,228,0.4)" }}>{team.name}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: isLead ? "#fff" : "rgba(248,242,228,0.7)" }}>{teamTotal}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 12 }}>
            {session.players.map((p, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, marginBottom: 2,
                  color: i === leaderIdx ? "#D4A420" : "rgba(248,242,228,0.6)",
                }}>{p.name}</div>
                <div style={{
                  fontSize: 28, fontWeight: 900, lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  color: i === leaderIdx ? "#fff" : "rgba(248,242,228,0.7)",
                }}>{totals[i]}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bars */}
        <div style={{ height: 4, display: "flex", background: "rgba(255,255,255,0.06)" }}>
          {session.players.map((p, i) => (
            <div key={i} style={{
              height: "100%",
              width: `${Math.min((totals[i] / session.target) * 100, 100)}%`,
              background: p.avatarColor,
              transition: "width 0.4s",
            }} />
          ))}
        </div>
      </div>

      {/* Round history — oldest first */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `22px 28px 1fr ${session.players.map(() => "44px").join(" ")} 28px`,
          padding: "8px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={s.th}>#</div>
          <div style={s.th}>↔</div>
          <div style={{ ...s.th, textAlign: "right" }}>تفاصيل</div>
          {session.players.map((p, i) => (
            <div key={i} style={s.th}>{p.name}</div>
          ))}
          <div style={s.th} />
        </div>

        {session.rounds.map((round, ri) => (
          <div key={round.id} style={{
            display: "grid",
            gridTemplateColumns: `22px 28px 1fr ${session.players.map(() => "44px").join(" ")} 28px`,
            padding: "9px 10px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            alignItems: "center",
          }}>
            <div style={s.tdNum}>{round.number}</div>
            <div style={{ ...s.td, fontSize: 14, color: passArrowColor(round.passDirection) }}>
              {passArrow(round.passDirection)}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(248,242,228,0.5)" }}>
                {round.type === "eatAll"
                  ? `أكل الكل — ${session.players[round.eatAllWinner!]?.name}`
                  : "جولة عادية"}
              </div>
              {round.type === "normal" && (
                <div style={{ fontSize: 10, color: "rgba(248,242,228,0.3)" }}>
                  {roundSummaryLine(round, session)}
                </div>
              )}
            </div>
            {round.scores.map((score, i) => (
              <div key={i} style={{
                ...s.td,
                color: score < 0 ? "#2ECC71" : score === 0 ? "rgba(248,242,228,0.4)" : "#F8F2E4",
              }}>
                {score > 0 ? `+${score}` : score}
              </div>
            ))}
            <button
              onClick={() => onEditRound(round)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(248,242,228,0.25)", fontSize: 13, padding: 2,
                fontFamily: "inherit",
              }}
            >✎</button>
          </div>
        ))}

        {session.rounds.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "rgba(248,242,228,0.3)", fontSize: 13 }}>
            لا توجد جولات بعد
          </div>
        )}
      </div>

      <div style={s.stickyBtn}>
        <button style={s.btnPrimary} onClick={onAddRound}>+ تسجيل جولة</button>
      </div>
    </main>
  );
}

// ─── Round Entry ──────────────────────────────────────────────────────────────
function RoundEntry({ session, roundNumber, passDirection, totals, initialValues, onSubmit, onBack }: {
  session: SpideSession;
  roundNumber: number;
  passDirection: ReturnType<typeof getPassDirection>;
  totals: number[];
  initialValues?: { roundType: "normal" | "eatAll"; eatAllWinner: number | null; entries: SpideRoundEntry[] };
  onSubmit: (round: SpideRound) => void;
  onBack: () => void;
}) {
  const [roundType, setRoundType] = useState<"normal" | "eatAll">(initialValues?.roundType ?? "normal");
  const [eatAllWinner, setEatAllWinner] = useState<number | null>(initialValues?.eatAllWinner ?? null);
  const [entries, setEntries] = useState<SpideRoundEntry[]>(
    initialValues?.entries ?? session.players.map((_, i) => ({
      playerId: i,
      hearts: 0,
      hasQueen: false, queenAnnounced: false,
      hasDiamond: false, diamondAnnounced: false,
      ateNothing: false,
    }))
  );

  const s = styles;

  function updateEntry(idx: number, patch: Partial<SpideRoundEntry>) {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, ...patch } : e));
  }

  // Total hearts distributed
  const totalHearts = entries.reduce((sum, e) => sum + (e.ateNothing ? 0 : e.hearts), 0);
  const heartsOk = totalHearts === 13;

  const queenCount = entries.filter(e => e.hasQueen).length;
  const diamondCount = entries.filter(e => e.hasDiamond).length;

  // Validate: can submit?
  const canSubmit = roundType === "eatAll"
    ? eatAllWinner !== null
    : heartsOk && queenCount <= 1 && diamondCount <= 1;

  function handleSubmit() {
    let scores: number[];
    if (roundType === "eatAll" && eatAllWinner !== null) {
      scores = calcEatAllScores(eatAllWinner, session.players.length);
    } else {
      scores = calcRoundScores(entries);
    }

    const round: SpideRound = {
      id: crypto.randomUUID(),
      number: roundNumber,
      passDirection,
      type: roundType,
      eatAllWinner: roundType === "eatAll" ? eatAllWinner! : undefined,
      entries: roundType === "normal" ? entries : [],
      scores,
    };
    onSubmit(round);
  }

  return (
    <main style={s.page}>
      <div style={s.topbar}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={s.topTitle}>تسجيل جولة {roundNumber}</div>
          <div style={s.topSub}>{passDirectionLabel(passDirection)} هذه الجولة</div>
        </div>
        <div style={s.topBadge}>♥</div>
      </div>

      <div style={s.body}>

        {/* Eat all — pick winner */}
        {roundType === "eatAll" && (
          <div>
            <div style={s.secLabel}>من أكل الكل؟</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {session.players.map((p, i) => (
                <button
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 12,
                    border: eatAllWinner === i ? "2px solid #D4A420" : "1px solid rgba(255,255,255,0.1)",
                    background: eatAllWinner === i ? "rgba(212,164,32,0.15)" : "rgba(255,255,255,0.04)",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                  onClick={() => setEatAllWinner(i)}
                >
                  <div style={{ ...s.avatar32, background: p.avatarColor }}>
                    {p.name[0]}
                  </div>
                  <div style={{ flex: 1, textAlign: "right", color: eatAllWinner === i ? "#D4A420" : "rgba(248,242,228,0.6)", fontSize: 14, fontWeight: 700 }}>
                    {p.name}
                  </div>
                  <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 12 }}>
                    {totals[i]} نقطة
                  </div>
                  {eatAllWinner === i && <div style={{ color: "#D4A420", fontSize: 18 }}>✓</div>}
                </button>
              ))}
            </div>

            {eatAllWinner !== null && (
              <div style={s.resultPreview}>
                <div style={{ color: "rgba(212,164,32,0.7)", fontSize: 11, marginBottom: 8 }}>نتيجة أكل الكل</div>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#2ECC71", fontSize: 22, fontWeight: 900 }}>0</div>
                    <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 10 }}>{session.players[eatAllWinner].name}</div>
                  </div>
                  <div style={{ color: "rgba(248,242,228,0.2)", fontSize: 20 }}>|</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#E74C3C", fontSize: 22, fontWeight: 900 }}>+26</div>
                    <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 10 }}>الباقين</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Normal round — per player entry */}
        {roundType === "normal" && (
          <>
            <div style={s.secLabel}>نتائج اللاعبين</div>
            {session.players.map((p, i) => (
              <PlayerCard
                key={i}
                player={p}
                total={totals[i]}
                entry={entries[i]}
                onChange={patch => updateEntry(i, patch)}
              />
            ))}

            {/* Hearts count validation */}
            <div style={{
              ...s.countBar,
              ...(heartsOk ? s.countBarOk : s.countBarWarn),
            }}>
              <div>
                <div style={s.countLabel}>مجموع الحاس</div>
                <div style={{ fontSize: 11, color: heartsOk ? "rgba(46,204,113,0.7)" : "rgba(231,76,60,0.7)" }}>
                  {heartsOk ? "مكتمل ✓" : `باقي ${13 - totalHearts} حاسة لم تُوزَّع`}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: heartsOk ? "#2ECC71" : "#E74C3C" }}>
                {totalHearts} / 13
              </div>
            </div>
          </>
        )}
      </div>

      <div style={s.stickyBtn}>
        <button
          style={{
            width: "100%", padding: "11px 0", marginBottom: 8,
            borderRadius: 12,
            border: roundType === "eatAll" ? "2px solid #D4A420" : "1px solid rgba(212,164,32,0.3)",
            background: roundType === "eatAll" ? "rgba(212,164,32,0.15)" : "transparent",
            color: roundType === "eatAll" ? "#D4A420" : "rgba(212,164,32,0.5)",
            fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
          onClick={() => setRoundType(roundType === "eatAll" ? "normal" : "eatAll")}
        >
          ⚡ {roundType === "eatAll" ? "إلغاء أكل الكل" : "أكل الكل"}
        </button>
        <button
          style={{ ...s.btnPrimary, ...(!canSubmit ? s.btnDisabled : {}) }}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          تأكيد الجولة
        </button>
      </div>
    </main>
  );
}

// ─── Player Card ──────────────────────────────────────────────────────────────
function PlayerCard({ player, total, entry, onChange }: {
  player: SpideSession["players"][0];
  total: number;
  entry: SpideRoundEntry;
  onChange: (patch: Partial<SpideRoundEntry>) => void;
}) {
  const s = styles;

  function toggleQueen() {
    if (entry.hasQueen) {
      onChange({ hasQueen: false, queenAnnounced: false, ateNothing: false });
    } else {
      onChange({ hasQueen: true, ateNothing: false });
    }
  }

  function toggleDiamond() {
    if (entry.hasDiamond) {
      onChange({ hasDiamond: false, diamondAnnounced: false, ateNothing: false });
    } else {
      onChange({ hasDiamond: true, ateNothing: false });
    }
  }

  function toggleAteNothing() {
    if (entry.ateNothing) {
      onChange({ ateNothing: false });
    } else {
      onChange({ ateNothing: true, hearts: 0, hasQueen: false, queenAnnounced: false, hasDiamond: false, diamondAnnounced: false });
    }
  }

  return (
    <div style={s.playerCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ ...s.avatar, background: player.avatarColor, width: 32, height: 32, fontSize: 12 }}>
          {player.name[0]}
        </div>
        <div style={{ flex: 1, textAlign: "right", color: "#F8F2E4", fontSize: 14, fontWeight: 700 }}>
          {player.name}
        </div>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 12 }}>{total} نقطة</div>
      </div>

      {/* Card pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <button
          style={{
            ...s.pill,
            ...(entry.hasQueen ? s.pillQueen : {}),
          }}
          onClick={toggleQueen}
        >
          ♛ ميم السبيت
        </button>
        <button
          style={{
            ...s.pill,
            ...(entry.hasDiamond ? s.pillDiamond : {}),
          }}
          onClick={toggleDiamond}
        >
          ◆ عشر الديمن
        </button>
        <button
          style={{
            ...s.pill,
            ...(entry.ateNothing ? s.pillZero : {}),
          }}
          onClick={toggleAteNothing}
        >
          ✓ ما أكل
        </button>
      </div>

      {/* Announce toggles */}
      {entry.hasQueen && (
        <div style={s.announceRow}>
          <div style={s.announceLabel}>ميم السبيت — أعلن؟</div>
          <div style={s.announceToggle}>
            <button
              style={{ ...s.annBtn, ...(entry.queenAnnounced ? {} : s.annBtnActiveNo) }}
              onClick={() => onChange({ queenAnnounced: false })}
            >
              لا · 13
            </button>
            <button
              style={{ ...s.annBtn, ...(entry.queenAnnounced ? s.annBtnActiveYes : {}) }}
              onClick={() => onChange({ queenAnnounced: true })}
            >
              نعم · 26
            </button>
          </div>
        </div>
      )}

      {entry.hasDiamond && (
        <div style={s.announceRow}>
          <div style={s.announceLabel}>عشر الديمن — أعلن؟</div>
          <div style={s.announceToggle}>
            <button
              style={{ ...s.annBtn, ...(entry.diamondAnnounced ? {} : s.annBtnActiveNo) }}
              onClick={() => onChange({ diamondAnnounced: false })}
            >
              لا · 10
            </button>
            <button
              style={{ ...s.annBtn, ...(entry.diamondAnnounced ? s.annBtnActiveYes : {}) }}
              onClick={() => onChange({ diamondAnnounced: true })}
            >
              نعم · 20
            </button>
          </div>
        </div>
      )}

      {/* Hearts slider */}
      {!entry.ateNothing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 12 }}>الحاس ♥</div>
            <div style={{
              fontSize: 22, fontWeight: 900,
              fontVariantNumeric: "tabular-nums",
              color: entry.hearts === 0 ? "rgba(248,242,228,0.3)" : "#E74C3C",
            }}>
              {entry.hearts}
            </div>
          </div>
          <input
            type="range"
            dir="ltr"
            min={0}
            max={13}
            value={entry.hearts}
            onChange={e => onChange({ hearts: Number(e.target.value), ateNothing: false })}
            style={{
              WebkitAppearance: "none" as const,
              width: "100%", height: 6,
              borderRadius: 4,
              background: `linear-gradient(to right, #E74C3C ${(entry.hearts / 13) * 100}%, rgba(255,255,255,0.1) ${(entry.hearts / 13) * 100}%)`,
              outline: "none", cursor: "pointer",
              accentColor: "#E74C3C",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", direction: "ltr" }}>
            <div style={{ color: "rgba(248,242,228,0.2)", fontSize: 10 }}>0</div>
            <div style={{ color: "rgba(248,242,228,0.2)", fontSize: 10 }}>13</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Game Over ────────────────────────────────────────────────────────────────
function GameOver({ session, totals, onRestart, onHome }: {
  session: SpideSession;
  totals: number[];
  onRestart: () => void;
  onHome: () => void;
}) {
  const s = styles;

  // Per-player stats across all rounds
  const playerStats = session.players.map((p, i) => {
    let hearts = 0, queens = 0, diamonds = 0, ateNothing = 0, ateAll = 0;
    session.rounds.forEach(r => {
      if (r.type === "eatAll") {
        if (r.eatAllWinner === i) ateAll++;
      } else {
        const e = r.entries[i];
        if (e) {
          hearts += e.hearts;
          if (e.hasQueen) queens++;
          if (e.hasDiamond) diamonds++;
          if (e.ateNothing) ateNothing++;
        }
      }
    });
    return { name: p.name, avatarColor: p.avatarColor, total: totals[i], hearts, queens, diamonds, ateNothing, ateAll };
  });

  const isTeams = session.mode === "teams";

  if (isTeams) {
    // Team game over — supports 2 or 3 teams
    const n = session.teams!.length;
    const teamStandings = session.teams!.map((team, t) => ({
      name: team.name,
      total: totals.filter((_, i) => i % n === t).reduce((a, b) => a + b, 0),
    })).sort((a, b) => a.total - b.total);
    const winnerName = teamStandings[0].name;
    const winnerScore = teamStandings[0].total;
    const loserScore = teamStandings[teamStandings.length - 1].total;

    return (
      <main style={s.page}>
        <div style={s.topbar}>
          <button style={s.backBtn} onClick={onHome}>←</button>
          <div style={{ flex: 1 }}>
            <div style={s.topTitle}>انتهت اللعبة</div>
            <div style={s.topSub}>سبيد · {session.rounds.length} جولة</div>
          </div>
          <div style={s.topBadge}>♥</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 40px", direction: "rtl" as const }}>
          {/* Winner hero */}
          <div style={{
            background: "linear-gradient(160deg, #1B5E38 0%, #0A2E1A 100%)",
            padding: "30px 20px 24px", textAlign: "center",
            borderBottom: "1px solid rgba(212,164,32,0.3)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <div style={{ color: "#D4A420", fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 6 }}>الفائز</div>
            <div style={{ color: "#F8F2E4", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{winnerName}</div>
            <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 13 }}>{winnerScore} — {loserScore}</div>
          </div>

          {/* Team standings */}
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, textAlign: "right", marginBottom: 10, fontWeight: 700 }}>ترتيب الفرق</div>
            {teamStandings.map(({ name, total }, rank) => (
              <div key={name} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: rank === 0 ? "rgba(212,164,32,0.1)" : "rgba(255,255,255,0.04)",
                borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                border: rank === 0 ? "1px solid rgba(212,164,32,0.25)" : "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: rank === 0 ? "#D4A420" : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: rank === 0 ? "#0F3D24" : "rgba(248,242,228,0.4)",
                  fontSize: 13, fontWeight: 900,
                }}>{rank + 1}</div>
                <div style={{ flex: 1, color: "#F8F2E4", fontSize: 14, fontWeight: 700, textAlign: "right" }}>{name}</div>
                <div style={{ color: rank === 0 ? "#D4A420" : "rgba(248,242,228,0.5)", fontSize: 18, fontWeight: 900 }}>{total}</div>
              </div>
            ))}
          </div>

          {/* Player stats */}
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, textAlign: "right", marginBottom: 10, fontWeight: 700 }}>إحصائيات اللاعبين</div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 40px 40px 40px", padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["اللاعب", "♥", "♛", "◆", "نقاط"].map((h, i) => (
                  <div key={i} style={{ color: "rgba(248,242,228,0.4)", fontSize: 10, fontWeight: 600, textAlign: i === 0 ? "right" : "center" }}>{h}</div>
                ))}
              </div>
              {playerStats.map((ps, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 40px 40px 40px 40px",
                  padding: "10px 14px",
                  borderBottom: i < playerStats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                    <div style={{ color: "#F8F2E4", fontSize: 13, fontWeight: 600 }}>{ps.name}</div>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: ps.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{ps.name[0]}</div>
                  </div>
                  <div style={{ color: "#E74C3C", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{ps.hearts}</div>
                  <div style={{ color: "#A990F0", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{ps.queens}</div>
                  <div style={{ color: "#D4A420", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{ps.diamonds}</div>
                  <div style={{ color: "rgba(248,242,228,0.7)", fontSize: 13, fontWeight: 700, textAlign: "center", fontVariantNumeric: "tabular-nums" as const }}>{ps.total}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
            <button style={s.btnPrimary} onClick={onRestart}>لعبة جديدة بنفس اللاعبين</button>
            <button style={s.btnSecondary} onClick={onHome}>الرئيسية</button>
          </div>
        </div>
      </main>
    );
  }

  // Individual game over
  const sorted = playerStats
    .map((ps, i) => ({ ...ps, originalIndex: i }))
    .sort((a, b) => a.total - b.total);
  const winner = sorted[0];

  return (
    <main style={s.page}>
      <div style={s.topbar}>
        <button style={s.backBtn} onClick={onHome}>←</button>
        <div style={{ flex: 1 }}>
          <div style={s.topTitle}>انتهت اللعبة</div>
          <div style={s.topSub}>سبيد · {session.rounds.length} جولة</div>
        </div>
        <div style={s.topBadge}>♥</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 40px", direction: "rtl" as const }}>
        {/* Winner hero */}
        <div style={{
          background: "linear-gradient(160deg, #1B5E38 0%, #0A2E1A 100%)",
          padding: "30px 20px 24px", textAlign: "center",
          borderBottom: "1px solid rgba(212,164,32,0.3)",
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
          <div style={{ color: "#D4A420", fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 6 }}>الفائز</div>
          <div style={{ color: "#F8F2E4", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{winner.name}</div>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 13 }}>أقل النقاط · {winner.total} نقطة</div>
        </div>

        {/* Standings */}
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, textAlign: "right", marginBottom: 10, fontWeight: 700 }}>الترتيب النهائي</div>
          {sorted.map((p, rank) => (
            <div key={p.originalIndex} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: rank === 0 ? "rgba(212,164,32,0.1)" : "rgba(255,255,255,0.04)",
              borderRadius: 12, padding: "12px 14px", marginBottom: 8,
              border: rank === 0 ? "1px solid rgba(212,164,32,0.25)" : "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: rank === 0 ? "#D4A420" : "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: rank === 0 ? "#0F3D24" : "rgba(248,242,228,0.4)",
                fontSize: 13, fontWeight: 900,
              }}>{rank + 1}</div>
              <div style={{ flex: 1, color: "#F8F2E4", fontSize: 14, fontWeight: 700, textAlign: "right" }}>{p.name}</div>
              <div style={{ color: rank === 0 ? "#D4A420" : "rgba(248,242,228,0.5)", fontSize: 18, fontWeight: 900, fontVariantNumeric: "tabular-nums" as const }}>{p.total}</div>
            </div>
          ))}
        </div>

        {/* Player stats */}
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, textAlign: "right", marginBottom: 10, fontWeight: 700 }}>إحصائيات اللاعبين</div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 36px 36px 36px 36px 42px", padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["اللاعب", "♥", "♛", "◆", "ما أكل", "نقاط"].map((h, i) => (
                <div key={i} style={{ color: "rgba(248,242,228,0.4)", fontSize: 10, fontWeight: 600, textAlign: i === 0 ? "right" : "center" }}>{h}</div>
              ))}
            </div>
            {sorted.map((ps, rank) => (
              <div key={ps.originalIndex} style={{
                display: "grid", gridTemplateColumns: "1fr 36px 36px 36px 36px 42px",
                padding: "10px 14px",
                borderBottom: rank < sorted.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                  <div style={{ color: "#F8F2E4", fontSize: 13, fontWeight: 600 }}>{ps.name}</div>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: ps.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{ps.name[0]}</div>
                </div>
                <div style={{ color: "#E74C3C", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{ps.hearts}</div>
                <div style={{ color: "#A990F0", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{ps.queens}</div>
                <div style={{ color: "#D4A420", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{ps.diamonds}</div>
                <div style={{ color: "#2ECC71", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{ps.ateNothing}</div>
                <div style={{
                  color: rank === 0 ? "#D4A420" : "rgba(248,242,228,0.7)",
                  fontSize: 13, fontWeight: 900, textAlign: "center", fontVariantNumeric: "tabular-nums" as const,
                }}>{ps.total}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", marginTop: 8 }}>
            {[["♥", "حاسة أكلها", "#E74C3C"], ["♛", "ميم السبيت", "#A990F0"], ["◆", "عشر الديمن", "#D4A420"], ["ما أكل", "جولات بدون", "#2ECC71"]].map(([icon, label, color]) => (
              <div key={icon} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ color, fontSize: 11 }}>{icon}</div>
                <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 9 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          <button style={s.btnPrimary} onClick={onRestart}>لعبة جديدة بنفس اللاعبين</button>
          <button style={s.btnSecondary} onClick={onHome}>الرئيسية</button>
        </div>
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function passArrow(dir: ReturnType<typeof getPassDirection>): string {
  if (dir === "right") return "→";
  if (dir === "left") return "←";
  return "—";
}

function passArrowColor(dir: ReturnType<typeof getPassDirection>): string {
  if (dir === "right") return "rgba(248,242,228,0.4)";
  if (dir === "left") return "rgba(212,164,32,0.7)";
  return "rgba(248,242,228,0.2)";
}

function roundSummaryLine(round: SpideRound, session: SpideSession): string {
  const parts: string[] = [];
  const totalHearts = round.entries.reduce((s, e) => s + e.hearts, 0);
  if (totalHearts > 0) parts.push(`♥×${totalHearts}`);
  const queenOwner = round.entries.find(e => e.hasQueen);
  if (queenOwner) parts.push(queenOwner.queenAnnounced ? "♛×2" : "♛");
  const diamondOwner = round.entries.find(e => e.hasDiamond);
  if (diamondOwner) parts.push(diamondOwner.diamondAnnounced ? "◆×2" : "◆");
  const nothingCount = round.entries.filter(e => e.ateNothing).length;
  if (nothingCount > 0) parts.push(`ما أكل ×${nothingCount}`);
  return parts.join(" · ") || "—";
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0F3D24",
    display: "flex",
    flexDirection: "column" as const,
    maxWidth: 390,
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
    position: "relative" as const,
  },
  topbar: {
    background: "#1B5E38",
    padding: "48px 16px 14px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    direction: "rtl" as const,
    flexShrink: 0,
  },
  backBtn: {
    width: 30, height: 30, borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    border: "none", color: "#F8F2E4", fontSize: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  } as React.CSSProperties,
  topTitle: { color: "#F8F2E4", fontSize: 15, fontWeight: 700, textAlign: "right" as const },
  topSub: { color: "rgba(248,242,228,0.45)", fontSize: 10, textAlign: "right" as const },
  topBadge: { fontSize: 20 },
  scoreHeader: {
    background: "rgba(0,0,0,0.2)",
    padding: "12px 16px 0",
    flexShrink: 0,
    direction: "rtl" as const,
  },
  passIndicator: {
    background: "rgba(212,164,32,0.12)",
    border: "1px solid rgba(212,164,32,0.25)",
    borderRadius: 10,
    padding: "8px 12px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 10,
  },
  passLabel: { color: "rgba(248,242,228,0.5)", fontSize: 11 },
  passValue: { color: "#D4A420", fontSize: 13, fontWeight: 700 },
  th: {
    color: "rgba(248,242,228,0.35)", fontSize: 10, fontWeight: 600, textAlign: "center" as const,
  },
  td: {
    color: "#F8F2E4", fontSize: 12, textAlign: "center" as const, fontVariantNumeric: "tabular-nums" as const,
  },
  tdNum: {
    color: "rgba(248,242,228,0.35)", fontSize: 11, textAlign: "center" as const,
  },
  body: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px 16px 120px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
    direction: "rtl" as const,
  },
  secLabel: {
    color: "rgba(248,242,228,0.45)",
    fontSize: 11, fontWeight: 700,
    textAlign: "right" as const,
    marginBottom: 8,
  },
  roundTypeBtn: {
    padding: "18px 12px",
    borderRadius: 14, border: "2px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(248,242,228,0.5)", fontSize: 14, fontWeight: 700,
    cursor: "pointer", textAlign: "center" as const, fontFamily: "inherit",
    display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6,
  },
  roundTypeNormal: {
    borderColor: "#1B5E38", background: "rgba(27,94,56,0.3)", color: "#F8F2E4",
  },
  roundTypeEat: {
    borderColor: "#D4A420", background: "rgba(212,164,32,0.12)", color: "#D4A420",
  },
  playerCard: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 14, padding: "12px 14px",
    display: "flex", flexDirection: "column" as const, gap: 10,
  },
  avatar: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
  } as React.CSSProperties,
  avatar32: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
  } as React.CSSProperties,
  pill: {
    padding: "6px 12px", borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(248,242,228,0.5)", fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
  pillQueen: { borderColor: "#5B3FA6", background: "rgba(91,63,166,0.2)", color: "#A990F0" },
  pillDiamond: { borderColor: "#D4A420", background: "rgba(212,164,32,0.15)", color: "#D4A420" },
  pillZero: { borderColor: "#2ECC71", background: "rgba(46,204,113,0.12)", color: "#2ECC71" },
  announceRow: {
    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8,
  },
  announceLabel: { color: "rgba(248,242,228,0.4)", fontSize: 11 },
  announceToggle: {
    display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 20, padding: 3, gap: 3,
  },
  annBtn: {
    padding: "4px 12px", borderRadius: 16, border: "none",
    fontSize: 11, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
    background: "transparent", color: "rgba(248,242,228,0.35)",
  },
  annBtnActiveNo: { background: "rgba(255,255,255,0.08)", color: "rgba(248,242,228,0.7)" },
  annBtnActiveYes: { background: "#5B3FA6", color: "#fff" },
  countBar: {
    background: "rgba(0,0,0,0.25)",
    borderRadius: 12, padding: "12px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  countBarOk: { borderColor: "rgba(46,204,113,0.3)", background: "rgba(46,204,113,0.06)" },
  countBarWarn: { borderColor: "rgba(231,76,60,0.3)", background: "rgba(231,76,60,0.06)" },
  countLabel: { color: "rgba(248,242,228,0.45)", fontSize: 12 },
  resultPreview: {
    marginTop: 8,
    background: "rgba(212,164,32,0.08)", border: "1px solid rgba(212,164,32,0.2)",
    borderRadius: 12, padding: 14,
  },
  stickyBtn: {
    position: "absolute" as const, bottom: 0, left: 0, right: 0,
    padding: "12px 16px 28px",
    background: "linear-gradient(to top, #0F3D24 70%, transparent)",
  },
  btnPrimary: {
    width: "100%", padding: "15px 0",
    background: "#1B5E38", border: "none", borderRadius: 12,
    color: "#F8F2E4", fontSize: 16, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
  },
  btnDisabled: {
    background: "rgba(27,94,56,0.3)",
    color: "rgba(248,242,228,0.3)",
    cursor: "not-allowed",
  },
  btnSecondary: {
    width: "100%", padding: "13px 0", borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent", color: "rgba(248,242,228,0.7)",
    fontSize: 14, cursor: "pointer", fontFamily: "inherit",
  },
};
