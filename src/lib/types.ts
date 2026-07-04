// 子项类型
export type SubItemType = 'text' | 'image';

// 子项
export interface SubItem {
  id: string;
  type: SubItemType;
  title: string;
  content: string;
}

// 条目类型
export type EntryType = 'text' | 'image' | 'link' | 'mixed';

// 复制板条目
export interface ClipboardEntry {
  id: string;
  title: string;
  type: EntryType;
  textContent?: string;
  imageContent?: string;
  linkContent?: string;
  subItems?: SubItem[];
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

// 兼容旧类型名
export type PasswordEntry = ClipboardEntry;
