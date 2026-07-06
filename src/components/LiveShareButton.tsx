"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { useLiveShare } from "@/hooks/useLiveShare";
import type { LiveGameType } from "@/lib/live-share";

interface Props {
  sessionId: string;
  game: LiveGameType;
  getData: () => unknown | null;
}

const FELT    = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY   = "#F8F2E4";
const GOLD    = "#F2D060";
const JET     = "#1A1210";

export default function LiveShareButton({ sessionId, game, getData }: Props) {
  const { isSharing, startSharing, stopSharing } = useLiveShare({ sessionId, game, getData });
  const [showModal, setShowModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const viewUrl = typeof window !== "undefined"
    ? `${window.location.origin}/view/${sessionId}`
    : `https://aljaiker.com/view/${sessionId}`;

  const openShare = async () => {
    if (!isSharing) startSharing();
    const url = await QRCode.toDataURL(viewUrl, {
      width: 260, margin: 2,
      color: { dark: "#0F3D24", light: "#F8F2E4" },
    });
    setQrDataUrl(url);
    setShowModal(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(viewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStop = () => {
    stopSharing();
    setShowModal(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={openShare}
        title="مشاركة مباشرة"
        style={{
          position: "fixed",
          bottom: 24,
          left: 16,
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: isSharing ? "#C8102E" : FELT,
          border: isSharing ? "2px solid rgba(200,16,46,0.5)" : "2px solid rgba(242,208,96,0.3)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          cursor: "pointer",
          zIndex: 50,
          transition: "background 0.2s",
        }}
      >
        {isSharing ? "📡" : "📺"}
      </button>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100, padding: "0 0 20px" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: IVORY, borderRadius: "24px 24px 16px 16px", padding: 24, width: "100%", maxWidth: 390, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
          >
            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E53935", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <span style={{ color: JET, fontSize: 14, fontWeight: 800 }}>بث مباشر</span>
              <span style={{ color: "#888", fontSize: 12 }}>Live Score</span>
            </div>

            <div style={{ color: "#555", fontSize: 12, textAlign: "center", direction: "rtl" }}>
              شارك هذا الرمز مع من يريد متابعة النقاط
            </div>

            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR" style={{ width: 200, height: 200, borderRadius: 12 }} />
            )}

            <div style={{ background: "rgba(15,61,36,0.07)", borderRadius: 8, padding: "8px 12px", color: "#333", fontSize: 10, wordBreak: "break-all", textAlign: "center", direction: "ltr", width: "100%", boxSizing: "border-box" }}>
              {viewUrl}
            </div>

            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button onClick={copyLink} style={{ flex: 1, padding: "12px 0", background: FELT, border: "none", borderRadius: 12, color: IVORY, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {copied ? "✓ تم النسخ" : "🔗 نسخ الرابط"}
              </button>
              <button onClick={handleStop} style={{ flex: 1, padding: "12px 0", background: "rgba(200,16,46,0.1)", border: "1px solid rgba(200,16,46,0.3)", borderRadius: 12, color: "#C8102E", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                ⏹ إيقاف البث
              </button>
            </div>

            <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "#AAA", fontSize: 13, cursor: "pointer" }}>
              إغلاق
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
