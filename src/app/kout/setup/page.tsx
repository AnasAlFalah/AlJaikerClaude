"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  KoutMode,
  KoutTeam,
  KoutSession,
  SavedTeam,
  getSavedTeams,
  saveSession,
  saveTeam,
} from "@/lib/kout";

const AVATAR_COLORS = ["#C8102E", "#1B5E38", "#D4A420", "#5B3FA6", "#0077B6", "#E07B39"];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface TeamEditorProps {
  label: string;
  team: KoutTeam;
  playerCount: number;
  savedTeams: SavedTeam[];
  avatarOffset: number;
  onChange: (team: KoutTeam) => void;
}

function TeamEditor({ label, team, playerCount, savedTeams, avatarOffset, onChange }: TeamEditorProps) {
  const setName = (name: string) => onChange({ ...team, name });
  const setPlayer = (i: number, val: string) => {
    const players = [...team.players];
    players[i] = val;
    onChange({ ...team, players });
  };

  const applyTeam = (saved: SavedTeam) => {
    const players = Array.from({ length: playerCount }, (_, i) => saved.players[i] || "");
    onChange({ name: saved.name, players });
  };

  const handleSave = () => {
    if (!team.name.trim()) return;
    saveTeam({ id: generateId(), name: team.name, players: team.players.filter(Boolean) });
    alert("تم حفظ الفريق");
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      borderRadius: 14,
      padding: "14px 14px 10px",
      marginBottom: 12,
    }}>
      {/* Team name */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: AVATAR_COLORS[avatarOffset % AVATAR_COLORS.length],
          flexShrink: 0,
        }} />
        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, whiteSpace: "nowrap" }}>{label}</span>
        <input
          value={team.name}
          onChange={e => setName(e.target.value)}
          placeholder="اسم الفريق"
          dir="rtl"
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: "6px 10px",
            color: "#F8F2E4",
            fontSize: 13,
            fontWeight: 600,
            outline: "none",
            textAlign: "right",
          }}
        />
      </div>

      {/* Saved team chips */}
      {savedTeams.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {savedTeams.map(st => (
            <button
              key={st.id}
              onClick={() => applyTeam(st)}
              style={{
                background: "rgba(212,164,32,0.15)",
                border: "1px solid rgba(212,164,32,0.3)",
                borderRadius: 20,
                padding: "4px 10px",
                color: "#D4A420",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              {st.name}
            </button>
          ))}
        </div>
      )}

      {/* Players */}
      {Array.from({ length: playerCount }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: AVATAR_COLORS[(avatarOffset + i) % AVATAR_COLORS.length],
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {(team.players[i] || "").trim().charAt(0).toUpperCase() || (i + 1)}
          </div>
          <input
            value={team.players[i] || ""}
            onChange={e => setPlayer(i, e.target.value)}
            placeholder={`اللاعب ${i + 1}`}
            dir="rtl"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "7px 10px",
              color: "#F8F2E4",
              fontSize: 13,
              outline: "none",
              textAlign: "right",
            }}
          />
        </div>
      ))}

      {/* Save team button */}
      <button
        onClick={handleSave}
        style={{
          width: "100%",
          marginTop: 8,
          background: "transparent",
          border: "1px solid rgba(212,164,32,0.3)",
          borderRadius: 8,
          padding: "7px 0",
          color: "#D4A420",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        حفظ كفريق جاهز ★
      </button>
    </div>
  );
}

export default function KoutSetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<KoutMode>("2v2");
  const [target, setTarget] = useState<51 | 101>(51);
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);

  const playerCount = mode === "2v2" ? 2 : 3;

  const [teamA, setTeamA] = useState<KoutTeam>({ name: "", players: ["", ""] });
  const [teamB, setTeamB] = useState<KoutTeam>({ name: "", players: ["", ""] });

  useEffect(() => {
    setSavedTeams(getSavedTeams());
  }, []);

  useEffect(() => {
    setTeamA(t => ({ ...t, players: Array.from({ length: playerCount }, (_, i) => t.players[i] || "") }));
    setTeamB(t => ({ ...t, players: Array.from({ length: playerCount }, (_, i) => t.players[i] || "") }));
  }, [playerCount]);

  const canStart = teamA.name.trim() && teamB.name.trim()
    && teamA.players.every(p => p.trim())
    && teamB.players.every(p => p.trim());

  const handleStart = () => {
    const session: KoutSession = {
      id: generateId(),
      mode,
      target,
      teamA: { name: teamA.name.trim(), players: teamA.players.map(p => p.trim()) },
      teamB: { name: teamB.name.trim(), players: teamB.players.map(p => p.trim()) },
      rounds: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };
    saveSession(session);
    router.push(`/kout/${session.id}`);
  };

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
      }}>
        <button
          onClick={() => router.push("/app")}
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
          <div style={{ color: "#F8F2E4", fontSize: 15, fontWeight: 700, textAlign: "right" }}>لعبة جديدة</div>
          <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 10, textAlign: "right" }}>كوت</div>
        </div>
        <div style={{ fontSize: 20 }}>♛</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }}>

        {/* Mode toggle */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "rgba(248,242,228,0.55)", fontSize: 11, textAlign: "right", marginBottom: 8 }}>نظام اللعب</div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: 4, gap: 4,
          }}>
            {(["2v2", "3v3"] as KoutMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: "10px 0",
                  borderRadius: 8, border: "none",
                  background: mode === m ? "#1B5E38" : "transparent",
                  color: mode === m ? "#F8F2E4" : "rgba(248,242,228,0.45)",
                  fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                }}
              >
                {m === "2v2" ? "2 ضد 2" : "3 ضد 3"}
              </button>
            ))}
          </div>
        </div>

        {/* Team A */}
        <TeamEditor
          label="الفريق الأول"
          team={teamA}
          playerCount={playerCount}
          savedTeams={savedTeams}
          avatarOffset={0}
          onChange={setTeamA}
        />

        {/* vs divider */}
        <div style={{ textAlign: "center", color: "rgba(212,164,32,0.6)", fontSize: 13, fontWeight: 700, margin: "4px 0 12px" }}>
          ضد
        </div>

        {/* Team B */}
        <TeamEditor
          label="الفريق الثاني"
          team={teamB}
          playerCount={playerCount}
          savedTeams={savedTeams}
          avatarOffset={3}
          onChange={setTeamB}
        />

        {/* Target score */}
        <div style={{ marginTop: 16 }}>
          <div style={{ color: "rgba(248,242,228,0.55)", fontSize: 11, textAlign: "right", marginBottom: 8 }}>هدف النقاط</div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: 4, gap: 4,
          }}>
            {([51, 101] as const).map(t => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                style={{
                  padding: "10px 0",
                  borderRadius: 8, border: "none",
                  background: target === t ? "#1B5E38" : "transparent",
                  color: target === t ? "#F8F2E4" : "rgba(248,242,228,0.45)",
                  fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: target === t ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start button */}
      <div style={{ padding: "12px 16px 24px", position: "sticky", bottom: 0, background: "#0F3D24" }}>
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            width: "100%",
            padding: "15px 0",
            background: canStart ? "#1B5E38" : "rgba(27,94,56,0.3)",
            border: "none",
            borderRadius: 12,
            color: canStart ? "#F8F2E4" : "rgba(248,242,228,0.3)",
            fontSize: 16,
            fontWeight: 700,
            cursor: canStart ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          ابدأ اللعبة
        </button>
      </div>
    </div>
  );
}
