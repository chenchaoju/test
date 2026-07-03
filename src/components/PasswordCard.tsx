import type { PasswordEntry } from '@/lib/types';
import { checkStrength } from '@/lib/passwordGenerator';
import { Globe, User, Copy, ExternalLink } from 'lucide-react';
import { useVaultStore } from '@/store/vaultStore';

interface PasswordCardProps {
  entry: PasswordEntry;
  onClick: () => void;
}

export default function PasswordCard({ entry, onClick }: PasswordCardProps) {
  const addToast = useVaultStore(s => s.addToast);
  const strength = checkStrength(entry.password);

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    addToast('success', `${label}已复制`);
  };

  // 从域名提取首字母作为图标
  const initial = entry.title.charAt(0).toUpperCase();
  const domain = entry.url ? entry.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : '';

  return (
    <div
      onClick={onClick}
      className="group relative bg-vault-card/60 border border-vault-border rounded-xl p-4 cursor-pointer transition-all hover:border-vault-accent/40 hover:bg-vault-card hover:shadow-lg hover:shadow-vault-accent/5"
    >
      {/* 头部 */}
      <div className="flex items-start gap-3 mb-3">
        {/* 图标 */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-vault-accent/20 to-vault-purple/20 border border-vault-border flex items-center justify-center">
          {domain ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=40`}
              alt=""
              className="w-5 h-5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="font-mono font-bold text-vault-accent text-sm">{initial}</span>
          )}
        </div>

        {/* 标题和用户名 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-100 truncate text-sm">{entry.title}</h3>
          <div className="flex items-center gap-1 text-xs text-vault-muted mt-0.5">
            <User size={11} />
            <span className="truncate">{entry.username || '—'}</span>
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between gap-2">
        {/* 强度指示器 */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: strength.color }}
          />
          <span className="text-[10px] font-mono text-vault-muted uppercase">{strength.label}</span>
          {entry.category && (
            <span className="text-[10px] text-vault-purple/70 ml-1 px-1.5 py-0.5 rounded bg-vault-purple/10">
              {entry.category}
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => handleCopy(e, entry.password, '密码')}
            className="p-1.5 rounded-md text-vault-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-colors"
            title="复制密码"
          >
            <Copy size={13} />
          </button>
          {entry.url && (
            <a
              href={entry.url.startsWith('http') ? entry.url : `https://${entry.url}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-vault-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-colors"
              title="打开网址"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
