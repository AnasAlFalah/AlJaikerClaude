"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveGames, type HistoryEntry, GAME_LABELS, GAME_COLORS } from "@/lib/history";

interface Props { locale: string }

export default function OngoingGames({ locale }: Props) {
  const [games, setGames] = useState<HistoryEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    setGames(getActiveGames());
  }, []);

  if (games.length === 0) {
    return (
      <div style={{
        background: "white", borderRadius: 16, padding: "16px",
        border: "1.5px dashed #DDD", display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ fontSize: 24 }}>🃏</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#AAA" }}>
            {locale === "ar" ? "لا توجد جلسات جارية" : "No ongoing sessions"}
          </div>
          <div style={{ fontSize: 11, color: "#CCC", marginTop: 2 }}>
            {locale === "ar" ? "ابدأ لعبة جديدة من الأسفل" : "Start a new game below"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {games.map(g => (
        <button
          key={g.id}
          onClick={() => router.push(`/${g.game}/${g.id}`)}
          style={{
            width: "100%", background: "white", borderRadius: 16, padding: "12px 14px",
            border: "1.5px solid rgba(76,175,80,0.25)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 12,
            direction: locale === "ar" ? "rtl" : "ltr", textAlign: locale === "ar" ? "right" : "left",
          }}
        >
          {/* Color stripe */}
          <div style={{ width: 4, height: 36, borderRadius: 2, background: GAME_COLORS[g.game], flexShrink: 0 }} />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{
                background: `${GAME_COLORS[g.game]}18`, border: `1px solid ${GAME_COLORS[g.game]}40`,
                color: GAME_COLORS[g.game], fontSize: 10, fontWeight: 700,
                padding: "1px 7px", borderRadius: 5,
              }}>
                {GAME_LABELS[g.game]}
              </span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} />
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>{g.summary}</div>
          </div>

          <div style={{ color: "#BBB", fontSize: 18 }}>{locale === "ar" ? "←" : "→"}</div>
        </button>
      ))}
    </div>
  );
}
