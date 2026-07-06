"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { getDiwanya, joinDiwanya, getMembers, type Diwanya } from "@/lib/diwanya";

const FELT    = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY   = "#F8F2E4";
const GOLD    = "#F2D060";
const JET     = "#1A1210";

export default function JoinPage() {
  const t   = useTranslations("diwanya");
  const tc  = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, profile, loading: authLoading } = useAuth();

  const [diwanya, setDiwanya] = useState<Diwanya | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const locale = profile?.lang ?? "ar";
  const dir    = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (authLoading) return;
    Promise.all([getDiwanya(id), getMembers(id)]).then(([d, members]) => {
      setDiwanya(d);
      setMemberCount(members.length);
      if (user && members.some(m => m.uid === user.uid)) {
        setAlreadyMember(true);
      }
      setFetching(false);
    });
  }, [id, user, authLoading]);

  const handleJoin = async () => {
    if (!user) {
      // Save the intended destination, redirect to auth
      sessionStorage.setItem("joinAfterAuth", id);
      router.push("/auth");
      return;
    }
    setJoining(true);
    await joinDiwanya(id, {
      uid: user.uid,
      name: profile?.name ?? user.email ?? "مستخدم",
      photoURL: profile?.photoURL ?? null,
    });
    setJoined(true);
    setTimeout(() => router.push(`/diwanya/${id}`), 1500);
  };

  if (fetching || authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 14 }}>{tc("loading")}</div>
      </div>
    );
  }

  if (!diwanya) {
    return (
      <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}>
        <div style={{ fontSize: 48 }}>🚫</div>
        <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 15, textAlign: "center" }}>الديوانية غير موجودة</div>
        <button onClick={() => router.push("/app")} style={{ padding: "11px 28px", background: FELT, border: "none", borderRadius: 12, color: IVORY, fontSize: 14, cursor: "pointer" }}>{tc("back")}</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: FELT_DK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, maxWidth: 390, margin: "0 auto", fontFamily: "system-ui,-apple-system,sans-serif", direction: dir }}>

      <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 24, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>

        {/* Icon */}
        <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(242,208,96,0.12)", border: "2px solid rgba(242,208,96,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>
          🏡
        </div>

        <div>
          <div style={{ color: "rgba(248,242,228,0.5)", fontSize: 13 }}>{t("joinDesc")}</div>
          <div style={{ color: GOLD, fontSize: 22, fontWeight: 900, marginTop: 6 }}>{diwanya.name}</div>
          <div style={{ color: "rgba(248,242,228,0.3)", fontSize: 12, marginTop: 4 }}>{memberCount} {t("membersCount")}</div>
        </div>

        {joined ? (
          <div style={{ padding: "14px 28px", background: "rgba(76,175,80,0.15)", border: "1.5px solid rgba(76,175,80,0.3)", borderRadius: 12, color: "#4CAF50", fontSize: 15, fontWeight: 700 }}>
            ✓ {t("joined")}
          </div>
        ) : alreadyMember ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <div style={{ padding: "12px 16px", background: "rgba(242,208,96,0.1)", borderRadius: 10, color: GOLD, fontSize: 13 }}>
              {t("alreadyMember")}
            </div>
            <button onClick={() => router.push(`/diwanya/${id}`)} style={{ width: "100%", padding: "13px 0", background: GOLD, border: "none", borderRadius: 12, color: JET, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
              {locale === "ar" ? "فتح الديوانية" : "Open Diwanya"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <button onClick={handleJoin} disabled={joining} style={{ width: "100%", padding: "14px 0", background: GOLD, border: "none", borderRadius: 12, color: JET, fontSize: 16, fontWeight: 800, cursor: joining ? "not-allowed" : "pointer", opacity: joining ? 0.7 : 1 }}>
              {joining ? tc("loading") : t("joinBtn")}
            </button>
            {!user && (
              <div style={{ color: "rgba(248,242,228,0.35)", fontSize: 12 }}>
                {t("loginToJoin")}
              </div>
            )}
            <button onClick={() => router.push("/app")} style={{ background: "transparent", border: "none", color: "rgba(248,242,228,0.3)", fontSize: 13, cursor: "pointer" }}>
              {locale === "ar" ? "متابعة كضيف" : "Continue as Guest"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
