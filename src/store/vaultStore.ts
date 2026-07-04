import { create } from 'zustand';
import type { PasswordEntry, ToastMessage, AppSettings } from '@/lib/types';
import {
  getAccounts,
  createAccount as cryptoCreateAccount,
  deleteAccount as cryptoDeleteAccount,
  verifyAccountPassword,
  saveAccountEntries,
  loadAccountEntries,
  saveAccountSettings,
  loadAccountSettings,
  saveSession,
  loadSession,
  clearSession,
  clearAllData,
  exportAccountData,
  importAccountData,
} from '@/lib/crypto';

interface VaultStore {
  // 状态
  entries: PasswordEntry[];
  isLocked: boolean;
  accounts: string[];
  currentAccount: string;
  masterPassword: string;
  toasts: ToastMessage[];
  settings: AppSettings;
  selectedCategory: string;
  searchQuery: string;
  categories: string[];

  // 操作
  initStore: () => void;
  createAccount: (account: string, password: string) => boolean;
  login: (account: string, password: string, remember: boolean) => boolean;
  autoLogin: (account: string) => boolean;
  lock: () => void;
  switchAccount: () => void;
  deleteAccount: (account: string) => void;
  addEntry: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, entry: Partial<PasswordEntry>) => void;
  deleteEntry: (id: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearVault: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => { account: string; success: boolean };
  addCategory: (cat: string) => void;
  deleteCategory: (cat: string) => void;
  renameCategory: (oldCat: string, newCat: string) => void;
}

const defaultSettings: AppSettings = {
  autoLockMinutes: 30,
  rememberSession: false,
};

function getSettings(account: string): AppSettings {
  const saved = loadAccountSettings<AppSettings>(account);
  return saved ? { ...defaultSettings, ...saved } : defaultSettings;
}

function extractCategories(entries: PasswordEntry[]): string[] {
  return Array.from(new Set(entries.map(e => e.category).filter(Boolean)));
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  entries: [],
  isLocked: true,
  accounts: [],
  currentAccount: '',
  masterPassword: '',
  toasts: [],
  settings: defaultSettings,
  selectedCategory: 'all',
  searchQuery: '',
  categories: [],

  initStore: () => {
    const accounts = getAccounts();
    set({ accounts });
  },

  createAccount: (account: string, password: string) => {
    if (!cryptoCreateAccount(account, password)) return false;
    const accounts = getAccounts();
    set({ accounts });
    return true;
  },

  login: (account: string, password: string, remember: boolean) => {
    if (!verifyAccountPassword(account, password)) return false;
    const entries = loadAccountEntries<PasswordEntry[]>(account, password) || [];
    const settings = getSettings(account);
    const categories = extractCategories(entries);
    if (remember) {
      saveSession(account, password, true);
    }
    set({
      isLocked: false,
      currentAccount: account,
      masterPassword: password,
      entries,
      settings,
      categories,
    });
    return true;
  },

  autoLogin: (account: string) => {
    const session = loadSession(account);
    if (!session || session.account !== account) return false;
    const entries = loadAccountEntries<PasswordEntry[]>(account, session.password) || [];
    const settings = getSettings(account);
    const categories = extractCategories(entries);
    set({
      isLocked: false,
      currentAccount: account,
      masterPassword: session.password,
      entries,
      settings,
      categories,
    });
    return true;
  },

  lock: () => {
    const { currentAccount } = get();
    if (currentAccount) {
      clearSession(currentAccount);
    }
    set({
      isLocked: true,
      masterPassword: '',
      entries: [],
      selectedCategory: 'all',
      searchQuery: '',
      settings: defaultSettings,
      categories: [],
    });
  },

  switchAccount: () => {
    const { currentAccount } = get();
    if (currentAccount) {
      clearSession(currentAccount);
    }
    set({
      isLocked: true,
      currentAccount: '',
      masterPassword: '',
      entries: [],
      selectedCategory: 'all',
      searchQuery: '',
      settings: defaultSettings,
      categories: [],
    });
  },

  deleteAccount: (account: string) => {
    cryptoDeleteAccount(account);
    const accounts = getAccounts();
    set({ accounts });
    get().addToast('success', '账户已删除');
  },

  addEntry: (entry) => {
    const { currentAccount, masterPassword } = get();
    const now = Date.now();
    const newEntry: PasswordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const entries = [...get().entries, newEntry];
    const categories = extractCategories(entries);
    saveAccountEntries(currentAccount, entries, masterPassword);
    set({ entries, categories });
    get().addToast('success', '密码已添加');
  },

  updateEntry: (id, partial) => {
    const { currentAccount, masterPassword } = get();
    const entries = get().entries.map(e =>
      e.id === id ? { ...e, ...partial, updatedAt: Date.now() } : e
    );
    const categories = extractCategories(entries);
    saveAccountEntries(currentAccount, entries, masterPassword);
    set({ entries, categories });
    get().addToast('success', '密码已更新');
  },

  deleteEntry: (id) => {
    const { currentAccount, masterPassword } = get();
    const entries = get().entries.filter(e => e.id !== id);
    const categories = extractCategories(entries);
    saveAccountEntries(currentAccount, entries, masterPassword);
    set({ entries, categories });
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
    const { currentAccount } = get();
    const settings = { ...get().settings, ...partial };
    saveAccountSettings(currentAccount, settings);
    set({ settings });
    get().addToast('success', '设置已保存');
  },

  clearVault: () => {
    clearAllData();
    set({
      entries: [],
      isLocked: true,
      accounts: [],
      currentAccount: '',
      masterPassword: '',
      selectedCategory: 'all',
      searchQuery: '',
      settings: defaultSettings,
    });
  },

  exportData: () => {
    const { currentAccount } = get();
    return exportAccountData(currentAccount);
  },

  importData: (jsonStr: string) => {
    return importAccountData(jsonStr);
  },

  addCategory: (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    const { categories } = get();
    if (categories.includes(trimmed)) {
      get().addToast('info', '分类已存在');
      return;
    }
    set({ categories: [...categories, trimmed] });
    get().addToast('success', '分类已添加');
  },

  deleteCategory: (cat: string) => {
    const { currentAccount, masterPassword, entries } = get();
    // 将该分类下的密码改为空分类
    const newEntries = entries.map(e =>
      e.category === cat ? { ...e, category: '', updatedAt: Date.now() } : e
    );
    const categories = extractCategories(newEntries);
    saveAccountEntries(currentAccount, newEntries, masterPassword);
    set({ entries: newEntries, categories, selectedCategory: 'all' });
    get().addToast('success', '分类已删除');
  },

  renameCategory: (oldCat: string, newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed || oldCat === trimmed) return;
    const { currentAccount, masterPassword, entries, categories } = get();
    if (categories.includes(trimmed)) {
      get().addToast('error', '新分类名称已存在');
      return;
    }
    const newEntries = entries.map(e =>
      e.category === oldCat ? { ...e, category: trimmed, updatedAt: Date.now() } : e
    );
    const newCategories = extractCategories(newEntries);
    saveAccountEntries(currentAccount, newEntries, masterPassword);
    set({ entries: newEntries, categories: newCategories, selectedCategory: trimmed });
    get().addToast('success', '分类已重命名');
  },
}));
