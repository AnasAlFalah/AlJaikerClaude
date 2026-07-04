export type GeneralWinMode = "highest" | "lowest";

export interface GeneralRound {
  id: string;
  number: number;
  scores: number[]; // one per player, same index as session.players
}

export interface GeneralSession {
  id: string;
  playerCount: 2 | 3 | 4 | 5 | 6;
  players: string[];
  winMode: GeneralWinMode;
  rounds: GeneralRound[];
  status: "active" | "finished";
  createdAt: string;
}

const PREFIX = "general_session_";

export function saveSession(session: GeneralSession): void {
  localStorage.setItem(PREFIX + session.id, JSON.stringify(session));
}

export function getSession(id: string): GeneralSession | null {
  try {
    const raw = localStorage.getItem(PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getPlayerTotals(session: GeneralSession): number[] {
  const totals = Array(session.playerCount).fill(0);
  for (const round of session.rounds) {
    round.scores.forEach((s, i) => { totals[i] += s; });
  }
  return totals;
}

// Returns player indices sorted by rank (best first)
export function getStandings(totals: number[], winMode: GeneralWinMode): number[] {
  return totals
    .map((score, idx) => ({ score, idx }))
    .sort((a, b) => winMode === "highest" ? b.score - a.score : a.score - b.score)
    .map(x => x.idx);
}
