import { useNavigate, useLocation } from 'react-router-dom';
import { useVaultStore } from '@/store/vaultStore';
import { Vault, KeyRound, Settings, LogOut } from 'lucide-react';

const navItems = [
  { path: '/vault', label: '密码库', icon: Vault },
  { path: '/generator', label: '生成器', icon: KeyRound },
  { path: '/settings', label: '设置', icon: Settings },
];

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const switchAccount = useVaultStore(s => s.switchAccount);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-vault-border z-50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                isActive
                  ? 'text-vault-accent'
                  : 'text-vault-muted hover:text-gray-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={switchAccount}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-vault-muted hover:text-vault-danger transition-all"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">切换</span>
        </button>
      </div>
    </nav>
  );
}
