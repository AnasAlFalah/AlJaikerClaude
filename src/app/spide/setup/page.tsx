"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SpideMode, SpideTarget, SpideSession, SavedSpideTeam,
  getAvatarColor, getSavedSpideTeams, saveSpideTeam, saveSession,
} from "@/lib/spide";

const TARGETS: SpideTarget[] = [100, 150, 200, 250];

const TEAM_COLORS = ["#3DEB7A", "#E74C3C", "#3B8BEB"];
const TEAM_BORDER_COLORS = ["rgba(61,235,122,0.3)", "rgba(231,76,60,0.3)", "rgba(59,139,235,0.3)"];

export default function SpideSetupPage() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState<4 | 5 | 6>(4);
  const [mode, setMode] = useState<SpideMode>("individual");
  const [numTeams, setNumTeams] = useState<2 | 3>(2);
  const [names, setNames] = useState<string[]>(["", "", "", "", "", ""]);
  const [teamNames, setTeamNames] = useState(["الفريق الأول", "الفريق الثاني", "الفريق الثالث"]);
  const [target, setTarget] = useState<SpideTarget>(150);
  const [savedTeams, setSavedTeams] = useState<SavedSpideTeam[]>([]);

  useEffect(() => {
    setSavedTeams(getSavedSpideTeams());
  }, []);

  // 3 teams only valid with 6 players
  const effectiveNumTeams = (mode === "teams" && playerCount === 6) ? numTeams : 2;

  const activePlayers = names.slice(0, playerCount);
  const allFilled = activePlayers.every(n => n.trim().length > 0);

  function loadTeam(team: SavedSpideTeam) {
    const next = ["", "", "", "", "", ""];
    team.players.forEach((p, i) => { if (i < 6) next[i] = p; });
    setNames(next);
    setPlayerCount(Math.min(Math.max(team.players.length, 4), 6) as 4 | 5 | 6);
  }

  function handleSaveTeam() {
    const filled = activePlayers.filter(n => n.trim());
    if (filled.length < 2) return;
    const teamName = `فريق ${savedTeams.length + 1}`;
    saveSpideTeam({ name: teamName, players: filled });
    setSavedTeams(getSavedSpideTeams());
  }

  function setTeamName(idx: number, val: string) {
    setTeamNames(prev => prev.map((n, i) => i === idx ? val : n));
  }

  function handleStart() {
    const players = activePlayers.map((name, i) => ({
      name: name.trim(),
      avatarColor: getAvatarColor(i),
    }));
    const n = effectiveNumTeams;
    const teams = mode === "teams" ? Array.from({ length: n }, (_, t) => ({
      name: teamNames[t].trim() || `الفريق ${t + 1}`,
      players: players.filter((_, i) => i % n === t).map(p => p.name),
    })) : undefined;

    const session: SpideSession = {
      id: crypto.randomUUID(),
      mode,
      playerCount,
      players,
      teams,
      target,
      rounds: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };
    saveSession(session);
    router.push(`/spide/${session.id}`);
  }

  const s = styles;

  return (
    <main style={s.page}>
      <div style={s.topbar}>
        <button style={s.backBtn} onClick={() => router.push("/")}>←</button>
        <div style={{ flex: 1 }}>
          <div style={s.topTitle}>لعبة جديدة</div>
          <div style={s.topSub}>سبيد</div>
        </div>
        <div style={s.topBadge}>♥</div>
      </div>

      <div style={s.body}>

        {savedTeams.length > 0 && (
          <div>
            <div style={s.secLabel}>فرق محفوظة</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {savedTeams.map(team => (
                <button key={team.id} style={s.savedChip} onClick={() => loadTeam(team)}>
                  ★ {team.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div style={s.secLabel}>عدد اللاعبين</div>
          <div style={{ ...s.toggleStrip, gridTemplateColumns: "1fr 1fr 1fr" }}>
            {([4, 5, 6] as const).map(n => {
              const disabled = mode === "teams" && n === 5;
              return (
                <button
                  key={n}
                  style={{
                    ...s.toggleBtn,
                    ...(playerCount === n ? s.toggleActive : {}),
                    ...(disabled ? { opacity: 0.3, cursor: "not-allowed" } : {}),
                  }}
                  onClick={() => { if (!disabled) setPlayerCount(n); }}
                >
                  {n}
                </button>
              );
            })}
          </div>
          {mode === "teams" && (
            <div style={{ fontSize: 10, color: "rgba(248,242,228,0.3)", textAlign: "right", marginTop: 4 }}>
              الفرق تتطلب عدد زوجي من اللاعبين (4 أو 6)
            </div>
          )}
        </div>

        <div>
          <div style={s.secLabel}>نظام اللعب</div>
          <div style={{ ...s.toggleStrip, gridTemplateColumns: "1fr 1fr" }}>
            {(["individual", "teams"] as SpideMode[]).map(m => (
              <button
                key={m}
                style={{ ...s.toggleBtn, ...(mode === m ? s.toggleActive : {}) }}
                onClick={() => {
                  setMode(m);
                  if (m === "teams" && playerCount === 5) setPlayerCount(4);
                }}
              >
                {m === "individual" ? "فردي" : "فرق"}
              </button>
            ))}
          </div>
        </div>

        {/* Number of teams — only shown for 6 players teams mode */}
        {mode === "teams" && playerCount === 6 && (
          <div>
            <div style={s.secLabel}>عدد الفرق</div>
            <div style={{ ...s.toggleStrip, gridTemplateColumns: "1fr 1fr" }}>
              <button
                style={{ ...s.toggleBtn, ...(numTeams === 2 ? s.toggleActive : {}) }}
                onClick={() => setNumTeams(2)}
              >
                فريقان · 3×2
              </button>
              <button
                style={{ ...s.toggleBtn, ...(numTeams === 3 ? s.toggleActive : {}) }}
                onClick={() => setNumTeams(3)}
              >
                3 فرق · 2×2×2
              </button>
            </div>
          </div>
        )}

        {/* Team name inputs */}
        {mode === "teams" && (
          <div>
            <div style={s.secLabel}>أسماء الفرق</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Array.from({ length: effectiveNumTeams }).map((_, t) => {
                const memberIndices = Array.from({ length: playerCount }, (_, i) => i).filter(i => i % effectiveNumTeams === t);
                return (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: TEAM_COLORS[t], flexShrink: 0 }} />
                    <input
                      style={s.playerInput}
                      value={teamNames[t]}
                      onChange={e => setTeamName(t, e.target.value)}
                      dir="rtl"
                      placeholder={`الفريق ${t + 1}`}
                    />
                    <div style={{ fontSize: 10, color: "rgba(248,242,228,0.35)", flexShrink: 0, whiteSpace: "nowrap" }}>
                      {memberIndices.map(i => `ل${i + 1}`).join(" ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div style={s.secLabel}>اللاعبون</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: playerCount }).map((_, i) => {
              const teamIdx = i % effectiveNumTeams;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ ...s.avatar, background: getAvatarColor(i) }}>
                    {names[i]?.trim()?.[0] || (i + 1)}
                  </div>
                  <input
                    style={s.playerInput}
                    placeholder={`اللاعب ${i + 1}`}
                    value={names[i]}
                    onChange={e => {
                      const next = [...names];
                      next[i] = e.target.value;
                      setNames(next);
                    }}
                    dir="rtl"
                  />
                  {mode === "teams" && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, flexShrink: 0,
                      color: TEAM_COLORS[teamIdx],
                      border: `1px solid ${TEAM_BORDER_COLORS[teamIdx]}`,
                      borderRadius: 6, padding: "2px 6px",
                    }}>
                      {teamNames[teamIdx] || `فريق ${teamIdx + 1}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {allFilled && (
            <button style={s.saveTeamBtn} onClick={handleSaveTeam}>
              + حفظ كفريق جاهز
            </button>
          )}
        </div>

        <div>
          <div style={s.secLabel}>هدف النقاط (الخسارة)</div>
          <div style={{ ...s.toggleStrip, gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
            {TARGETS.map(t => (
              <button
                key={t}
                style={{ ...s.toggleBtn, ...(target === t ? s.toggleActive : {}) }}
                onClick={() => setTarget(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={s.stickyBtn}>
        <button
          style={{ ...s.btnPrimary, ...(!allFilled ? s.btnDisabled : {}) }}
          onClick={handleStart}
          disabled={!allFilled}
        >
          ابدأ اللعبة
        </button>
      </div>
    </main>
  );
}

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
  toggleStrip: {
    display: "grid",
    background: "rgba(0,0,0,0.3)",
    borderRadius: 10, padding: 4, gap: 4,
  },
  toggleBtn: {
    padding: "9px 4px",
    borderRadius: 8, border: "none",
    background: "transparent",
    color: "rgba(248,242,228,0.4)",
    fontSize: 12, fontWeight: 600,
    cursor: "pointer", textAlign: "center" as const,
    fontFamily: "inherit",
  },
  toggleActive: {
    background: "#1B5E38",
    color: "#F8F2E4",
    boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
  },
  avatar: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
  } as React.CSSProperties,
  playerInput: {
    flex: 1,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "7px 10px",
    color: "#F8F2E4", fontSize: 13,
    outline: "none", textAlign: "right" as const,
    fontFamily: "inherit", width: "100%",
  },
  savedChip: {
    padding: "7px 14px", borderRadius: 20,
    background: "rgba(212,164,32,0.1)",
    border: "1px solid rgba(212,164,32,0.25)",
    color: "#D4A420", fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
  saveTeamBtn: {
    marginTop: 8, width: "100%", padding: 8,
    background: "transparent",
    border: "1px dashed rgba(212,164,32,0.3)",
    borderRadius: 8, color: "rgba(212,164,32,0.6)",
    fontSize: 12, cursor: "pointer", fontFamily: "inherit",
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
};
