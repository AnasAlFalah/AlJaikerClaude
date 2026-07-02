export type SpideMode = "individual" | "teams";
export type SpideTarget = 100 | 150 | 200 | 250;
export type SpidePassDirection = "right" | "left" | "none";

export interface SpidePlayer {
  name: string;
  avatarColor: string;
}

export interface SpideTeam {
  name: string;
  players: string[];
}

export interface SpideRoundEntry {
  playerId: number;
  hearts: number;
  hasQueen: boolean;        // ميم السبيت
  queenAnnounced: boolean;  // doubled to 26
  hasDiamond: boolean;      // عشر الديمن
  diamondAnnounced: boolean; // doubled to 20
  ateNothing: boolean;      // ما أكل → -10
}

export interface SpideRound {
  id: string;
  number: number;
  passDirection: SpidePassDirection;
  type: "normal" | "eatAll";
  eatAllWinner?: number; // player index
  entries: SpideRoundEntry[];
  scores: number[]; // delta per player
}

export interface SpideSession {
  id: string;
  mode: SpideMode;
  playerCount: 4 | 5 | 6;
  players: SpidePlayer[];
  teams?: SpideTeam[];
  target: SpideTarget;
  rounds: SpideRound[];
  status: "active" | "finished";
  createdAt: string;
}

export interface SavedSpideTeam {
  id: string;
  name: string;
  players: string[];
  savedAt: string;
}

// Pass direction cycles: right → left → none → repeat
export function getPassDirection(roundNumber: number): SpidePassDirection {
  const cycle = ((roundNumber - 1) % 3);
  if (cycle === 0) return "right";
  if (cycle === 1) return "left";
  return "none";
}

export function passDirectionLabel(dir: SpidePassDirection): string {
  if (dir === "right") return "→ يمين";
  if (dir === "left") return "← يسار";
  return "— بدون";
}

// Calculate points for one player in a normal round
export function calcPlayerPoints(entry: SpideRoundEntry): number {
  if (entry.ateNothing) return -10;
  let pts = entry.hearts;
  if (entry.hasQueen) pts += entry.queenAnnounced ? 26 : 13;
  if (entry.hasDiamond) pts += entry.diamondAnnounced ? 20 : 10;
  return pts;
}

// Calculate scores for a full normal round
export function calcRoundScores(entries: SpideRoundEntry[]): number[] {
  return entries.map(calcPlayerPoints);
}

// Calculate scores for eat-all round
export function calcEatAllScores(winnerIndex: number, playerCount: number): number[] {
  return Array.from({ length: playerCount }, (_, i) =>
    i === winnerIndex ? 0 : 26
  );
}

// Running totals per player across all rounds
export function getPlayerTotals(session: SpideSession): number[] {
  const totals = new Array(session.players.length).fill(0);
  for (const round of session.rounds) {
    round.scores.forEach((s, i) => { totals[i] += s; });
  }
  return totals;
}

// Index of winning player (lowest total)
export function getLeaderIndex(totals: number[]): number {
  return totals.indexOf(Math.min(...totals));
}

// Check if game is over (any player at or above target)
export function isGameOver(totals: number[], target: SpideTarget): boolean {
  return totals.some(t => t >= target);
}

const AVATAR_COLORS = ["#C8102E", "#1B5E38", "#D4A420", "#5B3FA6", "#0077B6", "#E67E22"];
export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// localStorage helpers
const SESSION_PREFIX = "spide_session_";
const SAVED_TEAMS_KEY = "spide_saved_teams";

export function saveSession(session: SpideSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session));
}

export function getSession(id: string): SpideSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${SESSION_PREFIX}${id}`);
  return raw ? JSON.parse(raw) : null;
}

export function getSavedSpideTeams(): SavedSpideTeam[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SAVED_TEAMS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveSpideTeam(team: Omit<SavedSpideTeam, "id" | "savedAt">): void {
  if (typeof window === "undefined") return;
  const teams = getSavedSpideTeams();
  teams.push({ ...team, id: crypto.randomUUID(), savedAt: new Date().toISOString() });
  localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify(teams));
}
