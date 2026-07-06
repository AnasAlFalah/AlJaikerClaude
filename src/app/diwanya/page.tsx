"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { createDiwanya, getUserDiwanyas, type Diwanya } from "@/lib/diwanya";

const FELT    = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY   = "#F8F2E4";
const GOLD    = "#F2D060";
const JET     = "#1A1210";

export default function DiwanyaListPage() {
  const t   = useTranslations("diwanya");
  const tc  = useTranslations("common");
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [diwanyas, setDiwanyas]   = useState<Diwanya[]>([]);
  const [fetching, setFetching]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]     = useState("");
  const [creating, setCreating]   = useState(false);

  const locale = profile?.lang ?? "ar";
  const dir    = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (!user) { setFetching(false); return; }
    getUserDiwanyas(user.uid).then(list => {
      setDiwanyas(list);
      setFetching(false);
    });
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    const id = await createDiwanya(newName, {
      uid: user.uid,
      name: profile?.name ?? user.email ?? "مستخدم",
      photoURL: profile?.photoURL ?? null,
    });
    router.push(`/diwanya/${id}`);
  };

  if (loading || fetching) {
    return (
      <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 14 }}>{tc("loading")}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", flexDirection: "column", maxWidth: 390, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: FELT, padding: "44px 16px 18px", display: "flex", alignItems: "center", gap: 12, direction: dir }}>
        <button onClick={() => router.push("/")} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: IVORY, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {locale === "ar" ? "←" : "→"}
        </button>
        <div style={{ flex: 1, color: IVORY, fontSize: 16, fontWeight: 700 }}>{t("myDiwanyas")}</div>
        {user && (
          <button onClick={() => setShowCreate(true)} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(242,208,96,0.2)", border: "1.5px solid rgba(242,208,96,0.35)", color: GOLD, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
            +
          </button>
        )}
      </div>

      <div style={{ flex: 1, padding: "20px 16px 40px", display: "flex", flexDirection: "column", gap: 12, direction: dir }}>

        {/* Requires login */}
        {!user && (
          <div style={{ background: "rgba(242,208,96,0.08)", border: "1.5px solid rgba(242,208,96,0.2)", borderRadius: 16, padding: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 36 }}>🏡</div>
            <div style={{ color: GOLD, fontSize: 15, fontWeight: 700 }}>{t("requiresLogin")}</div>
            <button onClick={() => router.push("/auth")} style={{ padding: "11px 28px", background: GOLD, border: "none", borderRadius: 10, color: JET, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              {tc("continue")}
            </button>
          </div>
        )}

        {/* Create sheet */}
        {showCreate && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: GOLD, fontSize: 14, fontWeight: 700 }}>{t("createDiwanya")}</div>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder={t("namePlaceholder")}
              style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "11px 14px", color: IVORY, fontSize: 15, outline: "none", fontFamily: "inherit", direction: dir, width: "100%", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowCreate(false); setNewName(""); }} style={{ flex: 1, padding: "11px 0", background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, color: IVORY, fontSize: 14, cursor: "pointer" }}>
                {tc("cancel")}
              </button>
              <button onClick={handleCreate} disabled={creating || !newName.trim()} style={{ flex: 2, padding: "11px 0", background: creating || !newName.trim() ? "rgba(242,208,96,0.3)" : GOLD, border: "none", borderRadius: 10, color: JET, fontSize: 14, fontWeight: 800, cursor: creating || !newName.trim() ? "not-allowed" : "pointer" }}>
                {creating ? t("creating") : t("create")}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {user && !fetching && diwanyas.length === 0 && !showCreate && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingTop: 40, textAlign: "center" }}>
            <div style={{ fontSize: 52 }}>🏡</div>
            <div style={{ color: "rgba(248,242,228,0.6)", fontSize: 15, fontWeight: 600 }}>{t("noDiwanyas")}</div>
            <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 13 }}>{t("noDiwanyasSub")}</div>
            <button onClick={() => setShowCreate(true)} style={{ marginTop: 8, padding: "13px 32px", background: GOLD, border: "none", borderRadius: 12, color: JET, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              {t("createDiwanya")}
            </button>
          </div>
        )}

        {/* Diwanya cards */}
        {diwanyas.map(d => (
          <button key={d.id} onClick={() => router.push(`/diwanya/${d.id}`)} style={{
            width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, padding: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 14, textAlign: "right",
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(242,208,96,0.12)", border: "2px solid rgba(242,208,96,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              🏡
            </div>
            <div style={{ flex: 1, textAlign: locale === "ar" ? "right" : "left" }}>
              <div style={{ color: IVORY, fontSize: 15, fontWeight: 700 }}>{d.name}</div>
              <div style={{ color: "rgba(248,242,228,0.4)", fontSize: 12, marginTop: 2 }}>
                {d.founderId === user?.uid ? t("founder") : t("member")}
              </div>
            </div>
            <div style={{ color: "rgba(248,242,228,0.25)", fontSize: 20 }}>{locale === "ar" ? "←" : "→"}</div>
          </button>
        ))}

      </div>
    </div>
  );
}
