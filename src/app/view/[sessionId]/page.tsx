"use client";

import { useState, useEffect, use } from "react";
import { subscribeLiveSession, type LiveSession } from "@/lib/live-share";
import type { TrixSession } from "@/lib/trix";
import { getPlayerTotals, getKingdomTotals } from "@/lib/trix";
import type { KoutSession } from "@/lib/kout";
import { getTeamScores } from "@/lib/kout";

const FELT    = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY   = "#F8F2E4";
const GOLD    = "#F2D060";
const JET     = "#1A1210";

const AVATAR_COLORS = ["#C8102E", "#1B5E38", "#D4A420", "#5B3FA6", "#0077B6"];

// ── Trix viewer ───────────────────────────────────────────────────────────────
function TrixView({ session }: { session: TrixSession }) {
  const totals = getPlayerTotals(session);
  const sorted = [...totals.map((score, i) => ({ score, name: session.players[i], i }))].sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Game info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 12 }}>
          مملكة {session.currentKingdomIdx + 1} من {session.playerCount}
        </div>
        <div style={{ background: "rgba(242,208,96,0.15)", border: "1px solid rgba(242,208,96,0.25)", borderRadius: 6, padding: "3px 10px", color: GOLD, fontSize: 11, fontWeight: 700 }}>
          تريكس
        </div>
      </div>

      {/* Scoreboard */}
      {sorted.map(({ score, name, i }, rank) => (
        <div key={i} style={{
          background: rank === 0 ? "rgba(242,208,96,0.1)" : "rgba(255,255,255,0.04)",
          border: rank === 0 ? "1.5px solid rgba(242,208,96,0.25)" : "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            {name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: rank === 0 ? GOLD : IVORY, fontSize: 15, fontWeight: 700, direction: "rtl" }}>{name}</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: score >= 0 ? "#4CAF50" : "#FF6B6B", fontVariantNumeric: "tabular-nums" }}>
            {score > 0 ? `+${score}` : score}
          </div>
          {rank === 0 && <div style={{ fontSize: 16 }}>👑</div>}
        </div>
      ))}

      {/* Kingdom progress */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 14px", direction: "rtl" }}>
        <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>تقدم الممالك</div>
        <div style={{ display: "flex", gap: 6 }}>
          {session.kingdoms.map((k, ki) => {
            const done = k.done.length;
            const pct = Math.round((done / 5) * 100);
            const isCurrent = ki === session.currentKingdomIdx;
            return (
              <div key={ki} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ color: isCurrent ? GOLD : "rgba(248,242,228,0.3)", fontSize: 10, fontWeight: isCurrent ? 700 : 400 }}>
                  {session.players[k.kingIdx][0]}
                </div>
                <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: isCurrent ? GOLD : FELT, borderRadius: 3, transition: "width 0.4s" }} />
                </div>
                <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 9 }}>{done}/5</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Kout viewer ───────────────────────────────────────────────────────────────
function KoutView({ session }: { session: KoutSession }) {
  const scores = getTeamScores(session.rounds);
  const pctA = Math.min(100, Math.round((scores.A / session.target) * 100));
  const pctB = Math.min(100, Math.round((scores.B / session.target) * 100));
  const leadA = scores.A > scores.B;
  const leadB = scores.B > scores.A;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 12 }}>{session.rounds.length} جولة · هدف {session.target}</div>
        <div style={{ background: "rgba(242,208,96,0.15)", border: "1px solid rgba(242,208,96,0.25)", borderRadius: 6, padding: "3px 10px", color: GOLD, fontSize: 11, fontWeight: 700 }}>كوت</div>
      </div>

      {/* Team A */}
      <TeamCard name={session.teamA.name} players={session.teamA.players} score={scores.A} target={session.target} pct={pctA} leading={leadA} color="#C8102E" />
      {/* VS */}
      <div style={{ textAlign: "center", color: "rgba(248,242,228,0.2)", fontSize: 13, fontWeight: 700 }}>VS</div>
      {/* Team B */}
      <TeamCard name={session.teamB.name} players={session.teamB.players} score={scores.B} target={session.target} pct={pctB} leading={leadB} color="#0077B6" />

      {/* Recent rounds */}
      {session.rounds.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 14px", direction: "rtl" }}>
          <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>آخر 3 جولات</div>
          {session.rounds.slice(-3).reverse().map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12 }}>
              <span style={{ color: "rgba(248,242,228,0.5)" }}>ج{r.number} · {r.hakim} · {r.hokm}</span>
              <span style={{ color: r.result === "win" ? "#4CAF50" : "#FF6B6B", fontWeight: 700 }}>
                {r.result === "win" ? `+${r.deltaA || r.deltaB}` : `-${r.deltaA || r.deltaB}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamCard({ name, players, score, target, pct, leading, color }: {
  name: string; players: string[]; score: number; target: number; pct: number; leading: boolean; color: string;
}) {
  return (
    <div style={{
      background: leading ? `${color}18` : "rgba(255,255,255,0.04)",
      border: leading ? `1.5px solid ${color}40` : "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, direction: "rtl" }}>
        <div>
          <div style={{ color: leading ? IVORY : "rgba(248,242,228,0.7)", fontSize: 16, fontWeight: 800 }}>{name}</div>
          <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 11, marginTop: 2 }}>{players.join(" · ")}</div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: leading ? GOLD : "rgba(248,242,228,0.5)", fontVariantNumeric: "tabular-nums" }}>
          {score}
        </div>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
      <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 10, marginTop: 4, textAlign: "left" }}>{score} / {target}</div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ViewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [liveSession, setLiveSession] = useState<LiveSession | null | "loading">("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const unsub = subscribeLiveSession(sessionId, (s) => {
      setLiveSession(s);
      if (s) {
        setLastUpdated(new Date());
        setPulse(true);
        setTimeout(() => setPulse(false), 800);
      }
    });
    return unsub;
  }, [sessionId]);

  if (liveSession === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(242,208,96,0.3)", borderTopColor: GOLD, animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 13 }}>جاري الاتصال...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!liveSession) {
    return (
      <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>📺</div>
        <div style={{ color: "rgba(248,242,228,0.6)", fontSize: 15, fontWeight: 600 }}>البث غير متاح</div>
        <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 13 }}>
          قد يكون البث انتهى أو الرابط غير صحيح
        </div>
      </div>
    );
  }

  let gameData: TrixSession | KoutSession | null = null;
  try { gameData = JSON.parse(liveSession.data); } catch { /* ignore */ }

  const timeSince = lastUpdated
    ? Math.round((Date.now() - lastUpdated.getTime()) / 1000)
    : null;

  return (
    <div style={{
      minHeight: "100vh", background: FELT_DK,
      display: "flex", flexDirection: "column",
      maxWidth: 390, margin: "0 auto",
      fontFamily: "system-ui,-apple-system,sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: FELT, padding: "44px 16px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between", direction: "rtl",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "#E53935", display: "inline-block",
              animation: pulse ? "none" : "livepulse 1.5s infinite",
              transform: pulse ? "scale(1.6)" : "scale(1)",
              transition: "transform 0.2s",
            }} />
            <span style={{ color: IVORY, fontSize: 16, fontWeight: 800 }}>بث مباشر</span>
          </div>
          {timeSince !== null && (
            <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 11, marginTop: 2 }}>
              آخر تحديث: منذ {timeSince} ث
            </div>
          )}
        </div>
        <div style={{ background: "rgba(242,208,96,0.15)", borderRadius: 8, padding: "4px 12px", color: GOLD, fontSize: 12, fontWeight: 700 }}>
          الجيكر 📺
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 16px 40px" }}>
        {liveSession.game === "trix" && gameData && (
          <TrixView session={gameData as TrixSession} />
        )}
        {liveSession.game === "kout" && gameData && (
          <KoutView session={gameData as KoutSession} />
        )}
        {!["trix", "kout"].includes(liveSession.game) && (
          <div style={{ color: "rgba(248,242,228,0.4)", textAlign: "center", marginTop: 40 }}>
            {liveSession.game}
          </div>
        )}
      </div>

      <style>{`
        @keyframes livepulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
      `}</style>
    </div>
  );
}
