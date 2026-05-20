import { Platform } from 'react-native';

/**
 * Storage abstraction — uses MMKV on native, localStorage on web,
 * in-memory fallback if neither is available.
 *
 * MMKV is synchronous and fast on native but requires native modules
 * that aren't available in web or Expo Go without the config plugin.
 */

interface StorageAPI {
  getString: (key: string) => string | undefined;
  getNumber: (key: string) => number | undefined;
  getBoolean: (key: string) => boolean | undefined;
  set: (key: string, value: string | number | boolean) => void;
  delete: (key: string) => void;
  getAllKeys: () => string[];
  clearAll: () => void;
}

function createLocalStorageAPI(): StorageAPI {
  return {
    getString: (key) => {
      try { const v = localStorage.getItem(key); return v ?? undefined; } catch { return undefined; }
    },
    getNumber: (key) => {
      try { const v = localStorage.getItem(key); return v !== null ? Number(v) : undefined; } catch { return undefined; }
    },
    getBoolean: (key) => {
      try { const v = localStorage.getItem(key); return v !== null ? v === 'true' : undefined; } catch { return undefined; }
    },
    set: (key, value) => {
      try { localStorage.setItem(key, String(value)); } catch { /* quota exceeded */ }
    },
    delete: (key) => {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    },
    getAllKeys: () => {
      try { return Object.keys(localStorage); } catch { return []; }
    },
    clearAll: () => {
      try { localStorage.clear(); } catch { /* ignore */ }
    },
  };
}

function createMemoryStorageAPI(): StorageAPI {
  const memStore: Record<string, string> = {};
  return {
    getString: (key) => memStore[key] ?? undefined,
    getNumber: (key) => { const v = memStore[key]; return v !== undefined ? Number(v) : undefined; },
    getBoolean: (key) => { const v = memStore[key]; return v !== undefined ? v === 'true' : undefined; },
    set: (key, value) => { memStore[key] = String(value); },
    delete: (key) => { delete memStore[key]; },
    getAllKeys: () => Object.keys(memStore),
    clearAll: () => { Object.keys(memStore).forEach((k) => delete memStore[k]); },
  };
}

let storage: StorageAPI;

if (Platform.OS === 'web') {
  storage = createLocalStorageAPI();
} else {
  try {
    const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
    const instance = new MMKV({ id: 'daily-english-storage' });
    storage = {
      getString: (key) => instance.getString(key),
      getNumber: (key) => instance.getNumber(key),
      getBoolean: (key) => instance.getBoolean(key),
      set: (key, value) => instance.set(key, value),
      delete: (key) => instance.delete(key),
      getAllKeys: () => instance.getAllKeys(),
      clearAll: () => instance.clearAll(),
    };
  } catch {
    storage = createMemoryStorageAPI();
  }
}

export { storage };