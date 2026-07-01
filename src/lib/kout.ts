export type KoutHokm = "ملزوم" | "5" | "6" | "7" | "8" | "باون";
export type KoutMode = "2v2" | "3v3";

export interface KoutTeam {
  name: string;
  players: string[];
}

export interface KoutRound {
  id: string;
  number: number;
  hakim: string;
  hakimTeam: "A" | "B";
  hokm: KoutHokm;
  result: "win" | "lose";
  deltaA: number;
  deltaB: number;
}

export interface KoutSession {
  id: string;
  mode: KoutMode;
  target: 51 | 101;
  teamA: KoutTeam;
  teamB: KoutTeam;
  rounds: KoutRound[];
  status: "active" | "finished";
  createdAt: string;
}

export interface SavedTeam {
  id: string;
  name: string;
  players: string[];
}

const SCORING: Record<KoutHokm, { win: number; lose: number }> = {
  "ملزوم": { win: 5,  lose: 5  },
  "5":     { win: 5,  lose: 10 },
  "6":     { win: 6,  lose: 12 },
  "7":     { win: 7,  lose: 14 },
  "8":     { win: 8,  lose: 16 },
  "باون":  { win: 36, lose: 18 },
};

export function calcKoutPoints(
  hokm: KoutHokm,
  result: "win" | "lose",
  hakimTeam: "A" | "B"
): { deltaA: number; deltaB: number } {
  const s = SCORING[hokm];
  if (result === "win") {
    return hakimTeam === "A"
      ? { deltaA: s.win, deltaB: 0 }
      : { deltaA: 0, deltaB: s.win };
  } else {
    // losing: points go to the OTHER team
    return hakimTeam === "A"
      ? { deltaA: 0, deltaB: s.lose }
      : { deltaA: s.lose, deltaB: 0 };
  }
}

export function getTeamScores(rounds: KoutRound[]) {
  return rounds.reduce(
    (acc, r) => ({ A: acc.A + r.deltaA, B: acc.B + r.deltaB }),
    { A: 0, B: 0 }
  );
}

// Player stats for game-over screen
export function getPlayerStats(session: KoutSession) {
  const allPlayers = [
    ...session.teamA.players.map((p) => ({ name: p, team: "A" as const })),
    ...session.teamB.players.map((p) => ({ name: p, team: "B" as const })),
  ];

  return allPlayers.map(({ name, team }) => {
    const asHakim = session.rounds.filter((r) => r.hakim === name);
    const won = asHakim
      .filter((r) => r.result === "win")
      .reduce((s, r) => s + (team === "A" ? r.deltaA : r.deltaB), 0);
    const gave = asHakim
      .filter((r) => r.result === "lose")
      .reduce((s, r) => s + (team === "A" ? r.deltaB : r.deltaA), 0);
    return { name, team, won, gave, diff: won - gave };
  });
}

// localStorage helpers
const SESSION_KEY = "kout_sessions";
const SAVED_TEAMS_KEY = "kout_saved_teams";

export function saveSession(session: KoutSession) {
  if (typeof window === "undefined") return;
  const all = getSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.push(session);
  localStorage.setItem(SESSION_KEY, JSON.stringify(all));
}

export function getSessions(): KoutSession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getSession(id: string): KoutSession | null {
  return getSessions().find((s) => s.id === id) ?? null;
}

export function getSavedTeams(): SavedTeam[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_TEAMS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveTeam(team: SavedTeam) {
  if (typeof window === "undefined") return;
  const all = getSavedTeams().filter((t) => t.id !== team.id);
  localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify([team, ...all]));
}
