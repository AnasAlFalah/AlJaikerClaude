import {
  collection, doc, addDoc, getDoc, getDocs,
  setDoc, deleteDoc, query, where, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Diwanya {
  id: string;
  name: string;
  founderId: string;
  createdAt: string;
}

export interface DiwanyaMember {
  uid: string;
  name: string;
  photoURL: string | null;
  role: "founder" | "admin" | "member";
  joinedAt: string;
}

export async function createDiwanya(name: string, founder: { uid: string; name: string; photoURL: string | null }): Promise<string> {
  const ref = await addDoc(collection(db, "diwanyas"), {
    name: name.trim(),
    founderId: founder.uid,
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, "diwanyas", ref.id, "members", founder.uid), {
    uid: founder.uid,
    name: founder.name,
    photoURL: founder.photoURL ?? null,
    role: "founder",
    joinedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getDiwanya(id: string): Promise<Diwanya | null> {
  const snap = await getDoc(doc(db, "diwanyas", id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    name: d.name,
    founderId: d.founderId,
    createdAt: (d.createdAt as Timestamp)?.toDate().toISOString() ?? "",
  };
}

export async function getMembers(diwanyaId: string): Promise<DiwanyaMember[]> {
  const snap = await getDocs(collection(db, "diwanyas", diwanyaId, "members"));
  return snap.docs.map(d => {
    const m = d.data();
    return {
      uid: d.id,
      name: m.name,
      photoURL: m.photoURL ?? null,
      role: m.role,
      joinedAt: (m.joinedAt as Timestamp)?.toDate().toISOString() ?? "",
    };
  });
}

export async function getUserDiwanyas(uid: string): Promise<Diwanya[]> {
  // Find all diwanyas where this user is a member via collectionGroup
  const snap = await getDocs(query(collection(db, "diwanyas")));
  const result: Diwanya[] = [];
  for (const d of snap.docs) {
    const memberSnap = await getDoc(doc(db, "diwanyas", d.id, "members", uid));
    if (memberSnap.exists()) {
      const data = d.data();
      result.push({
        id: d.id,
        name: data.name,
        founderId: data.founderId,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? "",
      });
    }
  }
  return result;
}

export async function joinDiwanya(diwanyaId: string, user: { uid: string; name: string; photoURL: string | null }): Promise<void> {
  const memberRef = doc(db, "diwanyas", diwanyaId, "members", user.uid);
  const existing = await getDoc(memberRef);
  if (existing.exists()) return; // already a member
  await setDoc(memberRef, {
    uid: user.uid,
    name: user.name,
    photoURL: user.photoURL ?? null,
    role: "member",
    joinedAt: serverTimestamp(),
  });
}

export async function leaveDiwanya(diwanyaId: string, uid: string): Promise<void> {
  await deleteDoc(doc(db, "diwanyas", diwanyaId, "members", uid));
}

export async function promoteToAdmin(diwanyaId: string, uid: string): Promise<void> {
  await setDoc(doc(db, "diwanyas", diwanyaId, "members", uid), { role: "admin" }, { merge: true });
}
