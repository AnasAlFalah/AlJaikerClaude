"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

const FELT    = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY   = "#F8F2E4";
const GOLD    = "#F2D060";
const JET     = "#1A1210";

export default function ProfilePage() {
  const t  = useTranslations("profile");
  const tc = useTranslations("common");
  const router = useRouter();
  const { user, profile, loading, logout, updateLang } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]     = useState(profile?.name ?? "");
  const [savingName, setSavingName]   = useState(false);
  const [nameSaved, setNameSaved]     = useState(false);
  const [loggingOut, setLoggingOut]   = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const locale = profile?.lang ?? "ar";
  const dir    = locale === "ar" ? "rtl" : "ltr";

  if (loading) return null;

  // ── Guest view ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", flexDirection: "column", maxWidth: 390, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        <div style={{ background: FELT, padding: "44px 16px 18px", display: "flex", alignItems: "center", gap: 12, direction: dir }}>
          <button onClick={() => router.push("/")} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: IVORY, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {locale === "ar" ? "←" : "→"}
          </button>
          <div style={{ color: IVORY, fontSize: 16, fontWeight: 700 }}>{t("title")}</div>
        </div>

        <div style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16, direction: dir }}>
          {/* Guest banner */}
          <div style={{ background: "rgba(242,208,96,0.1)", border: "1.5px solid rgba(242,208,96,0.25)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>👤</div>
            <div style={{ color: GOLD, fontSize: 15, fontWeight: 700 }}>{t("guestBanner")}</div>
            <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 12 }}>{t("guestBannerSub")}</div>
            <button onClick={() => router.push("/auth")} style={{
              marginTop: 4, padding: "12px 28px", background: GOLD, border: "none",
              borderRadius: 10, color: JET, fontSize: 14, fontWeight: 800, cursor: "pointer",
            }}>
              {t("registerNow")}
            </button>
          </div>

          {/* Language selector (guests can still switch) */}
          <LangRow locale={locale} onSwitch={() => {
            const next = locale === "ar" ? "en" : "ar";
            document.cookie = `locale=${next};path=/;max-age=31536000`;
            window.location.reload();
          }} t={t} />
        </div>
      </div>
    );
  }

  // ── Save name ───────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!nameValue.trim() || !user) return;
    setSavingName(true);
    await setDoc(doc(db, "users", user.uid), { name: nameValue.trim() }, { merge: true });
    setSavingName(false);
    setEditingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push("/");
  };

  const initials = (profile?.name ?? user.email ?? "؟")[0].toUpperCase();

  const memberDate = (() => {
    if (!profile?.createdAt) return "";
    const d = new Date(profile.createdAt);
    return d.toLocaleDateString(locale === "ar" ? "ar-KW" : "en-GB", { year: "numeric", month: "long" });
  })();

  // ── Logged-in view ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", flexDirection: "column", maxWidth: 390, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: FELT, padding: "44px 16px 18px", display: "flex", alignItems: "center", gap: 12, direction: dir }}>
        <button onClick={() => router.push("/")} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: IVORY, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {locale === "ar" ? "←" : "→"}
        </button>
        <div style={{ flex: 1, color: IVORY, fontSize: 16, fontWeight: 700 }}>{t("title")}</div>
      </div>

      <div style={{ flex: 1, padding: "24px 16px 40px", display: "flex", flexDirection: "column", gap: 14, direction: dir }}>

        {/* Avatar + name hero */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(242,208,96,0.3)" }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(242,208,96,0.15)", border: "3px solid rgba(242,208,96,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: GOLD }}>
              {initials}
            </div>
          )}

          {/* Name row */}
          {editingName ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
              <input
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                autoFocus
                placeholder={t("namePlaceholder")}
                style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 12px", color: IVORY, fontSize: 15, outline: "none", fontFamily: "inherit", direction: dir, textAlign: "center" }}
              />
              <button onClick={handleSaveName} disabled={savingName || !nameValue.trim()} style={{ padding: "8px 14px", background: GOLD, border: "none", borderRadius: 8, color: JET, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {savingName ? "..." : tc("save")}
              </button>
              <button onClick={() => { setEditingName(false); setNameValue(profile?.name ?? ""); }} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: IVORY, fontSize: 13, cursor: "pointer" }}>
                {tc("cancel")}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ color: IVORY, fontSize: 18, fontWeight: 700 }}>{profile?.name ?? user.email}</div>
              <button onClick={() => { setEditingName(true); setNameValue(profile?.name ?? ""); }} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, padding: "4px 8px", color: "rgba(248,242,228,0.5)", fontSize: 12, cursor: "pointer" }}>
                ✏️
              </button>
            </div>
          )}

          {nameSaved && <div style={{ color: "#4CAF50", fontSize: 12 }}>✓ {t("nameSaved")}</div>}

          {user.email && <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 12 }}>{user.email}</div>}
          {memberDate && <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 11 }}>{t("memberSince")} {memberDate}</div>}
        </div>

        {/* Language */}
        <LangRow locale={locale} onSwitch={() => updateLang(locale === "ar" ? "en" : "ar")} t={t} />

        {/* Account section */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ padding: "10px 16px", color: "rgba(248,242,228,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: 1, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {t("account")}
          </div>

          {/* Logout */}
          {confirmLogout ? (
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ color: IVORY, fontSize: 13, textAlign: "center" }}>{t("logoutConfirm")}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setConfirmLogout(false)} style={{ flex: 1, padding: "10px 0", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: IVORY, fontSize: 13, cursor: "pointer" }}>
                  {tc("cancel")}
                </button>
                <button onClick={handleLogout} disabled={loggingOut} style={{ flex: 1, padding: "10px 0", background: "#C8102E", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {loggingOut ? "..." : t("logout")}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmLogout(true)} style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: "#FF6B6B", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: locale === "ar" ? "right" : "left", display: "flex", alignItems: "center", gap: 10 }}>
              <span>🚪</span> {t("logout")}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Shared language row ─────────────────────────────────────────────────────
function LangRow({ locale, onSwitch, t }: { locale: string; onSwitch: () => void; t: ReturnType<typeof useTranslations> }) {
  const IVORY = "#F8F2E4";
  const GOLD  = "#F2D060";
  const FELT  = "#1B5E38";

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ padding: "10px 16px", color: "rgba(248,242,228,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: 1, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {t("language")}
      </div>
      <div style={{ padding: 12, display: "flex", gap: 8 }}>
        {(["ar", "en"] as const).map(l => (
          <button key={l} onClick={() => locale !== l && onSwitch()} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
            background: locale === l ? FELT : "rgba(255,255,255,0.06)",
            color: locale === l ? GOLD : IVORY,
            fontWeight: locale === l ? 700 : 400,
            fontSize: 14, cursor: locale === l ? "default" : "pointer",
            outline: locale === l ? `2px solid rgba(242,208,96,0.3)` : "none",
          }}>
            {l === "ar" ? `🇰🇼 ${t("arabic")}` : `🇬🇧 ${t("english")}`}
          </button>
        ))}
      </div>
    </div>
  );
}
