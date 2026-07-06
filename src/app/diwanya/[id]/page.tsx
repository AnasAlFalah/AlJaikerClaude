"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { useAuth } from "@/lib/auth-context";
import { getDiwanya, getMembers, leaveDiwanya, promoteToAdmin, type Diwanya, type DiwanyaMember } from "@/lib/diwanya";

const FELT    = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY   = "#F8F2E4";
const GOLD    = "#F2D060";
const JET     = "#1A1210";

const ROLE_COLOR: Record<string, string> = {
  founder: "rgba(242,208,96,0.85)",
  admin:   "rgba(100,180,100,0.85)",
  member:  "rgba(248,242,228,0.35)",
};

export default function DiwanyaDetailPage() {
  const t   = useTranslations("diwanya");
  const tc  = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, profile } = useAuth();

  const [diwanya, setDiwanya]   = useState<Diwanya | null>(null);
  const [members, setMembers]   = useState<DiwanyaMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showQR, setShowQR]     = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [leaving, setLeaving]   = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const locale = profile?.lang ?? "ar";
  const dir    = locale === "ar" ? "rtl" : "ltr";
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${id}` : `https://aljaiker.com/join/${id}`;

  useEffect(() => {
    Promise.all([getDiwanya(id), getMembers(id)]).then(([d, m]) => {
      setDiwanya(d);
      setMembers(m);
      setLoading(false);
    });
  }, [id]);

  const openQR = async () => {
    const url = await QRCode.toDataURL(joinUrl, { width: 260, margin: 2, color: { dark: "#0F3D24", light: "#F8F2E4" } });
    setQrDataUrl(url);
    setShowQR(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (!user) return;
    setLeaving(true);
    await leaveDiwanya(id, user.uid);
    router.push("/diwanya");
  };

  const handlePromote = async (uid: string) => {
    await promoteToAdmin(id, uid);
    setMembers(prev => prev.map(m => m.uid === uid ? { ...m, role: "admin" } : m));
  };

  const myRole = members.find(m => m.uid === user?.uid)?.role;
  const canManage = myRole === "founder" || myRole === "admin";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 14 }}>{tc("loading")}</div>
      </div>
    );
  }

  if (!diwanya) {
    return (
      <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 15 }}>الديوانية غير موجودة</div>
        <button onClick={() => router.push("/diwanya")} style={{ background: FELT, border: "none", borderRadius: 10, padding: "10px 22px", color: IVORY, cursor: "pointer", fontSize: 14 }}>{tc("back")}</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", flexDirection: "column", maxWidth: 390, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: FELT, padding: "44px 16px 18px", display: "flex", alignItems: "center", gap: 12, direction: dir }}>
        <button onClick={() => router.push("/diwanya")} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: IVORY, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {locale === "ar" ? "←" : "→"}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: IVORY, fontSize: 16, fontWeight: 700 }}>{diwanya.name}</div>
          <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 11, marginTop: 1 }}>{members.length} {t("membersCount")}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 16px 40px", display: "flex", flexDirection: "column", gap: 14, direction: dir }}>

        {/* Invite card */}
        <div style={{ background: "rgba(242,208,96,0.08)", border: "1.5px solid rgba(242,208,96,0.2)", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ color: GOLD, fontSize: 13, fontWeight: 700 }}>{t("invite")}</div>
          <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 12 }}>{t("inviteDesc")}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={openQR} style={{ flex: 1, padding: "11px 0", background: GOLD, border: "none", borderRadius: 10, color: JET, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              📱 {t("showQR")}
            </button>
            <button onClick={copyLink} style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: linkCopied ? "#4CAF50" : IVORY, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {linkCopied ? `✓ ${t("linkCopied")}` : `🔗 ${t("copyLink")}`}
            </button>
          </div>
        </div>

        {/* Members list */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ padding: "10px 16px", color: "rgba(248,242,228,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: 1, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {t("members")} ({members.length})
          </div>
          {members
            .sort((a, b) => {
              const order = { founder: 0, admin: 1, member: 2 };
              return order[a.role] - order[b.role];
            })
            .map((m, i) => (
            <div key={m.uid} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < members.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              {/* Avatar */}
              {m.photoURL ? (
                <img src={m.photoURL} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "rgba(248,242,228,0.6)", flexShrink: 0 }}>
                  {(m.name)[0]?.toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ color: IVORY, fontSize: 14, fontWeight: m.uid === user?.uid ? 700 : 500 }}>
                  {m.name}{m.uid === user?.uid ? ` (${locale === "ar" ? "أنت" : "You"})` : ""}
                </div>
                <div style={{ color: ROLE_COLOR[m.role], fontSize: 11, marginTop: 1 }}>
                  {t(m.role as "founder" | "admin" | "member")}
                </div>
              </div>
              {/* Promote button (founder/admin can promote regular members) */}
              {canManage && m.role === "member" && m.uid !== user?.uid && (
                <button onClick={() => handlePromote(m.uid)} style={{ padding: "5px 10px", background: "rgba(100,180,100,0.12)", border: "1px solid rgba(100,180,100,0.25)", borderRadius: 8, color: "rgba(100,200,100,0.8)", fontSize: 11, cursor: "pointer" }}>
                  ↑ {t("promoteAdmin")}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Leave */}
        {myRole && myRole !== "founder" && (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
            {confirmLeave ? (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ color: IVORY, fontSize: 13, textAlign: "center" }}>{t("leaveConfirm")}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setConfirmLeave(false)} style={{ flex: 1, padding: "10px 0", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: IVORY, fontSize: 13, cursor: "pointer" }}>{tc("cancel")}</button>
                  <button onClick={handleLeave} disabled={leaving} style={{ flex: 1, padding: "10px 0", background: "#C8102E", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {leaving ? "..." : t("leave")}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmLeave(true)} style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: "#FF6B6B", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: locale === "ar" ? "right" : "left", display: "flex", alignItems: "center", gap: 10 }}>
                🚪 {t("leave")}
              </button>
            )}
          </div>
        )}

      </div>

      {/* QR Modal */}
      {showQR && (
        <div onClick={() => setShowQR(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#F8F2E4", borderRadius: 24, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 300, width: "100%" }}>
            <div style={{ color: JET, fontSize: 16, fontWeight: 800, textAlign: "center" }}>{diwanya.name}</div>
            <div style={{ color: "#555", fontSize: 12, textAlign: "center" }}>{t("inviteDesc")}</div>
            {qrDataUrl && <img src={qrDataUrl} alt="QR" style={{ width: 220, height: 220, borderRadius: 12 }} />}
            <div style={{ background: "rgba(15,61,36,0.08)", borderRadius: 8, padding: "8px 12px", color: "#333", fontSize: 10, wordBreak: "break-all", textAlign: "center", direction: "ltr" }}>
              {joinUrl}
            </div>
            <button onClick={copyLink} style={{ width: "100%", padding: "12px 0", background: FELT, border: "none", borderRadius: 12, color: IVORY, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {linkCopied ? `✓ ${t("linkCopied")}` : `🔗 ${t("copyLink")}`}
            </button>
            <button onClick={() => setShowQR(false)} style={{ background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer" }}>
              {tc("close")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
