import CryptoJS from 'crypto-js';

const MASTER_HASH_KEY = 'vault_master_hash';
const ENCRYPTED_DATA_KEY = 'vault_encrypted_data';

// 生成主密码哈希（SHA-256）
export function hashMasterPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

// 验证主密码
export function verifyMasterPassword(password: string): boolean {
  const storedHash = localStorage.getItem(MASTER_HASH_KEY);
  if (!storedHash) return false;
  return hashMasterPassword(password) === storedHash;
}

// 检查是否已初始化
export function isVaultInitialized(): boolean {
  return localStorage.getItem(MASTER_HASH_KEY) !== null;
}

// 设置主密码
export function setMasterPassword(password: string): void {
  const hash = hashMasterPassword(password);
  localStorage.setItem(MASTER_HASH_KEY, hash);
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

// 保存加密的密码数据
export function saveEncryptedEntries(entries: unknown, masterPassword: string): void {
  const encrypted = encryptData(entries, masterPassword);
  localStorage.setItem(ENCRYPTED_DATA_KEY, encrypted);
}

// 读取并解密密码数据
export function loadEncryptedEntries<T>(masterPassword: string): T | null {
  const encrypted = localStorage.getItem(ENCRYPTED_DATA_KEY);
  if (!encrypted) return null;
  return decryptData<T>(encrypted, masterPassword);
}

// 导出加密数据
export function exportEncryptedData(masterPassword: string): string {
  const encrypted = localStorage.getItem(ENCRYPTED_DATA_KEY) || '';
  const hash = localStorage.getItem(MASTER_HASH_KEY) || '';
  return JSON.stringify({
    version: 1,
    masterHash: hash,
    data: encrypted,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

// 导入加密数据
export function importEncryptedData(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.masterHash && parsed.data) {
      localStorage.setItem(MASTER_HASH_KEY, parsed.masterHash);
      localStorage.setItem(ENCRYPTED_DATA_KEY, parsed.data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// 清除所有数据
export function clearAllData(): void {
  localStorage.removeItem(MASTER_HASH_KEY);
  localStorage.removeItem(ENCRYPTED_DATA_KEY);
}
