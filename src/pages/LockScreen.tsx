import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVaultStore } from '@/store/vaultStore';
import Logo from '@/components/Logo';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LockScreen() {
  const navigate = useNavigate();
  const isInitialized = useVaultStore(s => s.isInitialized);
  const initVault = useVaultStore(s => s.initVault);
  const unlock = useVaultStore(s => s.unlock);
  const addToast = useVaultStore(s => s.addToast);

  const [mode, setMode] = useState<'unlock' | 'setup'>(isInitialized ? 'unlock' : 'setup');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setMode(isInitialized ? 'unlock' : 'setup');
  }, [isInitialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'setup') {
      if (password.length < 6) {
        setError('主密码至少需要 6 个字符');
        triggerShake();
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        triggerShake();
        return;
      }
      initVault(password);
      addToast('success', '保险库已创建');
      navigate('/vault');
    } else {
      if (!unlock(password)) {
        setError('主密码错误');
        triggerShake();
        setPassword('');
        return;
      }
      navigate('/vault');
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  return (
    <div className="min-h-screen bg-vault-bg bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vault-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vault-purple/5 rounded-full blur-3xl" />
      <div className="scan-overlay" />

      {/* 主卡片 */}
      <div className={`relative w-full max-w-md ${shake ? 'animate-shake' : 'animate-slide-up'}`}>
        <div className="glass neon-border rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size={56} />
          </div>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="font-mono text-2xl font-bold gradient-text mb-2">
              {mode === 'setup' ? '创建保险库' : '解锁保险库'}
            </h1>
            <p className="text-sm text-vault-muted">
              {mode === 'setup'
                ? '设置主密码以加密保护您的数据'
                : '输入主密码以访问您的密码库'}
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 密码输入 */}
            <div>
              <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
                {mode === 'setup' ? '设置主密码' : '主密码'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="vault-input pl-10 pr-10 font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 确认密码（仅 setup 模式） */}
            {mode === 'setup' && (
              <div>
                <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
                  确认主密码
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="vault-input pl-10 pr-10 font-mono"
                  />
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="text-sm text-vault-danger bg-vault-danger/10 border border-vault-danger/30 rounded-lg px-4 py-2.5 animate-fade-in">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button type="submit" className="btn-primary flex items-center justify-center gap-2 mt-2 py-3">
              {mode === 'setup' ? '创建保险库' : '解锁'}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* 安全提示 */}
          {mode === 'setup' && (
            <div className="mt-6 flex items-start gap-2.5 text-xs text-vault-muted bg-vault-card/30 rounded-lg p-3 border border-vault-border">
              <ShieldCheck size={14} className="text-vault-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-300 mb-1 font-medium">安全说明</p>
                <p>主密码用于加密所有数据，无法找回。请妥善保管，建议使用密码管理器记录或写在安全的地方。</p>
              </div>
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-6 text-xs text-vault-muted font-mono">
          AES-256 加密 · 本地存储 · 零后端
        </div>
      </div>
    </div>
  );
}
