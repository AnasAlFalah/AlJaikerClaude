"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SpideMode, SpideTarget, SpideSession, SavedSpideTeam,
  getAvatarColor, getSavedSpideTeams, saveSpideTeam, saveSession,
} from "@/lib/spide";

const TEAM_COLORS = ["#1C9245", "#CE1F26", "#3B8BEB"];
const TEAM_BORDER_COLORS = ["#D4EDDA", "#FADADD", "#D6EAF8"];

export default function SpideSetupPage() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4 | 5 | 6>(4);
  const [mode, setMode] = useState<SpideMode>("individual");
  const [numTeams, setNumTeams] = useState<2 | 3>(2);
  const [names, setNames] = useState<string[]>(["", "", "", "", "", ""]);
  const [teamNames, setTeamNames] = useState(["الفريق الأول", "الفريق الثاني", "الفريق الثالث"]);
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
    setPlayerCount(Math.min(Math.max(team.players.length, 2), 6) as 2 | 3 | 4 | 5 | 6);
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
      target: 9999,
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
        <button style={s.backBtn} onClick={() => router.push("/app")}>←</button>
        <img src="/images/AlJaiker%20Profile.png" alt="AlJaiker" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
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
          <div style={{ ...s.toggleStrip, gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
            {([2, 3, 4, 5, 6] as const).map(n => {
              const disabled = mode === "teams" && (n === 3 || n === 5);
              return (
                <button
                  key={n}
                  style={{
                    ...s.toggleBtn,
                    ...(playerCount === n ? s.toggleActive : {}),
                    ...(disabled ? { opacity: 0.3, cursor: "not-allowed" } : {}),
                  }}
                  onClick={() => {
                    if (!disabled) {
                      setPlayerCount(n);
                      if (mode === "teams" && n === 2) setNumTeams(2);
                    }
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
          {mode === "teams" && (
            <div style={{ fontSize: 13, color: "#A59F9A", textAlign: "right", marginTop: 4 }}>
              الفرق تتطلب عدد زوجي من اللاعبين (2 أو 4 أو 6)
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
                  if (m === "teams" && (playerCount === 3 || playerCount === 5)) setPlayerCount(4);
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
                    <div style={{ fontSize: 13, color: "#A59F9A", flexShrink: 0, whiteSpace: "nowrap" }}>
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
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
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

        <div style={{ background: "#F1FAF4", border: "1px solid #E2F4E8", borderRadius: 10, padding: "10px 14px", textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "#1C9245", fontWeight: 700, marginBottom: 2 }}>اللعبة مفتوحة النهاية</div>
          <div style={{ fontSize: 12, color: "#7A736E" }}>تنتهي اللعبة فقط عند الضغط على زر &quot;إنهاء اللعبة&quot;</div>
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
    background: "#FFFFFF",
    display: "flex",
    flexDirection: "column" as const,
    maxWidth: 390,
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
    position: "relative" as const,
  },
  topbar: {
    background: "#0F5F2C",
    padding: "48px 16px 14px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    direction: "rtl" as const,
    flexShrink: 0,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    border: "none", color: "#FFFFFF", fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  } as React.CSSProperties,
  topTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: 800, textAlign: "right" as const },
  topSub: { color: "rgba(255,255,255,0.6)", fontSize: 13, textAlign: "right" as const },
  topBadge: { fontSize: 26, lineHeight: 1 },
  body: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "20px 16px 120px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    direction: "rtl" as const,
    background: "#FFFFFF",
  },
  secLabel: {
    color: "#7A736E",
    fontSize: 13, fontWeight: 700,
    textAlign: "right" as const,
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  toggleStrip: {
    display: "grid",
    background: "#F2F0EE",
    borderRadius: 10, padding: 4, gap: 4,
  },
  toggleBtn: {
    padding: "10px 4px",
    borderRadius: 8, border: "none",
    background: "transparent",
    color: "#7A736E",
    fontSize: 14, fontWeight: 600,
    cursor: "pointer", textAlign: "center" as const,
    fontFamily: "inherit",
  },
  toggleActive: {
    background: "#1C9245",
    color: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(28,146,69,0.3)",
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0,
  } as React.CSSProperties,
  playerInput: {
    flex: 1,
    background: "#FFFFFF",
    border: "1.5px solid #E4E0DD",
    borderRadius: 10, padding: "10px 12px",
    color: "#14110F", fontSize: 15,
    outline: "none", textAlign: "right" as const,
    fontFamily: "inherit", width: "100%",
  },
  savedChip: {
    padding: "7px 14px", borderRadius: 20,
    background: "#FFFBF0",
    border: "1px solid #F5BC22",
    color: "#3A3330", fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
  saveTeamBtn: {
    marginTop: 8, width: "100%", padding: 10,
    background: "transparent",
    border: "1.5px dashed #E4E0DD",
    borderRadius: 10, color: "#7A736E",
    fontSize: 14, cursor: "pointer", fontFamily: "inherit",
  },
  stickyBtn: {
    position: "absolute" as const, bottom: 0, left: 0, right: 0,
    padding: "12px 16px 28px",
    background: "linear-gradient(to top, #FFFFFF 70%, transparent)",
    borderTop: "1px solid #F2F0EE",
  },
  btnPrimary: {
    width: "100%", padding: "16px 0",
    background: "#1C9245", border: "none", borderRadius: 28,
    color: "#FFFFFF", fontSize: 17, fontWeight: 800,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(28,146,69,0.3)",
  },
  btnDisabled: {
    background: "#E4E0DD",
    color: "#A59F9A",
    cursor: "not-allowed",
    boxShadow: "none",
  },
};
