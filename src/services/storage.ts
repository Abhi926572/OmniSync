/**
 * IndexedDB & LocalStorage Hybrid Persistence Engine
 */

const DB_NAME = 'OmniSyncDatabase_v1';
const DB_VERSION = 1;
const STORES = ['tasks', 'categories', 'members', 'settings', 'mutations', 'devices', 'audit', 'backups'] as const;

type StoreName = typeof STORES[number];

class LocalDB {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    this.init();
  }

  private init(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.resolve(null);
    }
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const request = window.indexedDB.open(DB_NAME, DB_VERSION);
          request.onerror = () => {
            console.warn('IndexedDB failed to open, falling back to LocalStorage');
            resolve(null);
          };
          request.onsuccess = () => {
            resolve(request.result);
          };
          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            STORES.forEach((store) => {
              if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store, { keyPath: 'id' });
              }
            });
          };
        } catch (e) {
          console.warn('IndexedDB initialization error:', e);
          resolve(null);
        }
      });
    }
    return this.dbPromise;
  }

  async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await this.init();
    if (db) {
      return new Promise((resolve) => {
        try {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve(this.fallbackGet<T>(storeName));
        } catch {
          resolve(this.fallbackGet<T>(storeName));
        }
      });
    }
    return this.fallbackGet<T>(storeName);
  }

  async put<T extends { id: string }>(storeName: StoreName, item: T): Promise<void> {
    const db = await this.init();
    if (db) {
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put(item);
      } catch {
        // Fallback
      }
    }
    this.fallbackPut(storeName, item);
  }

  async putBatch<T extends { id: string }>(storeName: StoreName, items: T[]): Promise<void> {
    const db = await this.init();
    if (db) {
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        items.forEach(item => store.put(item));
      } catch {
        // Fallback
      }
    }
    this.fallbackSetAll(storeName, items);
  }

  async delete(storeName: StoreName, id: string): Promise<void> {
    const db = await this.init();
    if (db) {
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(id);
      } catch {
        // Fallback
      }
    }
    this.fallbackDelete(storeName, id);
  }

  async clear(storeName: StoreName): Promise<void> {
    const db = await this.init();
    if (db) {
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();
      } catch {
        // Fallback
      }
    }
    try {
      localStorage.removeItem(`omnisync_${storeName}`);
    } catch {
      // Ignored
    }
  }

  // --- LocalStorage Fallback Helpers ---
  private fallbackGet<T>(storeName: StoreName): T[] {
    try {
      const data = localStorage.getItem(`omnisync_${storeName}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private fallbackPut<T extends { id: string }>(storeName: StoreName, item: T) {
    try {
      const all = this.fallbackGet<T>(storeName);
      const idx = all.findIndex(x => x.id === item.id);
      if (idx >= 0) {
        all[idx] = item;
      } else {
        all.push(item);
      }
      localStorage.setItem(`omnisync_${storeName}`, JSON.stringify(all));
    } catch {
      // Storage quota or disabled
    }
  }

  private fallbackSetAll<T>(storeName: StoreName, items: T[]) {
    try {
      localStorage.setItem(`omnisync_${storeName}`, JSON.stringify(items));
    } catch {
      // Ignored
    }
  }

  private fallbackDelete(storeName: StoreName, id: string) {
    try {
      const all = this.fallbackGet<{ id: string }>(storeName);
      const filtered = all.filter(x => x.id !== id);
      localStorage.setItem(`omnisync_${storeName}`, JSON.stringify(filtered));
    } catch {
      // Ignored
    }
  }
}

export const localDB = new LocalDB();
