export type TrixMode = "individual" | "teams";
export type TrixDeclType = "trix" | "hearts" | "queens" | "diamonds" | "eat";

export const ALL_DECL: TrixDeclType[] = ["trix", "hearts", "queens", "diamonds", "eat"];

export const TRIX_SCORES_4 = [-200, -150, -100, -50];
export const TRIX_SCORES_5 = [-250, -200, -150, -100, -50];
export const DIAMONDS_PER = 10;
export const EAT_PER = 15;
export const HEARTS_PENALTY = 75;
export const QUEEN_PTS = 25;

export function getTrixScores(n: number): number[] {
  return n === 5 ? TRIX_SCORES_5 : TRIX_SCORES_4;
}

// ── Result types ─────────────────────────────────────────────────────────────

export interface TrixTrixResult {
  type: "trix";
  rankings: number[];
  scores: number[];
}

export interface TrixHeartsResult {
  type: "hearts";
  loserIdx: number;
  kingDoubled: boolean; // king of hearts taken → penalty ×2
  scores: number[];
}

export interface TrixQueenEntry {
  suit: "spades" | "hearts" | "diamonds" | "clubs";
  takerIdx: number;
  announced: boolean;
  announcerIdx: number | null;
}

export interface TrixQueensResult {
  type: "queens";
  queens: TrixQueenEntry[];
  scores: number[];
}

export interface TrixDistResult {
  type: "diamonds" | "eat";
  counts: number[];
  scores: number[];
}

export type TrixResult = TrixTrixResult | TrixHeartsResult | TrixQueensResult | TrixDistResult;

// ── Round & Kingdom ───────────────────────────────────────────────────────────

export interface TrixRound {
  id: string;
  results: TrixResult[];
}

export interface TrixKingdom {
  kingIdx: number;
  rounds: TrixRound[];
  done: TrixDeclType[];
}

// ── Session ───────────────────────────────────────────────────────────────────

export interface TrixSession {
  id: string;
  playerCount: 4 | 5;
  players: string[];
  mode: TrixMode;
  teamA: number[];
  teamB: number[];
  kingdoms: TrixKingdom[];
  currentKingdomIdx: number;
  status: "active" | "finished";
  createdAt: string;
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function calcTrixScores(rankings: number[], playerCount: number): number[] {
  const pts = getTrixScores(playerCount);
  const scores = Array(playerCount).fill(0);
  rankings.forEach((pIdx, rank) => { scores[pIdx] = pts[rank]; });
  return scores;
}

export function calcHeartsScores(loserIdx: number, playerCount: number, kingDoubled: boolean): number[] {
  const scores = Array(playerCount).fill(0);
  scores[loserIdx] = kingDoubled ? HEARTS_PENALTY * 2 : HEARTS_PENALTY;
  return scores;
}

export function calcQueensScores(queens: TrixQueenEntry[], playerCount: number): number[] {
  const scores = Array(playerCount).fill(0);
  for (const q of queens) {
    const pts = q.announced ? QUEEN_PTS * 2 : QUEEN_PTS;
    scores[q.takerIdx] += pts;
    if (q.announced && q.announcerIdx !== null) {
      scores[q.announcerIdx] -= QUEEN_PTS;
    }
  }
  return scores;
}

export function calcDistScores(counts: number[], ptsEach: number): number[] {
  return counts.map(c => c * ptsEach);
}

// ── Totals ────────────────────────────────────────────────────────────────────

export function getPlayerTotals(session: TrixSession): number[] {
  const totals = Array(session.playerCount).fill(0);
  for (const k of session.kingdoms) {
    for (const r of k.rounds) {
      for (const res of r.results) {
        res.scores.forEach((s, i) => { totals[i] += s; });
      }
    }
  }
  return totals;
}

export function getKingdomTotals(k: TrixKingdom, n: number): number[] {
  const totals = Array(n).fill(0);
  for (const r of k.rounds) {
    for (const res of r.results) {
      res.scores.forEach((s, i) => { totals[i] += s; });
    }
  }
  return totals;
}

export function getPlayerStatsByDecl(session: TrixSession): Record<TrixDeclType, number[]> {
  const out: Record<TrixDeclType, number[]> = {
    trix: Array(session.playerCount).fill(0),
    hearts: Array(session.playerCount).fill(0),
    queens: Array(session.playerCount).fill(0),
    diamonds: Array(session.playerCount).fill(0),
    eat: Array(session.playerCount).fill(0),
  };
  for (const k of session.kingdoms) {
    for (const r of k.rounds) {
      for (const res of r.results) {
        res.scores.forEach((s, i) => { out[res.type][i] += s; });
      }
    }
  }
  return out;
}

// ── localStorage ──────────────────────────────────────────────────────────────

const PFX = "trix_session_";
export function saveSession(s: TrixSession): void {
  localStorage.setItem(PFX + s.id, JSON.stringify(s));
}
export function getSession(id: string): TrixSession | null {
  try {
    const r = localStorage.getItem(PFX + id);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}
