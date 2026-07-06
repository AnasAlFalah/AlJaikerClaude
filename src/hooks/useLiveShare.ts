"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { publishLiveSession, type LiveGameType } from "@/lib/live-share";

const SYNC_INTERVAL = 3000;
const SHARING_KEY_PREFIX = "liveShare_";

interface Options {
  sessionId: string;
  game: LiveGameType;
  /** Return the session object to sync, or null if not ready */
  getData: () => unknown | null;
}

export function useLiveShare({ sessionId, game, getData }: Options) {
  const [isSharing, setIsSharing] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`${SHARING_KEY_PREFIX}${sessionId}`) === "1";
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sync = useCallback(async () => {
    const data = getData();
    if (!data) return;
    await publishLiveSession(sessionId, game, data);
  }, [sessionId, game, getData]);

  const startSharing = useCallback(() => {
    localStorage.setItem(`${SHARING_KEY_PREFIX}${sessionId}`, "1");
    setIsSharing(true);
    sync();
  }, [sessionId, sync]);

  const stopSharing = useCallback(() => {
    localStorage.removeItem(`${SHARING_KEY_PREFIX}${sessionId}`);
    setIsSharing(false);
  }, [sessionId]);

  useEffect(() => {
    if (!isSharing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(sync, SYNC_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSharing, sync]);

  return { isSharing, startSharing, stopSharing };
}
