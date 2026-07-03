import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVaultStore } from '@/store/vaultStore';
import Logo from './Logo';
import { Lock, Vault, KeyRound, Settings, Folder, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { path: '/vault', label: '密码库', icon: Vault },
  { path: '/generator', label: '生成器', icon: KeyRound },
  { path: '/settings', label: '设置', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const entries = useVaultStore(s => s.entries);
  const currentAccount = useVaultStore(s => s.currentAccount);
  const lock = useVaultStore(s => s.lock);
  const switchAccount = useVaultStore(s => s.switchAccount);

  const categories = ['all', ...Array.from(new Set(entries.map(e => e.category).filter(Boolean)))];

  const categoryLabels: Record<string, string> = {
    all: '全部',
  };

  return (
    <aside
      className={`hidden lg:flex h-screen glass border-r border-vault-border flex-col transition-all duration-300 relative ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`p-4 sm:p-5 border-b border-vault-border flex items-center ${collapsed ? 'justify-center' : ''}`}>
        <Logo size={collapsed ? 32 : 48} showText={!collapsed} />
      </div>

      {/* 当前账户 */}
      {currentAccount && !collapsed && (
        <div className="px-5 py-2.5 border-b border-vault-border">
          <div className="text-xs font-mono text-vault-muted uppercase tracking-wider mb-1">当前账户</div>
          <div className="text-sm text-gray-200 font-medium truncate">{currentAccount}</div>
        </div>
      )}

      {/* 导航 */}
      <nav className="p-3 sm:p-4 flex flex-col gap-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium relative group ${
                isActive
                  ? 'bg-vault-accent/10 text-vault-accent border border-vault-accent/30'
                  : 'text-gray-400 hover:text-white hover:bg-vault-card/50 border border-transparent'
              }`}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-vault-card border border-vault-border text-xs text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 分类列表 */}
      <div className="px-3 sm:px-4 py-3 border-t border-vault-border flex-1 overflow-y-auto">
        {!collapsed && (
          <div className="text-xs text-vault-muted font-mono uppercase tracking-wider mb-3 px-1">
            分类
          </div>
        )}
        <div className="flex flex-col gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-2 px-3 py-1.5 text-sm text-gray-400 rounded-md hover:bg-vault-card/50 transition-colors relative group`}
            >
              <Folder size={14} className="text-vault-purple" />
              {!collapsed && (
                <>
                  <span>{categoryLabels[cat] || cat}</span>
                  <span className="ml-auto text-xs text-vault-muted">
                    {cat === 'all' ? entries.length : entries.filter(e => e.category === cat).length}
                  </span>
                </>
              )}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-vault-card border border-vault-border text-xs text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {categoryLabels[cat] || cat} ({cat === 'all' ? entries.length : entries.filter(e => e.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 底部操作 */}
      <div className={`p-3 sm:p-4 border-t border-vault-border flex flex-col ${collapsed ? 'gap-1 items-center' : 'gap-2'}`}>
        <button
          onClick={switchAccount}
          className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 border border-vault-border hover:border-vault-accent/30 hover:text-vault-accent transition-all relative group`}
        >
          <LogOut size={15} />
          {!collapsed && <span>切换账户</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-vault-card border border-vault-border text-xs text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              切换账户
            </span>
          )}
        </button>
        <button
          onClick={lock}
          className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-2 px-3 py-2 rounded-lg text-sm font-medium text-vault-danger border border-vault-danger/30 hover:bg-vault-danger/10 transition-all relative group`}
        >
          <Lock size={15} />
          {!collapsed && <span>锁定保险库</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-vault-card border border-vault-border text-xs text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              锁定保险库
            </span>
          )}
        </button>
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-12 rounded-r-lg glass border border-l-0 border-vault-border flex items-center justify-center text-vault-accent hover:text-white hover:bg-vault-accent/10 transition-all z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
