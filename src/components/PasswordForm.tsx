import { useState, useEffect } from 'react';
import type { PasswordEntry } from '@/lib/types';
import { useVaultStore } from '@/store/vaultStore';
import { checkStrength, generatePassword, defaultGeneratorOptions } from '@/lib/passwordGenerator';
import { X, Eye, EyeOff, RefreshCw, Plus } from 'lucide-react';

interface PasswordFormProps {
  entry?: PasswordEntry | null;
  onClose: () => void;
}

export default function PasswordForm({ entry, onClose }: PasswordFormProps) {
  const addEntry = useVaultStore(s => s.addEntry);
  const updateEntry = useVaultStore(s => s.updateEntry);
  const entries = useVaultStore(s => s.entries);

  const [form, setForm] = useState({
    title: entry?.title || '',
    username: entry?.username || '',
    password: entry?.password || '',
    url: entry?.url || '',
    notes: entry?.notes || '',
    category: entry?.category || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 获取已有分类
  const existingCategories = Array.from(new Set(entries.map(e => e.category).filter(Boolean)));

  const strength = checkStrength(form.password);

  const handleGenerate = () => {
    const pwd = generatePassword(defaultGeneratorOptions);
    setForm(f => ({ ...f, password: pwd }));
    setShowPassword(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = '请输入标题';
    if (!form.password.trim()) newErrors.password = '请输入密码';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (entry) {
      updateEntry(entry.id, form);
    } else {
      addEntry(form);
    }
    onClose();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 表单 */}
      <div className="relative w-full max-w-lg glass border border-vault-border rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-vault-border">
          <h2 className="font-mono font-bold text-lg gradient-text">
            {entry ? '编辑密码' : '新增密码'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-vault-muted hover:text-white hover:bg-vault-card transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* 标题 */}
          <div>
            <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
              标题 <span className="text-vault-danger">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="如：GitHub 账户"
              className="vault-input"
              autoFocus
            />
            {errors.title && <p className="text-xs text-vault-danger mt-1">{errors.title}</p>}
          </div>

          {/* 用户名 */}
          <div>
            <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
              用户名
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="邮箱或用户名"
              className="vault-input"
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
              密码 <span className="text-vault-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="输入或生成密码"
                className="vault-input pr-24 font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-md text-vault-muted hover:text-vault-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="p-1.5 rounded-md text-vault-muted hover:text-vault-accent transition-colors"
                  title="生成密码"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>
            {errors.password && <p className="text-xs text-vault-danger mt-1">{errors.password}</p>}
            {form.password && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 bg-vault-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(strength.score / 8) * 100}%`, backgroundColor: strength.color }}
                  />
                </div>
                <span className="text-xs font-mono" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* 网址 */}
          <div>
            <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
              网址
            </label>
            <input
              type="text"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com"
              className="vault-input"
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
              分类
            </label>
            <input
              type="text"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="如：社交、工作、金融"
              className="vault-input"
              list="category-list"
            />
            <datalist id="category-list">
              {existingCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
              备注
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="额外信息..."
              rows={3}
              className="vault-input resize-none"
            />
          </div>

          {/* 按钮 */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary flex items-center gap-2 flex-1 justify-center">
              <Plus size={16} />
              {entry ? '保存修改' : '添加密码'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
