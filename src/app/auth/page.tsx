"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";

const FELT = "#1B5E38";
const FELT_DK = "#0F3D24";
const IVORY = "#F8F2E4";
const IVORY_DK = "#EDE3D0";
const IVORY_MID = "#E0D4BC";
const JET = "#1A1210";
const CRIMSON = "#C8102E";
const GOLD = "#D4A420";

type Mode = "login" | "register";

export default function AuthPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const firebaseErrorMap: Record<string, string> = {
    "auth/email-already-in-use": t("emailInUse"),
    "auth/invalid-email": t("invalidEmail"),
    "auth/wrong-password": t("wrongPassword"),
    "auth/user-not-found": t("userNotFound"),
    "auth/weak-password": t("weakPassword"),
  };

  const handleSubmit = async () => {
    setError("");
    if (mode === "register") {
      if (!name.trim()) { setError(t("name") + " مطلوب"); return; }
      if (password !== confirmPassword) { setError(t("passwordMismatch")); return; }
      if (password.length < 6) { setError(t("weakPassword")); return; }
    }
    setLoading(true);
    try {
      if (mode === "login") await loginWithEmail(email, password);
      else await registerWithEmail(email, password, name.trim());
      const joinId = sessionStorage.getItem("joinAfterAuth");
      if (joinId) { sessionStorage.removeItem("joinAfterAuth"); router.push(`/join/${joinId}`); }
      else router.push("/app");
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      setError(firebaseErrorMap[code] ?? tc("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      const joinId = sessionStorage.getItem("joinAfterAuth");
      if (joinId) { sessionStorage.removeItem("joinAfterAuth"); router.push(`/join/${joinId}`); }
      else router.push("/app");
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      setError(firebaseErrorMap[code] ?? tc("error"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", background: "#fff",
    border: `1.5px solid ${IVORY_MID}`,
    borderRadius: 10, padding: "12px 14px",
    fontSize: 15, color: JET, outline: "none",
    fontFamily: "inherit", direction: "rtl" as const,
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{
      minHeight: "100vh", background: FELT_DK,
      display: "flex", flexDirection: "column",
      maxWidth: 390, margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Topbar */}
      <div style={{ background: FELT, padding: "44px 16px 18px", display: "flex", alignItems: "center", gap: 12, direction: "rtl" }}>
        <button onClick={() => router.push("/app")} style={{
          width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
          border: "none", color: IVORY, fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: IVORY, fontSize: 15, fontWeight: 700 }}>
            {mode === "login" ? t("login") : t("register")}
          </div>
          <div style={{ color: "rgba(248,242,228,0.45)", fontSize: 10 }}>الجيكر</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 16px 40px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Mode toggle */}
        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 4, display: "flex", gap: 4 }}>
          {(["login", "register"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
              background: mode === m ? IVORY : "transparent",
              color: mode === m ? JET : "rgba(248,242,228,0.4)",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              {m === "login" ? t("login") : t("register")}
            </button>
          ))}
        </div>

        {/* Google button */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: "100%", background: "#fff", border: `1.5px solid ${IVORY_MID}`,
          borderRadius: 12, padding: "13px 16px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          fontSize: 14, fontWeight: 600, color: JET, cursor: "pointer",
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {t("loginWithGoogle")}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ color: "rgba(248,242,228,0.3)", fontSize: 12 }}>{tc("or")}</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "register" && (
            <input
              type="text" placeholder={t("name")} value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email" placeholder={t("email")} value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password" placeholder={t("password")} value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          {mode === "register" && (
            <input
              type="password" placeholder={t("confirmPassword")} value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(200,16,46,0.12)", border: "1px solid rgba(200,16,46,0.3)", borderRadius: 8, padding: "10px 12px", color: "#FF6B6B", fontSize: 13, textAlign: "right" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
          width: "100%", padding: "14px 0", background: FELT,
          border: "none", borderRadius: 12,
          color: IVORY, fontSize: 15, fontWeight: 700,
          cursor: loading || !email || !password ? "not-allowed" : "pointer",
          opacity: loading || !email || !password ? 0.5 : 1,
        }}>
          {loading ? tc("loading") : mode === "login" ? t("login") : t("register")}
        </button>

        {/* Guest mode */}
        <div style={{ textAlign: "center", paddingTop: 4 }}>
          <button onClick={() => router.push("/app")} style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "rgba(248,242,228,0.4)", fontSize: 13,
            textDecoration: "underline", textUnderlineOffset: 3,
          }}>
            {t("guestMode")}
          </button>
          <div style={{ color: "rgba(248,242,228,0.25)", fontSize: 10, marginTop: 3 }}>
            {t("guestModeSub")}
          </div>
        </div>
      </div>
    </div>
  );
}
