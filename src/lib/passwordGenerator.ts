import type { GeneratorOptions, StrengthResult, StrengthLevel } from './types';

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = 'Il1O0o';

// 生成密码
export function generatePassword(options: GeneratorOptions): string {
  let charset = '';
  if (options.uppercase) charset += UPPERCASE;
  if (options.lowercase) charset += LOWERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;

  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
  }

  if (!charset) return '';

  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }

  return password;
}

// 计算密码强度
export function checkStrength(password: string): StrengthResult {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (password.length >= 20 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }

  const levels: Record<StrengthLevel, StrengthResult> = {
    weak: { level: 'weak', score: score, label: '弱', color: '#ef4444' },
    fair: { level: 'fair', score: score, label: '中', color: '#f59e0b' },
    good: { level: 'good', score: score, label: '良好', color: '#3b82f6' },
    strong: { level: 'strong', score: score, label: '强', color: '#22c55e' },
  };

  if (score <= 3) return levels.weak;
  if (score <= 5) return levels.fair;
  if (score <= 6) return levels.good;
  return levels.strong;
}

// 默认生成器选项
export const defaultGeneratorOptions: GeneratorOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};
