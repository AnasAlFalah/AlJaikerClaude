"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  KoutSession,
  KoutRound,
  KoutHokm,
  getSession,
  saveSession,
  getTeamScores,
  getPlayerStats,
  calcKoutPoints,
} from "@/lib/kout";

const AVATAR_COLORS = ["#C8102E", "#1B5E38", "#D4A420", "#5B3FA6", "#0077B6", "#E07B39"];
const HOKM_OPTIONS: KoutHokm[] = ["ملزوم", "5", "6", "7", "8", "باون"];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getAvatarColor(name: string, session: KoutSession): string {
  const allPlayers = [...session.teamA.players, ...session.teamB.players];
  const idx = allPlayers.indexOf(name);
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

function getPlayerTeam(name: string, session: KoutSession): "A" | "B" {
  return session.teamA.players.includes(name) ? "A" : "B";
}

// ── Round Entry Panel ─────────────────────────────────────────────────────────

interface RoundEntryProps {
  session: KoutSession;
  onConfirm: (round: Omit<KoutRound, "id" | "number">) => void;
  onCancel: () => void;
  initialValues?: { hakim: string; hokm: KoutHokm; result: "win" | "lose" };
}

function RoundEntry({ session, onConfirm, onCancel, initialValues }: RoundEntryProps) {
  const allPlayers = [...session.teamA.players, ...session.teamB.players];
  const [hakim, setHakim] = useState<string>(initialValues?.hakim || allPlayers[0] || "");
  const [hokm, setHokm] = useState<KoutHokm | null>(initialValues?.hokm || null);
  const [result, setResult] = useState<"win" | "lose" | null>(initialValues?.result || null);

  const hakimTeam = hakim ? getPlayerTeam(hakim, session) : null;
  const canConfirm = hakim && hokm && result;

  const handleConfirm = () => {
    if (!hakim || !hokm || !result || !hakimTeam) return;
    const { deltaA, deltaB } = calcKoutPoints(hokm, result, hakimTeam);
    onConfirm({ hakim, hakimTeam, hokm, result, deltaA, deltaB });
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
        padding: "20px 16px 36px",
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 20px" }} />

        <div style={{ color: "#F8F2E4", fontSize: 15, fontWeight: 700, textAlign: "right", marginBottom: 18 }}>
          تسجيل شوط
        </div>

        {/* Hakim selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 11, textAlign: "right", marginBottom: 8 }}>الحاكم</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {allPlayers.map((p, i) => {
              const team = getPlayerTeam(p, session);
              const color = team === "A" ? "#C8102E" : "#5B3FA6";
              const selected = hakim === p;
              return (
                <button
                  key={p}
                  onClick={() => setHakim(p)}
                  style={{
                    background: selected ? color : "rgba(255,255,255,0.07)",
                    border: `1px solid ${selected ? color : "rgba(255,255,255,0.12)"}`,
                    borderRadius: 20,
                    padding: "6px 12px",
                    color: selected ? "#fff" : "rgba(248,242,228,0.7)",
                    fontSize: 12, fontWeight: selected ? 700 : 400,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: AVATAR_COLORS[i],
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "#fff",
                  }}>
                    {p.charAt(0)}
                  </span>
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hokm grid 3×2 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 11, textAlign: "right", marginBottom: 8 }}>الحكم</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {HOKM_OPTIONS.map(h => (
              <button
                key={h}
                onClick={() => setHokm(h)}
                style={{
                  padding: "11px 0",
                  borderRadius: 10,
                  border: `1px solid ${hokm === h ? "#D4A420" : "rgba(255,255,255,0.12)"}`,
                  background: hokm === h ? "rgba(212,164,32,0.2)" : "rgba(255,255,255,0.05)",
                  color: hokm === h ? "#D4A420" : "rgba(248,242,228,0.7)",
                  fontSize: 14, fontWeight: hokm === h ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Result: ✓ / ✕ only */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 11, textAlign: "right", marginBottom: 8 }}>النتيجة</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              onClick={() => setResult("win")}
              style={{
                padding: "14px 0",
                borderRadius: 12,
                border: `2px solid ${result === "win" ? "#2ECC71" : "rgba(255,255,255,0.12)"}`,
                background: result === "win" ? "rgba(46,204,113,0.15)" : "rgba(255,255,255,0.05)",
                color: result === "win" ? "#2ECC71" : "rgba(248,242,228,0.4)",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ✓
            </button>
            <button
              onClick={() => setResult("lose")}
              style={{
                padding: "14px 0",
                borderRadius: 12,
                border: `2px solid ${result === "lose" ? "#E74C3C" : "rgba(255,255,255,0.12)"}`,
                background: result === "lose" ? "rgba(231,76,60,0.15)" : "rgba(255,255,255,0.05)",
                color: result === "lose" ? "#E74C3C" : "rgba(248,242,228,0.4)",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Buttons */}
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

function Scoreboard({ session, onNewRound, onEditRound }: { session: KoutSession; onNewRound: () => void; onEditRound: (round: KoutRound) => void }) {
  const scores = getTeamScores(session.rounds);
  const pctA = Math.min((scores.A / session.target) * 100, 100);
  const pctB = Math.min((scores.B / session.target) * 100, 100);
  const leadA = scores.A > scores.B;
  const leadB = scores.B > scores.A;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Team score header */}
      <div style={{
        background: "rgba(0,0,0,0.2)",
        padding: "14px 16px 10px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        {/* Team A */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: leadA ? "#C8102E" : "rgba(248,242,228,0.6)", fontSize: 11, fontWeight: 700, marginBottom: 2 }}>
            {session.teamA.name}
          </div>
          <div style={{ color: leadA ? "#fff" : "rgba(248,242,228,0.7)", fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
            {scores.A}
          </div>
          {leadA && <div style={{ color: "#C8102E", fontSize: 9, marginTop: 2 }}>▲ متقدم</div>}
        </div>

        {/* Center */}
        <div style={{ textAlign: "center", minWidth: 60 }}>
          <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 10 }}>هدف</div>
          <div style={{ color: "rgba(212,164,32,0.8)", fontSize: 20, fontWeight: 900 }}>{session.target}</div>
          <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 9, marginTop: 2 }}>شوط {session.rounds.length + 1}</div>
        </div>

        {/* Team B */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: leadB ? "#5B3FA6" : "rgba(248,242,228,0.6)", fontSize: 11, fontWeight: 700, marginBottom: 2 }}>
            {session.teamB.name}
          </div>
          <div style={{ color: leadB ? "#fff" : "rgba(248,242,228,0.7)", fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
            {scores.B}
          </div>
          {leadB && <div style={{ color: "#5B3FA6", fontSize: 9, marginTop: 2 }}>▲ متقدم</div>}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", height: 5 }}>
        <div style={{ width: `${pctA}%`, background: "#C8102E", transition: "width 0.4s" }} />
        <div style={{ flex: 1, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ width: `${pctB}%`, background: "#5B3FA6", transition: "width 0.4s" }} />
      </div>

      {/* Rounds table */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 80px" }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "30px 1fr 80px 70px",
          padding: "8px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {["#", "الحاكم · الحكم", "النقاط", "الإجمالي"].map((h, i) => (
            <div key={i} style={{
              color: "rgba(248,242,228,0.4)", fontSize: 10, fontWeight: 600,
              textAlign: i === 0 ? "center" : i === 1 ? "right" : "center",
            }}>{h}</div>
          ))}
        </div>

        {session.rounds.length === 0 && (
          <div style={{ color: "rgba(248,242,228,0.25)", fontSize: 13, textAlign: "center", padding: "40px 0" }}>
            لم يُسجَّل أي شوط بعد
          </div>
        )}

        {session.rounds.map((r, idx) => {
          // running totals up to this round
          const cumA = session.rounds.slice(0, idx + 1).reduce((s, x) => s + x.deltaA, 0);
          const cumB = session.rounds.slice(0, idx + 1).reduce((s, x) => s + x.deltaB, 0);
          const winTeam = r.result === "win" ? r.hakimTeam : (r.hakimTeam === "A" ? "B" : "A");
          const winColor = winTeam === "A" ? "#C8102E" : "#5B3FA6";
          const teamName = r.hakimTeam === "A" ? session.teamA.name : session.teamB.name;
          const delta = r.result === "win"
            ? (r.hakimTeam === "A" ? r.deltaA : r.deltaB)
            : (r.hakimTeam === "A" ? r.deltaB : r.deltaA);

          return (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: "30px 1fr 80px 70px",
                padding: "9px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                alignItems: "center",
              }}
            >
              {/* Round # + edit */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 11 }}>{r.number}</div>
                <button onClick={() => onEditRound(r)} style={{ background: "none", border: "none", color: "rgba(248,242,228,0.2)", fontSize: 10, cursor: "pointer", padding: 0, lineHeight: 1 }}>✎</button>
              </div>

              {/* Hakim + Hokm */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "rgba(248,242,228,0.5)", marginBottom: 1 }}>{teamName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700,
                    color: r.result === "win" ? "#2ECC71" : "#E74C3C",
                    background: r.result === "win" ? "rgba(46,204,113,0.12)" : "rgba(231,76,60,0.12)",
                    padding: "1px 5px", borderRadius: 4,
                  }}>
                    {r.hokm}
                  </div>
                  <div style={{ color: "#F8F2E4", fontSize: 12, fontWeight: 600 }}>{r.hakim}</div>
                </div>
              </div>

              {/* Points + who got them */}
              <div style={{ textAlign: "center" }}>
                <div style={{ color: winColor, fontSize: 14, fontWeight: 900 }}>+{delta}</div>
                <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 9, marginTop: 1 }}>
                  {winTeam === "A" ? session.teamA.name : session.teamB.name}
                </div>
              </div>

              {/* Running totals */}
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                  <span style={{ color: "#C8102E", fontSize: 11, fontWeight: 700 }}>{cumA}</span>
                  <span style={{ color: "rgba(248,242,228,0.2)", fontSize: 11 }}>·</span>
                  <span style={{ color: "#5B3FA6", fontSize: 11, fontWeight: 700 }}>{cumB}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add round button */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 390, margin: "0 auto", padding: "10px 16px 24px", background: "#0F3D24" }}>
        <button
          onClick={onNewRound}
          style={{
            width: "100%", padding: "14px 0",
            background: "#1B5E38", border: "none", borderRadius: 12,
            color: "#F8F2E4", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}
        >
          + تسجيل شوط
        </button>
      </div>
    </div>
  );
}

