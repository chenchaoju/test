import CryptoJS from 'crypto-js';

const ACCOUNTS_KEY = 'vault_accounts';
const MASTER_HASH_PREFIX = 'vault_master_hash_';
const ENCRYPTED_DATA_PREFIX = 'vault_encrypted_data_';
const SETTINGS_PREFIX = 'vault_settings_';
const SESSION_PREFIX = 'vault_session_';

// 旧版兼容键
const LEGACY_MASTER_HASH = 'vault_master_hash';
const LEGACY_ENCRYPTED_DATA = 'vault_encrypted_data';
const LEGACY_SETTINGS = 'vault_settings';

// 生成主密码哈希（SHA-256）
export function hashMasterPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

// 迁移旧版数据到第一个账户（兼容）
export function migrateLegacyData(): string | null {
  const oldHash = localStorage.getItem(LEGACY_MASTER_HASH);
  const oldData = localStorage.getItem(LEGACY_ENCRYPTED_DATA);
  if (!oldHash) return null;

  const defaultAccount = '默认账户';
  const accounts = getAccounts();
  if (!accounts.includes(defaultAccount)) {
    accounts.push(defaultAccount);
    saveAccounts(accounts);
    localStorage.setItem(MASTER_HASH_PREFIX + defaultAccount, oldHash);
    if (oldData) localStorage.setItem(ENCRYPTED_DATA_PREFIX + defaultAccount, oldData);
    // 迁移旧设置
    const oldSettings = localStorage.getItem(LEGACY_SETTINGS);
    if (oldSettings) localStorage.setItem(SETTINGS_PREFIX + defaultAccount, oldSettings);
    // 清除旧数据
    localStorage.removeItem(LEGACY_MASTER_HASH);
    localStorage.removeItem(LEGACY_ENCRYPTED_DATA);
    localStorage.removeItem(LEGACY_SETTINGS);
  }
  return defaultAccount;
}

// 获取所有账户
export function getAccounts(): string[] {
  migrateLegacyData();
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return [];
}

function saveAccounts(accounts: string[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// 检查账户是否存在
export function accountExists(account: string): boolean {
  return getAccounts().includes(account);
}

// 创建账户
export function createAccount(account: string, password: string): boolean {
  if (accountExists(account)) return false;
  const accounts = getAccounts();
  accounts.push(account);
  saveAccounts(accounts);
  localStorage.setItem(MASTER_HASH_PREFIX + account, hashMasterPassword(password));
  localStorage.setItem(ENCRYPTED_DATA_PREFIX + account, encryptData([], password));
  return true;
}

// 删除账户
export function deleteAccount(account: string): void {
  const accounts = getAccounts().filter(a => a !== account);
  saveAccounts(accounts);
  localStorage.removeItem(MASTER_HASH_PREFIX + account);
  localStorage.removeItem(ENCRYPTED_DATA_PREFIX + account);
  localStorage.removeItem(SETTINGS_PREFIX + account);
  localStorage.removeItem(SESSION_PREFIX + account);
}

// 验证账户密码
export function verifyAccountPassword(account: string, password: string): boolean {
  const storedHash = localStorage.getItem(MASTER_HASH_PREFIX + account);
  if (!storedHash) return false;
  return hashMasterPassword(password) === storedHash;
}

// 加密数据
export function encryptData(data: unknown, masterPassword: string): string {
  const jsonStr = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonStr, masterPassword).toString();
}

// 解密数据
export function decryptData<T>(encrypted: string, masterPassword: string): T | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, masterPassword);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
}

// 保存账户的加密数据
export function saveAccountEntries(account: string, entries: unknown, masterPassword: string): void {
  const encrypted = encryptData(entries, masterPassword);
  localStorage.setItem(ENCRYPTED_DATA_PREFIX + account, encrypted);
}

// 读取账户的加密数据
export function loadAccountEntries<T>(account: string, masterPassword: string): T | null {
  const encrypted = localStorage.getItem(ENCRYPTED_DATA_PREFIX + account);
  if (!encrypted) return null;
  return decryptData<T>(encrypted, masterPassword);
}

// 保存账户设置
export function saveAccountSettings(account: string, settings: unknown): void {
  localStorage.setItem(SETTINGS_PREFIX + account, JSON.stringify(settings));
}

export function loadAccountSettings<T>(account: string): T | null {
  try {
    const raw = localStorage.getItem(SETTINGS_PREFIX + account);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* noop */ }
  return null;
}

// 保存会话（用加密方式存储密码到 sessionStorage）
export function saveSession(account: string, password: string, remember: boolean): void {
  const token = encryptData({ password, account }, 'vault-cipher-session-key');
  if (remember) {
    localStorage.setItem(SESSION_PREFIX + account, token);
  } else {
    sessionStorage.setItem(SESSION_PREFIX + account, token);
  }
}

// 读取会话
export function loadSession(account: string): { password: string; account: string } | null {
  let token = sessionStorage.getItem(SESSION_PREFIX + account);
  if (!token) {
    token = localStorage.getItem(SESSION_PREFIX + account);
  }
  if (!token) return null;
  const data = decryptData<{ password: string; account: string }>(token, 'vault-cipher-session-key');
  return data;
}

// 清除会话
export function clearSession(account: string): void {
  sessionStorage.removeItem(SESSION_PREFIX + account);
  localStorage.removeItem(SESSION_PREFIX + account);
}

// 导出账户加密数据
export function exportAccountData(account: string): string {
  const encrypted = localStorage.getItem(ENCRYPTED_DATA_PREFIX + account) || '';
  const hash = localStorage.getItem(MASTER_HASH_PREFIX + account) || '';
  return JSON.stringify({
    version: 2,
    account,
    masterHash: hash,
    data: encrypted,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

// 导入加密数据
export function importAccountData(jsonStr: string): { account: string; success: boolean } {
  try {
    const parsed = JSON.parse(jsonStr);
    const account = parsed.account || '导入账户';
    if (parsed.masterHash && parsed.data) {
      const accounts = getAccounts();
      // 如果账户已存在，添加后缀
      let finalAccount = account;
      let suffix = 1;
      while (accounts.includes(finalAccount)) {
        finalAccount = `${account}_${suffix}`;
        suffix++;
      }
      accounts.push(finalAccount);
      saveAccounts(accounts);
      localStorage.setItem(MASTER_HASH_PREFIX + finalAccount, parsed.masterHash);
      localStorage.setItem(ENCRYPTED_DATA_PREFIX + finalAccount, parsed.data);
      return { account: finalAccount, success: true };
    }
    return { account: '', success: false };
  } catch {
    return { account: '', success: false };
  }
}

// 清除账户所有数据
export function clearAccountData(account: string): void {
  localStorage.removeItem(MASTER_HASH_PREFIX + account);
  localStorage.removeItem(ENCRYPTED_DATA_PREFIX + account);
  localStorage.removeItem(SETTINGS_PREFIX + account);
  localStorage.removeItem(SESSION_PREFIX + account);
}

// 清除所有数据（包括所有账户）
export function clearAllData(): void {
  const accounts = getAccounts();
  accounts.forEach(account => clearAccountData(account));
  localStorage.removeItem(ACCOUNTS_KEY);
}
