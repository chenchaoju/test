import { create } from 'zustand';
import type { PasswordEntry, ToastMessage, AppSettings } from '@/lib/types';
import {
  isVaultInitialized,
  setMasterPassword,
  verifyMasterPassword,
  saveEncryptedEntries,
  loadEncryptedEntries,
  clearAllData,
} from '@/lib/crypto';

interface VaultStore {
  // 状态
  entries: PasswordEntry[];
  isLocked: boolean;
  isInitialized: boolean;
  masterPassword: string;
  toasts: ToastMessage[];
  settings: AppSettings;
  selectedCategory: string;
  searchQuery: string;

  // 操作
  initVault: (password: string) => boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
  addEntry: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, entry: Partial<PasswordEntry>) => void;
  deleteEntry: (id: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearVault: () => void;
  loadFromStorage: () => void;
}

const SETTINGS_KEY = 'vault_settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return defaultSettings;
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

const defaultSettings: AppSettings = {
  autoLockMinutes: 30,
  rememberSession: false,
};

function persistEntries(entries: PasswordEntry[], masterPassword: string) {
  saveEncryptedEntries(entries, masterPassword);
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  entries: [],
  isLocked: true,
  isInitialized: isVaultInitialized(),
  masterPassword: '',
  toasts: [],
  settings: loadSettings(),
  selectedCategory: 'all',
  searchQuery: '',

  initVault: (password: string) => {
    setMasterPassword(password);
    const emptyEntries: PasswordEntry[] = [];
    persistEntries(emptyEntries, password);
    set({
      isInitialized: true,
      isLocked: false,
      masterPassword: password,
      entries: emptyEntries,
    });
    return true;
  },

  unlock: (password: string) => {
    if (!verifyMasterPassword(password)) return false;
    const entries = loadEncryptedEntries<PasswordEntry[]>(password) || [];
    set({
      isLocked: false,
      masterPassword: password,
      entries,
    });
    return true;
  },

  lock: () => {
    set({
      isLocked: true,
      masterPassword: '',
      entries: [],
      selectedCategory: 'all',
      searchQuery: '',
    });
  },

  addEntry: (entry) => {
    const now = Date.now();
    const newEntry: PasswordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const entries = [...get().entries, newEntry];
    persistEntries(entries, get().masterPassword);
    set({ entries });
    get().addToast('success', '密码已添加');
  },

  updateEntry: (id, partial) => {
    const entries = get().entries.map(e =>
      e.id === id ? { ...e, ...partial, updatedAt: Date.now() } : e
    );
    persistEntries(entries, get().masterPassword);
    set({ entries });
    get().addToast('success', '密码已更新');
  },

  deleteEntry: (id) => {
    const entries = get().entries.filter(e => e.id !== id);
    persistEntries(entries, get().masterPassword);
    set({ entries });
    get().addToast('success', '密码已删除');
  },

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addToast: (type, message) => {
    const id = crypto.randomUUID();
    set(state => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  updateSettings: (partial) => {
    const settings = { ...get().settings, ...partial };
    saveSettings(settings);
    set({ settings });
    get().addToast('success', '设置已保存');
  },

  clearVault: () => {
    clearAllData();
    localStorage.removeItem(SETTINGS_KEY);
    set({
      entries: [],
      isLocked: true,
      isInitialized: false,
      masterPassword: '',
      selectedCategory: 'all',
      searchQuery: '',
      settings: defaultSettings,
    });
  },

  loadFromStorage: () => {
    set({
      isInitialized: isVaultInitialized(),
      isLocked: true,
    });
  },
}));
