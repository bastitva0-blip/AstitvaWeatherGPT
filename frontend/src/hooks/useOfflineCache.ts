/**
 * Offline answer cache using IndexedDB.
 * Stores last 3 assistant responses so a fisherman at sea with no signal
 * still sees yesterday's advisory.
 *
 * Usage:
 *   const { saveToCache, getCached } = useOfflineCache();
 *   saveToCache({ query, answer, location, timestamp });
 *   const cached = await getCached();
 */

const DB_NAME = "sanket_offline_v1";
const STORE   = "answers";
const MAX     = 3;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export interface CachedAnswer {
  id?: number;
  query: string;
  answer: string;
  location: string;
  timestamp: string;
  lang: string;
}

export async function saveToOfflineCache(entry: Omit<CachedAnswer, "id">): Promise<void> {
  try {
    const db    = await openDB();
    const tx    = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);

    // Maintain max 3 entries — delete oldest if over limit
    const all: CachedAnswer[] = await new Promise((res, rej) => {
      const req = store.getAll();
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    });

    if (all.length >= MAX) {
      const oldest = all.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))[0];
      if (oldest.id !== undefined) store.delete(oldest.id);
    }

    store.add(entry);
  } catch (e) {
    console.warn("IndexedDB write failed:", e);
  }
}

export async function getOfflineCache(): Promise<CachedAnswer[]> {
  try {
    const db    = await openDB();
    const tx    = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    return await new Promise((res, rej) => {
      const req = store.getAll();
      req.onsuccess = () => res((req.result as CachedAnswer[]).reverse()); // newest first
      req.onerror   = () => rej(req.error);
    });
  } catch (e) {
    console.warn("IndexedDB read failed:", e);
    return [];
  }
}

export function useOfflineCache() {
  return { saveToCache: saveToOfflineCache, getCached: getOfflineCache };
}