// ── Game Over Screen ──────────────────────────────────────────────────────────

function GameOver({ session, onRestart, onHome }: { session: KoutSession; onRestart: () => void; onHome: () => void }) {
  const scores = getTeamScores(session.rounds);
  const winnerTeam = scores.A >= session.target ? session.teamA : session.teamB;
  const loserTeam = scores.A >= session.target ? session.teamB : session.teamA;
  const winnerScore = scores.A >= session.target ? scores.A : scores.B;
  const loserScore = scores.A >= session.target ? scores.B : scores.A;
  const stats = getPlayerStats(session);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 0 40px" }}>
      {/* Winner hero */}
      <div style={{
        background: "linear-gradient(160deg, #1B5E38 0%, #0F3D24 100%)",
        padding: "30px 20px 24px",
        textAlign: "center",
        borderBottom: "1px solid rgba(212,164,32,0.3)",
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
        <div style={{ color: "#D4A420", fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 6 }}>
          الفائز
        </div>
        <div style={{ color: "#F8F2E4", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
          {winnerTeam.name}
        </div>
        <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 13 }}>
          {winnerScore} — {loserScore}
        </div>
      </div>

      {/* Team standings */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, textAlign: "right", marginBottom: 10, fontWeight: 700 }}>
          ترتيب الفرق
        </div>
        {[
          { team: winnerTeam, score: winnerScore, rank: 1 },
          { team: loserTeam, score: loserScore, rank: 2 },
        ].map(({ team, score, rank }) => (
          <div
            key={team.name}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: rank === 1 ? "rgba(212,164,32,0.1)" : "rgba(255,255,255,0.04)",
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 8,
              border: rank === 1 ? "1px solid rgba(212,164,32,0.25)" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: rank === 1 ? "#D4A420" : "rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: rank === 1 ? "#0F3D24" : "rgba(248,242,228,0.4)",
              fontSize: 13, fontWeight: 900,
            }}>
              {rank}
            </div>
            <div style={{ flex: 1, color: "#F8F2E4", fontSize: 14, fontWeight: 700, textAlign: "right" }}>
              {team.name}
            </div>
            <div style={{ color: rank === 1 ? "#D4A420" : "rgba(248,242,228,0.5)", fontSize: 18, fontWeight: 900 }}>
              {score}
            </div>
          </div>
        ))}
      </div>

      {/* Player stats */}
      <div style={{ padding: "16px 16px 0" }}>
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
            display: "grid", gridTemplateColumns: "1fr 60px 60px 60px",
            padding: "8px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            {["اللاعب", "فاز بـ", "أعطى", "الفرق"].map((h, i) => (
              <div key={i} style={{
                color: "rgba(248,242,228,0.4)", fontSize: 10, fontWeight: 600,
                textAlign: i === 0 ? "right" : "center",
              }}>{h}</div>
            ))}
          </div>
          {stats.map((s, i) => (
            <div
              key={s.name}
              style={{
                display: "grid", gridTemplateColumns: "1fr 60px 60px 60px",
                padding: "10px 14px",
                borderBottom: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                <div style={{ color: "#F8F2E4", fontSize: 13, fontWeight: 600, textAlign: "right" }}>{s.name}</div>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: "#fff",
                }}>
                  {s.name.charAt(0)}
                </div>
              </div>
              <div style={{ color: "#2ECC71", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{s.won}</div>
              <div style={{ color: "#E74C3C", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{s.gave}</div>
              <div style={{
                color: s.diff >= 0 ? "#2ECC71" : "#E74C3C",
                fontSize: 13, fontWeight: 700, textAlign: "center",
              }}>
                {s.diff >= 0 ? "+" : ""}{s.diff}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={onRestart}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: "#1B5E38", color: "#F8F2E4", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}
        >
          لعبة جديدة بنفس الفرق
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

export default function KoutGamePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<KoutSession | null>(null);
  const [showEntry, setShowEntry] = useState(false);
  const [editingRound, setEditingRound] = useState<KoutRound | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession(sessionId);
    if (!s) {
      router.push("/");
      return;
    }
    setSession(s);
    setLoading(false);
  }, [sessionId]);

  const scores = session ? getTeamScores(session.rounds) : { A: 0, B: 0 };
  const isGameOver = session ? (scores.A >= session.target || scores.B >= session.target) : false;

  const handleRound = (roundData: Omit<KoutRound, "id" | "number">) => {
    if (!session) return;
    let updatedRounds;
    if (editingRound) {
      updatedRounds = session.rounds.map(r =>
        r.id === editingRound.id
          ? { ...roundData, id: r.id, number: r.number }
          : r
      );
    } else {
      const newRound: KoutRound = { ...roundData, id: generateId(), number: session.rounds.length + 1 };
      updatedRounds = [...session.rounds, newRound];
    }
    const updated = { ...session, rounds: updatedRounds };
    const newScores = getTeamScores(updated.rounds);
    updated.status = (newScores.A >= updated.target || newScores.B >= updated.target) ? "finished" : "active";
    saveSession(updated);
    setSession(updated);
    setShowEntry(false);
    setEditingRound(null);
  };

  const handleRestart = () => {
    if (!session) return;
    const newSession: KoutSession = {
      ...session,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      rounds: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };
    saveSession(newSession);
    router.push(`/kout/${newSession.id}`);
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
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "none", color: "#F8F2E4", fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#F8F2E4", fontSize: 15, fontWeight: 700, textAlign: "right" }}>كوت</div>
          <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 10, textAlign: "right" }}>
            {session.teamA.name} ضد {session.teamB.name}
          </div>
        </div>
        <div style={{ fontSize: 20 }}>♛</div>
      </div>

      {/* Body */}
      {isGameOver ? (
        <GameOver
          session={session}
          onRestart={handleRestart}
          onHome={() => router.push("/")}
        />
      ) : (
        <Scoreboard session={session} onNewRound={() => setShowEntry(true)} onEditRound={r => { setEditingRound(r); setShowEntry(true); }} />
      )}

      {/* Round entry bottom sheet */}
      {showEntry && !isGameOver && (
        <RoundEntry
          session={session}
          onConfirm={handleRound}
          onCancel={() => { setShowEntry(false); setEditingRound(null); }}
          initialValues={editingRound ? { hakim: editingRound.hakim, hokm: editingRound.hokm, result: editingRound.result } : undefined}
        />
      )}
    </div>
  );
}
