// 密码条目类型
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

// 应用设置
export interface AppSettings {
  autoLockMinutes: number;
  rememberSession: boolean;
}

// 密码生成器选项
export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

// 密码强度等级
export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

// 密码强度结果
export interface StrengthResult {
  level: StrengthLevel;
  score: number;
  label: string;
  color: string;
}

// Toast 通知
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
