import { getPlayerTotals as getTrixTotals } from "./trix";
import { getTeamScores } from "./kout";
import { getPlayerTotals as getSpideTotals } from "./spide";
import { getPlayerTotals as getHandTotals } from "./hand";
import { getPlayerTotals as getGeneralTotals, getStandings } from "./general";
import type { TrixSession } from "./trix";
import type { KoutSession } from "./kout";
import type { SpideSession } from "./spide";
import type { HandSession } from "./hand";
import type { GeneralSession } from "./general";

export type GameType = "trix" | "kout" | "spide" | "hand" | "general";

export interface HistoryEntry {
  id: string;
  game: GameType;
  status: "active" | "finished";
  createdAt: string;
  playerNames: string[]; // display names
  winnerLabel: string;   // e.g. "أحمد" or "فريق أ"
  roundCount: number;
  summary: string;       // one-liner like "4 لاعبين · 3 جولات"
}

function scanKeys(prefix: string): string[] {
  if (typeof window === "undefined") return [];
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) keys.push(k);
  }
  return keys;
}

function parseSafe<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

// ── Trix ──────────────────────────────────────────────────────────────────────
function trixEntries(): HistoryEntry[] {
  return scanKeys("trix_session_").flatMap(key => {
    const s = parseSafe<TrixSession>(localStorage.getItem(key));
    if (!s) return [];
    const totals = getTrixTotals(s);
    const winnerIdx = totals.indexOf(Math.max(...totals));
    const roundCount = s.kingdoms.reduce((sum, k) => sum + k.rounds.length, 0);
    return [{
      id: s.id, game: "trix" as GameType, status: s.status, createdAt: s.createdAt,
      playerNames: s.players,
      winnerLabel: s.status === "finished" ? s.players[winnerIdx] : "",
      roundCount,
      summary: `${s.playerCount} لاعبين · ${roundCount} جولة`,
    }];
  });
}

// ── Kout ──────────────────────────────────────────────────────────────────────
function koutEntries(): HistoryEntry[] {
  const raw = typeof window !== "undefined" ? localStorage.getItem("kout_sessions") : null;
  const sessions = parseSafe<KoutSession[]>(raw) ?? [];
  return sessions.map(s => {
    const scores = getTeamScores(s.rounds);
    const winnerLabel = s.status === "finished"
      ? (scores.A > scores.B ? s.teamA.name : s.teamB.name)
      : "";
    const allPlayers = [...s.teamA.players, ...s.teamB.players];
    return {
      id: s.id, game: "kout" as GameType, status: s.status, createdAt: s.createdAt,
      playerNames: allPlayers,
      winnerLabel,
      roundCount: s.rounds.length,
      summary: `${s.teamA.name} ${scores.A} - ${scores.B} ${s.teamB.name}`,
    };
  });
}

// ── Spide ─────────────────────────────────────────────────────────────────────
function spideEntries(): HistoryEntry[] {
  return scanKeys("spide_session_").flatMap(key => {
    const s = parseSafe<SpideSession>(localStorage.getItem(key));
    if (!s) return [];
    const totals = getSpideTotals(s);
    const winnerIdx = totals.indexOf(Math.min(...totals)); // lowest score wins
    const playerNames = s.players.map(p => p.name);
    return [{
      id: s.id, game: "spide" as GameType, status: s.status, createdAt: s.createdAt,
      playerNames,
      winnerLabel: s.status === "finished" ? playerNames[winnerIdx] : "",
      roundCount: s.rounds.length,
      summary: `${s.playerCount} لاعبين · ${s.rounds.length} جولة`,
    }];
  });
}

// ── Hand ──────────────────────────────────────────────────────────────────────
function handEntries(): HistoryEntry[] {
  return scanKeys("hand_session_").flatMap(key => {
    const s = parseSafe<HandSession>(localStorage.getItem(key));
    if (!s) return [];
    const totals = getHandTotals(s);
    const winnerIdx = totals.indexOf(Math.min(...totals)); // lowest (most negative) wins
    return [{
      id: s.id, game: "hand" as GameType, status: s.status, createdAt: s.createdAt,
      playerNames: s.players,
      winnerLabel: s.status === "finished" ? s.players[winnerIdx] : "",
      roundCount: s.rounds.length,
      summary: `${s.playerCount} لاعبين · ${s.rounds.length}/${s.roundCount} جولة`,
    }];
  });
}

// ── General ───────────────────────────────────────────────────────────────────
function generalEntries(): HistoryEntry[] {
  return scanKeys("general_session_").flatMap(key => {
    const s = parseSafe<GeneralSession>(localStorage.getItem(key));
    if (!s) return [];
    const totals = getGeneralTotals(s);
    const standings = getStandings(totals, s.winMode);
    return [{
      id: s.id, game: "general" as GameType, status: s.status, createdAt: s.createdAt,
      playerNames: s.players,
      winnerLabel: s.status === "finished" ? s.players[standings[0]] : "",
      roundCount: s.rounds.length,
      summary: `${s.playerCount} لاعبين · ${s.rounds.length} جولة`,
    }];
  });
}

export function getAllHistory(): HistoryEntry[] {
  const all = [
    ...trixEntries(),
    ...koutEntries(),
    ...spideEntries(),
    ...handEntries(),
    ...generalEntries(),
  ];
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getActiveGames(): HistoryEntry[] {
  return getAllHistory().filter(e => e.status === "active");
}

export const GAME_LABELS: Record<GameType, string> = {
  trix: "تريكس",
  kout: "كوت",
  spide: "سبيدة",
  hand: "هند",
  general: "تسجيل عام",
};

export const GAME_COLORS: Record<GameType, string> = {
  trix:    "#5B3FA6",
  kout:    "#C8102E",
  spide:   "#0077B6",
  hand:    "#D4A420",
  general: "#4A7C5A",
};
