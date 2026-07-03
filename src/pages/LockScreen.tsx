import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVaultStore } from '@/store/vaultStore';
import Logo from '@/components/Logo';
import {
  Lock, Eye, EyeOff, ShieldCheck, ArrowRight, UserPlus,
  Users, Trash2, ChevronLeft, UserCircle
} from 'lucide-react';

type ScreenMode = 'select' | 'login' | 'create';

export default function LockScreen() {
  const navigate = useNavigate();
  const accounts = useVaultStore(s => s.accounts);
  const initStore = useVaultStore(s => s.initStore);
  const createAccount = useVaultStore(s => s.createAccount);
  const login = useVaultStore(s => s.login);
  const autoLogin = useVaultStore(s => s.autoLogin);
  const deleteAccount = useVaultStore(s => s.deleteAccount);
  const addToast = useVaultStore(s => s.addToast);

  const [mode, setMode] = useState<ScreenMode>('select');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // 初始化账户列表
  useEffect(() => {
    initStore();
  }, [initStore]);

  // 尝试自动登录
  useEffect(() => {
    if (accounts.length === 1) {
      const account = accounts[0];
      if (autoLogin(account)) {
        navigate('/vault');
      }
    }
  }, [accounts, autoLogin, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(selectedAccount, password, remember)) {
      setError('主密码错误');
      triggerShake();
      setPassword('');
      return;
    }
    navigate('/vault');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newAccountName.trim()) {
      setError('请输入账户名称');
      triggerShake();
      return;
    }
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
    if (!createAccount(newAccountName.trim(), password)) {
      setError('账户名称已存在');
      triggerShake();
      return;
    }
    login(newAccountName.trim(), password, remember);
    addToast('success', '保险库已创建');
    navigate('/vault');
  };

  const handleSelectAccount = (account: string) => {
    setSelectedAccount(account);
    setPassword('');
    setError('');
    // 尝试自动登录
    if (autoLogin(account)) {
      navigate('/vault');
      return;
    }
    setMode('login');
  };

  const handleDeleteAccount = (account: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete === account) {
      deleteAccount(account);
      setConfirmDelete(null);
      if (accounts.length <= 1) {
        setMode('select');
      }
    } else {
      setConfirmDelete(account);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  return (
    <div className="min-h-screen bg-vault-bg bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-vault-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-vault-purple/5 rounded-full blur-3xl" />
      <div className="scan-overlay" />

      {/* 主卡片 */}
      <div className={`relative w-full max-w-sm sm:max-w-md ${shake ? 'animate-shake' : 'animate-slide-up'}`}>
        <div className="glass neon-border rounded-2xl p-5 sm:p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <Logo size={48} />
          </div>

          {/* ===== 账户选择界面 ===== */}
          {mode === 'select' && (
            <>
              <div className="text-center mb-5 sm:mb-8">
                <h1 className="font-mono text-xl sm:text-2xl font-bold gradient-text mb-2">
                  选择账户
                </h1>
                <p className="text-xs sm:text-sm text-vault-muted">
                  选择您的保险库账户进入
                </p>
              </div>

              {accounts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-vault-muted mb-4">还没有账户</p>
                  <button
                    onClick={() => setMode('create')}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <UserPlus size={16} />
                    创建新账户
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-4">
                  {accounts.map(account => (
                    <button
                      key={account}
                      onClick={() => handleSelectAccount(account)}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-vault-card/50 border border-vault-border hover:border-vault-accent/40 transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-vault-accent/20 to-vault-purple/20 flex items-center justify-center flex-shrink-0">
                        <UserCircle size={18} className="text-vault-accent" />
                      </div>
                      <span className="text-sm text-gray-200 flex-1 truncate">{account}</span>
                      <button
                        onClick={(e) => handleDeleteAccount(account, e)}
                        className={`p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
                          confirmDelete === account
                            ? 'bg-vault-danger/20 text-vault-danger'
                            : 'text-vault-muted hover:text-vault-danger'
                        }`}
                      >
                        <Trash2 size={13} />
                      </button>
                      <ArrowRight size={16} className="text-vault-muted" />
                    </button>
                  ))}
                </div>
              )}

              {accounts.length > 0 && (
                <button
                  onClick={() => setMode('create')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-vault-accent border border-vault-accent/20 hover:bg-vault-accent/5 transition-all"
                >
                  <UserPlus size={15} />
                  创建新账户
                </button>
              )}
            </>
          )}

          {/* ===== 登录界面 ===== */}
          {mode === 'login' && (
            <>
              <div className="text-center mb-5 sm:mb-6">
                <h1 className="font-mono text-xl sm:text-2xl font-bold gradient-text mb-1">
                  解锁保险库
                </h1>
                <p className="text-xs sm:text-sm text-vault-muted flex items-center justify-center gap-1.5">
                  <UserCircle size={14} />
                  {selectedAccount}
                </p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="输入主密码"
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

                {/* 记住密码 */}
                <label className="flex items-center gap-2 px-1 cursor-pointer">
                  <div
                    onClick={() => setRemember(!remember)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      remember ? 'bg-vault-accent/30' : 'bg-vault-border'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
                        remember ? 'left-[18px] bg-vault-accent' : 'left-0.5 bg-vault-muted'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-vault-muted">记住密码（关闭浏览器后自动清除）</span>
                </label>

                {error && (
                  <div className="text-sm text-vault-danger bg-vault-danger/10 border border-vault-danger/30 rounded-lg px-4 py-2 animate-fade-in">
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary flex items-center justify-center gap-2 mt-1 py-2.5">
                  <Lock size={16} />
                  解锁
                </button>
              </form>

              <button
                onClick={() => { setMode('select'); setPassword(''); setError(''); }}
                className="w-full flex items-center justify-center gap-1.5 mt-4 text-xs text-vault-muted hover:text-gray-300 transition-colors"
              >
                <ChevronLeft size={14} />
                返回账户选择
              </button>
            </>
          )}

          {/* ===== 创建账户界面 ===== */}
          {mode === 'create' && (
            <>
              <div className="text-center mb-5 sm:mb-6">
                <h1 className="font-mono text-xl sm:text-2xl font-bold gradient-text mb-2">
                  创建新账户
                </h1>
                <p className="text-xs sm:text-sm text-vault-muted">
                  设置账户名称和主密码
                </p>
              </div>

              <form onSubmit={handleCreate} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
                    账户名称 <span className="text-vault-danger">*</span>
                  </label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
                    <input
                      type="text"
                      value={newAccountName}
                      onChange={e => setNewAccountName(e.target.value)}
                      placeholder="如：我的密码库"
                      className="vault-input pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
                    主密码 <span className="text-vault-danger">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="至少 6 位"
                      className="vault-input pl-10 pr-10 font-mono"
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

                <div>
                  <label className="block text-xs font-mono text-vault-muted uppercase tracking-wider mb-1.5">
                    确认主密码 <span className="text-vault-danger">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="再次输入"
                      className="vault-input pl-10 pr-10 font-mono"
                    />
                  </div>
                </div>

                {/* 记住密码 */}
                <label className="flex items-center gap-2 px-1 cursor-pointer">
                  <div
                    onClick={() => setRemember(!remember)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      remember ? 'bg-vault-accent/30' : 'bg-vault-border'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
                        remember ? 'left-[18px] bg-vault-accent' : 'left-0.5 bg-vault-muted'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-vault-muted">记住密码</span>
                </label>

                {error && (
                  <div className="text-sm text-vault-danger bg-vault-danger/10 border border-vault-danger/30 rounded-lg px-4 py-2 animate-fade-in">
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-primary flex items-center justify-center gap-2 mt-1 py-2.5">
                  <UserPlus size={16} />
                  创建账户
                </button>
              </form>

              <button
                onClick={() => { setMode('select'); setNewAccountName(''); setPassword(''); setConfirmPassword(''); setError(''); }}
                className="w-full flex items-center justify-center gap-1.5 mt-4 text-xs text-vault-muted hover:text-gray-300 transition-colors"
              >
                <ChevronLeft size={14} />
                返回
              </button>

              <div className="mt-4 flex items-start gap-2 text-[10px] sm:text-xs text-vault-muted bg-vault-card/30 rounded-lg p-3 border border-vault-border">
                <ShieldCheck size={13} className="text-vault-accent flex-shrink-0 mt-0.5" />
                <p>主密码用于加密所有数据，无法找回。每个账户的数据完全独立隔离。</p>
              </div>
            </>
          )}
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-4 sm:mt-6 text-[10px] sm:text-xs text-vault-muted font-mono">
          AES-256 加密 · 本地存储 · 多账户隔离
        </div>
      </div>
    </div>
  );
}
