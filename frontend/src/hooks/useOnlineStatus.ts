import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}

export function cacheTimestamp(route: string) {
  localStorage.setItem(`wgpt_last_sync_${route}`, new Date().toISOString());
}

export function getCachedTimestamp(route: string): Date | null {
  const v = localStorage.getItem(`wgpt_last_sync_${route}`);
  return v ? new Date(v) : null;
}
