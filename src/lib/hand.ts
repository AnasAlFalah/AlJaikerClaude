export type HandRoundCount = 7 | 9;

// Winner score → matching loser penalty
export const WIN_VALUES = [-30, -60, -120, -240] as const;
export type HandWinValue = typeof WIN_VALUES[number];

export const LOSER_PENALTY: Record<HandWinValue, number> = {
  [-30]: 100,
  [-60]: 200,
  [-120]: 300,
  [-240]: 400,
};

export interface HandRoundScore {
  playerId: number;   // index into session.players
  score: number;      // negative for winner, positive (or custom) for losers
  isWinner: boolean;
  hasCardsInHand: boolean; // loser override
}

export interface HandRound {
  id: string;
  number: number;
  winnerIdx: number;
  winValue: HandWinValue;
  scores: HandRoundScore[]; // one per player
}

export interface HandSession {
  id: string;
  playerCount: 2 | 3 | 4 | 5;
  players: string[];
  roundCount: HandRoundCount;
  rounds: HandRound[];
  status: "active" | "finished";
  createdAt: string;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const PREFIX = "hand_session_";

export function saveSession(session: HandSession): void {
  localStorage.setItem(PREFIX + session.id, JSON.stringify(session));
}

export function getSession(id: string): HandSession | null {
  try {
    const raw = localStorage.getItem(PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Score helpers ─────────────────────────────────────────────────────────────

export function getPlayerTotals(session: HandSession): number[] {
  const totals = Array(session.playerCount).fill(0);
  for (const round of session.rounds) {
    for (const s of round.scores) {
      totals[s.playerId] += s.score;
    }
  }
  return totals;
}

// Returns player indices sorted by total score ascending (lowest = best)
export function getStandings(totals: number[]): number[] {
  return totals
    .map((score, idx) => ({ score, idx }))
    .sort((a, b) => a.score - b.score)
    .map(x => x.idx);
}

export function isGameOver(session: HandSession): boolean {
  return session.rounds.length >= session.roundCount;
}

// Stats for game-over screen
export interface HandPlayerStats {
  idx: number;
  name: string;
  total: number;
  wins: number;        // how many rounds they won
  highestWin: HandWinValue | null; // most negative win value (biggest win)
}

export function getPlayerStats(session: HandSession): HandPlayerStats[] {
  const totals = getPlayerTotals(session);
  return session.players.map((name, idx) => {
    const winRounds = session.rounds.filter(r => r.winnerIdx === idx);
    const winValues = winRounds.map(r => r.winValue);
    const highestWin = winValues.length > 0
      ? (winValues.sort((a, b) => a - b)[0] as HandWinValue)
      : null;
    return {
      idx,
      name,
      total: totals[idx],
      wins: winRounds.length,
      highestWin,
    };
  });
}
