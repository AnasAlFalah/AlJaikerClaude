import { doc, setDoc, onSnapshot, serverTimestamp, Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";

export type LiveGameType = "trix" | "kout" | "spide" | "hand" | "general";

export interface LiveSession {
  sessionId: string;
  game: LiveGameType;
  data: string; // JSON-stringified game session
  updatedAt: unknown; // serverTimestamp
}

export async function publishLiveSession(sessionId: string, game: LiveGameType, data: unknown): Promise<void> {
  await setDoc(doc(db, "liveSessions", sessionId), {
    sessionId,
    game,
    data: JSON.stringify(data),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeLiveSession(
  sessionId: string,
  onUpdate: (session: LiveSession | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "liveSessions", sessionId), (snap) => {
    if (!snap.exists()) { onUpdate(null); return; }
    onUpdate(snap.data() as LiveSession);
  });
}
