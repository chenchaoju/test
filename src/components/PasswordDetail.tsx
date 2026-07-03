import { useState, useEffect } from 'react';
import type { PasswordEntry } from '@/lib/types';
import { useVaultStore } from '@/store/vaultStore';
import { checkStrength } from '@/lib/passwordGenerator';
import {
  X, Eye, EyeOff, Copy, ExternalLink, Pencil, Trash2, User, Globe, KeyRound, FileText, Folder
} from 'lucide-react';

interface PasswordDetailProps {
  entry: PasswordEntry;
  onClose: () => void;
  onEdit: () => void;
}

export default function PasswordDetail({ entry, onClose, onEdit }: PasswordDetailProps) {
  const deleteEntry = useVaultStore(s => s.deleteEntry);
  const addToast = useVaultStore(s => s.addToast);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const strength = checkStrength(entry.password);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', `${label}已复制`);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteEntry(entry.id);
      onClose();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const fields = [
    { icon: User, label: '用户名', value: entry.username, copyable: true },
    { icon: KeyRound, label: '密码', value: entry.password, copyable: true, masked: true },
    { icon: Globe, label: '网址', value: entry.url, copyable: true, link: true },
    { icon: Folder, label: '分类', value: entry.category },
    { icon: FileText, label: '备注', value: entry.notes, multiline: true },
  ];

  return (
    <div className="fixed inset-0 z-40 animate-fade-in">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 桌面端右侧抽屉 / 移动端底部抽屉 */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md glass border-l border-vault-border animate-slide-in-right overflow-y-auto hidden md:block">
        <DetailContent
          entry={entry}
          strength={strength}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          confirmDelete={confirmDelete}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
          fields={fields}
        />
      </div>

      {/* 移动端底部抽屉 */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] glass border-t border-vault-border rounded-t-2xl animate-slide-up overflow-y-auto md:hidden">
        {/* 拖拽指示条 */}
        <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-vault-border" />
        </div>
        <DetailContent
          entry={entry}
          strength={strength}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          confirmDelete={confirmDelete}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
          fields={fields}
          isMobile
        />
      </div>
    </div>
  );
}

interface DetailContentProps {
  entry: PasswordEntry;
  strength: ReturnType<typeof checkStrength>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  confirmDelete: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (text: string, label: string) => void;
  fields: { icon: typeof User; label: string; value?: string; copyable?: boolean; masked?: boolean; link?: boolean; multiline?: boolean }[];
  isMobile?: boolean;
}

function DetailContent({
  entry, strength, showPassword, setShowPassword, confirmDelete,
  onClose, onEdit, onDelete, onCopy, fields, isMobile
}: DetailContentProps) {
  return (
    <>
      {/* 头部 */}
      <div className="sticky top-0 glass border-b border-vault-border p-4 sm:p-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vault-accent/20 to-vault-purple/20 border border-vault-border flex items-center justify-center">
            <span className="font-mono font-bold text-vault-accent">
              {entry.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="font-medium text-gray-100 truncate">{entry.title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: strength.color }} />
              <span className="text-[10px] font-mono text-vault-muted uppercase">{strength.label}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-vault-muted hover:text-white hover:bg-vault-card transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* 内容 */}
      <div className={`p-4 sm:p-5 flex flex-col gap-3 ${isMobile ? 'pb-24' : ''}`}>
        {fields.map((field, idx) => {
          if (!field.value) return null;
          const Icon = field.icon;
          return (
            <div key={idx} className="bg-vault-card/40 border border-vault-border rounded-xl p-3.5 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-vault-muted uppercase tracking-wider">
                  <Icon size={13} />
                  {field.label}
                </div>
                {field.copyable && (
                  <button
                    onClick={() => onCopy(field.value!, field.label)}
                    className="p-1 rounded-md text-vault-muted hover:text-vault-accent transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {field.masked && !showPassword ? (
                  <>
                    <span className="font-mono text-gray-200 flex-1">{'•'.repeat(Math.min(field.value.length, 20))}</span>
                    <button
                      onClick={() => setShowPassword(true)}
                      className="p-1 rounded-md text-vault-muted hover:text-vault-accent transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                  </>
                ) : field.link ? (
                  <>
                    <a
                      href={field.value.startsWith('http') ? field.value : `https://${field.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vault-accent hover:underline flex-1 truncate text-sm"
                    >
                      {field.value}
                    </a>
                    <a
                      href={field.value.startsWith('http') ? field.value : `https://${field.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md text-vault-muted hover:text-vault-accent transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                ) : field.multiline ? (
                  <p className={`text-sm text-gray-200 flex-1 ${field.masked ? 'font-mono break-all' : 'whitespace-pre-wrap'}`}>
                    {field.value}
                  </p>
                ) : (
                  <span className={`text-sm text-gray-200 flex-1 ${field.masked ? 'font-mono break-all' : 'truncate'}`}>
                    {field.value}
                  </span>
                )}
                {field.masked && showPassword && (
                  <button
                    onClick={() => setShowPassword(false)}
                    className="p-1 rounded-md text-vault-muted hover:text-vault-accent transition-colors"
                  >
                    <EyeOff size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* 时间信息 */}
        <div className="text-xs text-vault-muted font-mono flex flex-col gap-1 px-1 mt-1">
          <div>创建: {new Date(entry.createdAt).toLocaleString('zh-CN')}</div>
          <div>更新: {new Date(entry.updatedAt).toLocaleString('zh-CN')}</div>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="sticky bottom-0 glass border-t border-vault-border p-3 sm:p-4 flex items-center gap-3">
        <button
          onClick={onEdit}
          className="btn-secondary flex items-center gap-2 flex-1 justify-center"
        >
          <Pencil size={15} />
          编辑
        </button>
        <button
          onClick={onDelete}
          className={`flex items-center gap-2 justify-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all border ${
            confirmDelete
              ? 'bg-vault-danger text-white border-vault-danger'
              : 'bg-vault-danger/10 text-vault-danger border-vault-danger/30 hover:bg-vault-danger/20'
          }`}
        >
          <Trash2 size={15} />
          {confirmDelete ? '确认删除' : '删除'}
        </button>
      </div>
    </>
  );
}
