import { useNavigate, useLocation } from 'react-router-dom';
import { useVaultStore } from '@/store/vaultStore';
import Logo from './Logo';
import { Lock, Vault, KeyRound, Settings, Folder } from 'lucide-react';

const navItems = [
  { path: '/vault', label: '密码库', icon: Vault },
  { path: '/generator', label: '生成器', icon: KeyRound },
  { path: '/settings', label: '设置', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const entries = useVaultStore(s => s.entries);
  const lock = useVaultStore(s => s.lock);

  const categories = ['all', ...Array.from(new Set(entries.map(e => e.category).filter(Boolean)))];

  const categoryLabels: Record<string, string> = {
    all: '全部',
  };

  return (
    <aside className="w-64 h-screen glass border-r border-vault-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-vault-border">
        <Logo />
      </div>

      {/* 导航 */}
      <nav className="p-4 flex flex-col gap-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? 'bg-vault-accent/10 text-vault-accent border border-vault-accent/30'
                  : 'text-gray-400 hover:text-white hover:bg-vault-card/50 border border-transparent'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 分类列表 */}
      <div className="px-4 py-3 border-t border-vault-border flex-1 overflow-y-auto">
        <div className="text-xs text-vault-muted font-mono uppercase tracking-wider mb-3 px-1">
          分类
        </div>
        <div className="flex flex-col gap-1">
          {categories.map(cat => (
            <div
              key={cat}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 rounded-md hover:bg-vault-card/50"
            >
              <Folder size={14} className="text-vault-purple" />
              {categoryLabels[cat] || cat}
              <span className="ml-auto text-xs text-vault-muted">
                {cat === 'all' ? entries.length : entries.filter(e => e.category === cat).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部锁定按钮 */}
      <div className="p-4 border-t border-vault-border">
        <button
          onClick={lock}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-vault-danger border border-vault-danger/30 hover:bg-vault-danger/10 transition-all"
        >
          <Lock size={16} />
          锁定保险库
        </button>
      </div>
    </aside>
  );
}
