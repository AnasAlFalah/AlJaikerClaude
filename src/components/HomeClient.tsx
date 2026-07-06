"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface Props {
  locale: string;
}

export default function HomeClient({ locale }: Props) {
  const { user, profile, loading, logout, updateLang } = useAuth();
  const router = useRouter();

  const FELT = "#1B5E38";
  const IVORY = "#F8F2E4";

  if (loading) return null;

  const handleLangToggle = async () => {
    const next = locale === "ar" ? "en" : "ar";
    if (user) {
      await updateLang(next as "ar" | "en");
    } else {
      document.cookie = `locale=${next};path=/;max-age=31536000`;
      window.location.reload();
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Language toggle */}
      <button
        onClick={handleLangToggle}
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          borderRadius: 8,
          color: IVORY,
          fontSize: 12,
          fontWeight: 700,
          padding: "5px 10px",
          cursor: "pointer",
          letterSpacing: 0.5,
        }}
      >
        {locale === "ar" ? "EN" : "ع"}
      </button>

      {/* Auth button */}
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Avatar / initials */}
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.name}
              style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.25)", cursor: "pointer" }}
              onClick={() => router.push("/profile")}
            />
          ) : (
            <button
              onClick={() => router.push("/profile")}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "rgba(242,208,96,0.2)",
                border: "2px solid rgba(242,208,96,0.35)",
                color: "#F2D060",
                fontSize: 14, fontWeight: 700,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {(profile?.name ?? user.email ?? "؟")[0].toUpperCase()}
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => router.push("/auth")}
          style={{
            background: "rgba(242,208,96,0.15)",
            border: "1.5px solid rgba(242,208,96,0.35)",
            borderRadius: 8,
            color: "#F2D060",
            fontSize: 12,
            fontWeight: 700,
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          {locale === "ar" ? "دخول" : "Login"}
        </button>
      )}
    </div>
  );
}
