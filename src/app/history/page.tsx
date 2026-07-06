"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getAllHistory, getActiveGames, type HistoryEntry, type GameType, GAME_LABELS, GAME_COLORS } from "@/lib/history";

const FELT    = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY   = "#F8F2E4";
const GOLD    = "#F2D060";
const JET     = "#1A1210";

type Filter = "all" | "active" | "finished" | GameType;

function formatDate(iso: string, locale: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "ar" ? "ar-KW" : "en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return ""; }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function GameBadge({ game }: { game: GameType }) {
  return (
    <span style={{
      background: `${GAME_COLORS[game]}22`,
      border: `1px solid ${GAME_COLORS[game]}44`,
      color: GAME_COLORS[game],
      fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 6,
      letterSpacing: 0.5,
    }}>
      {GAME_LABELS[game]}
    </span>
  );
}

function StatusDot({ status }: { status: "active" | "finished" }) {
  return (
    <span style={{
      width: 6, height: 6, borderRadius: "50%", display: "inline-block",
      background: status === "active" ? "#4CAF50" : "rgba(248,242,228,0.25)",
      animation: status === "active" ? "livepulse 1.5s infinite" : "none",
      flexShrink: 0,
    }} />
  );
}

function HistoryCard({ entry, locale, onTap }: { entry: HistoryEntry; locale: string; onTap: () => void }) {
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <button
      onClick={onTap}
      style={{
        width: "100%", background: entry.status === "active" ? "rgba(76,175,80,0.06)" : "rgba(255,255,255,0.04)",
        border: entry.status === "active" ? "1.5px solid rgba(76,175,80,0.2)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "14px 16px", cursor: "pointer",
        display: "flex", alignItems: "flex-start", gap: 12, direction: dir, textAlign: "right",
      }}
    >
      {/* Game color stripe */}
      <div style={{
        width: 4, borderRadius: 2, alignSelf: "stretch", flexShrink: 0,
        background: GAME_COLORS[entry.game],
      }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <GameBadge game={entry.game} />
          <StatusDot status={entry.status} />
          {entry.status === "active" && (
            <span style={{ color: "#4CAF50", fontSize: 10, fontWeight: 700 }}>
              {locale === "ar" ? "جارية" : "Active"}
            </span>
          )}
        </div>

        {/* Summary */}
        <div style={{ color: "rgba(248,242,228,0.6)", fontSize: 12 }}>{entry.summary}</div>

        {/* Players */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {entry.playerNames.slice(0, 5).map((name, i) => (
            <span key={i} style={{
              background: "rgba(255,255,255,0.06)", borderRadius: 6,
              padding: "2px 8px", color: "rgba(248,242,228,0.7)", fontSize: 11,
            }}>
              {name}
            </span>
          ))}
          {entry.playerNames.length > 5 && (
            <span style={{ color: "rgba(248,242,228,0.35)", fontSize: 11 }}>+{entry.playerNames.length - 5}</span>
          )}
        </div>

        {/* Winner */}
        {entry.winnerLabel && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13 }}>🏆</span>
            <span style={{ color: GOLD, fontSize: 13, fontWeight: 700 }}>{entry.winnerLabel}</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
        <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 10 }}>{formatDate(entry.createdAt, locale)}</div>
        <div style={{ color: "rgba(248,242,228,0.2)", fontSize: 10 }}>{formatTime(entry.createdAt)}</div>
        <div style={{ color: "rgba(248,242,228,0.2)", fontSize: 18, marginTop: 4 }}>
          {locale === "ar" ? "←" : "→"}
        </div>
      </div>
    </button>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const locale = profile?.lang ?? "ar";
  const dir    = locale === "ar" ? "rtl" : "ltr";

  const [all, setAll]       = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setAll(getAllHistory());
  }, []);

  const active   = all.filter(e => e.status === "active");
  const finished = all.filter(e => e.status === "finished");

  const filtered = filter === "all"      ? all
    : filter === "active"   ? active
    : filter === "finished" ? finished
    : all.filter(e => e.game === filter);

  const gameTypes: GameType[] = ["trix", "kout", "spide", "hand", "general"];
  const presentGames = gameTypes.filter(g => all.some(e => e.game === g));

  const handleTap = (entry: HistoryEntry) => {
    router.push(`/${entry.game}/${entry.id}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", flexDirection: "column", maxWidth: 390, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: FELT, padding: "44px 16px 16px", display: "flex", alignItems: "center", gap: 12, direction: dir }}>
        <button onClick={() => router.push("/")} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: IVORY, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {locale === "ar" ? "←" : "→"}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: IVORY, fontSize: 16, fontWeight: 700 }}>{locale === "ar" ? "السجل" : "History"}</div>
          <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, marginTop: 1 }}>
            {all.length} {locale === "ar" ? "لعبة" : "games"} · {active.length} {locale === "ar" ? "جارية" : "active"}
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ background: FELT, padding: "0 16px 14px", display: "flex", gap: 8, overflowX: "auto", direction: dir }}>
        {([
          { key: "all",      label: locale === "ar" ? "الكل" : "All" },
          { key: "active",   label: locale === "ar" ? "جارية" : "Active" },
          { key: "finished", label: locale === "ar" ? "منتهية" : "Finished" },
          ...presentGames.map(g => ({ key: g, label: GAME_LABELS[g] })),
        ] as { key: Filter; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none",
              background: filter === key ? GOLD : "rgba(255,255,255,0.1)",
              color: filter === key ? JET : "rgba(248,242,228,0.6)",
              fontSize: 12, fontWeight: filter === key ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {label}
            {key === "active" && active.length > 0 && (
              <span style={{ marginRight: locale === "ar" ? 4 : 0, marginLeft: locale === "en" ? 4 : 0, background: "#4CAF50", color: "#fff", borderRadius: "50%", padding: "0 5px", fontSize: 10, fontWeight: 700 }}>
                {active.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 10, direction: dir }}>

        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingTop: 60, textAlign: "center" }}>
            <div style={{ fontSize: 52 }}>🃏</div>
            <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 15, fontWeight: 600 }}>
              {locale === "ar" ? "لا توجد ألعاب بعد" : "No games yet"}
            </div>
            <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 13 }}>
              {locale === "ar" ? "ابدأ لعبة من الصفحة الرئيسية" : "Start a game from the home screen"}
            </div>
            <button onClick={() => router.push("/")} style={{ marginTop: 8, padding: "12px 28px", background: GOLD, border: "none", borderRadius: 12, color: JET, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              {locale === "ar" ? "الصفحة الرئيسية" : "Home"}
            </button>
          </div>
        ) : (
          filtered.map(entry => (
            <HistoryCard key={entry.id} entry={entry} locale={locale} onTap={() => handleTap(entry)} />
          ))
        )}

      </div>

      <style>{`
        @keyframes livepulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
      `}</style>
    </div>
  );
}
