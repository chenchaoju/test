import { useState, useEffect } from 'react';
import type { ClipboardEntry } from '@/lib/types';
import { useVaultStore } from '@/store/vaultStore';
import {
  X, Copy, Pencil, Trash2, Type, Image, Link, List, Folder, ExternalLink
} from 'lucide-react';

interface EntryDetailProps {
  entry: ClipboardEntry;
  onClose: () => void;
  onEdit: () => void;
}

const typeConfig: Record<string, { icon: typeof Type; label: string; color: string }> = {
  text: { icon: Type, label: '纯文本', color: 'text-blue-500 bg-blue-50 border-blue-200' },
  image: { icon: Image, label: '图片', color: 'text-purple-500 bg-purple-50 border-purple-200' },
  link: { icon: Link, label: '链接', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  mixed: { icon: List, label: '多条混合', color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
};

export default function EntryDetail({ entry, onClose, onEdit }: EntryDetailProps) {
  const deleteEntry = useVaultStore(s => s.deleteEntry);
  const addToast = useVaultStore(s => s.addToast);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const config = typeConfig[entry.type];
  const Icon = config.icon;

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

  return (
    <div className="fixed inset-0 z-40 animate-fade-in">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* 桌面端右侧抽屉 */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 animate-slide-in-right overflow-y-auto hidden md:block">
        <DetailContent
          entry={entry}
          config={config}
          Icon={Icon}
          confirmDelete={confirmDelete}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      </div>

      {/* 移动端底部抽屉 */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t border-gray-200 rounded-t-2xl animate-slide-up overflow-y-auto md:hidden">
        <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <DetailContent
          entry={entry}
          config={config}
          Icon={Icon}
          confirmDelete={confirmDelete}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
          isMobile
        />
      </div>
    </div>
  );
}

interface DetailContentProps {
  entry: ClipboardEntry;
  config: typeof typeConfig[keyof typeof typeConfig];
  Icon: typeof Type;
  confirmDelete: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (text: string, label: string) => void;
  isMobile?: boolean;
}

function DetailContent({
  entry, config, Icon, confirmDelete,
  onClose, onEdit, onDelete, onCopy, isMobile
}: DetailContentProps) {
  const renderContent = () => {
    switch (entry.type) {
      case 'text':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">文本内容</div>
              <button
                onClick={() => onCopy(entry.textContent || '', '文本')}
                className="p-1 rounded-md text-gray-400 hover:text-indigo-500 transition-colors"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {entry.textContent || '无内容'}
            </p>
          </div>
        );

      case 'link':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">链接地址</div>
              <button
                onClick={() => onCopy(entry.linkContent || '', '链接')}
                className="p-1 rounded-md text-gray-400 hover:text-indigo-500 transition-colors"
              >
                <Copy size={14} />
              </button>
            </div>
            <a
              href={entry.linkContent?.startsWith('http') ? entry.linkContent : `https://${entry.linkContent}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline break-all flex items-center gap-1"
            >
              {entry.linkContent || '无链接'}
              <ExternalLink size={12} />
            </a>
          </div>
        );

      case 'image':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">图片</div>
            {entry.imageContent ? (
              <img
                src={entry.imageContent}
                alt=""
                className="w-full rounded-lg border border-gray-200"
              />
            ) : (
              <div className="h-32 flex items-center justify-center text-sm text-gray-400">无图片</div>
            )}
          </div>
        );

      case 'mixed':
        return (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
              子项列表 ({entry.subItems?.length || 0})
            </div>
            {entry.subItems && entry.subItems.length > 0 ? (
              entry.subItems.map((item, idx) => (
                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-400">{idx + 1}.</span>
                    {item.type === 'text' ? (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">文本</span>
                    ) : (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-purple-100 text-purple-600">图片</span>
                    )}
                    <span className="text-sm font-medium text-gray-700 flex-1 truncate">{item.title}</span>
                    {item.type === 'text' && (
                      <button
                        onClick={() => onCopy(item.content, item.title)}
                        className="p-1 rounded-md text-gray-400 hover:text-indigo-500 transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                  {item.type === 'text' ? (
                    <p className="text-xs text-gray-600 break-words">{item.content || '无内容'}</p>
                  ) : item.content ? (
                    <img src={item.content} alt="" className="w-full max-h-40 object-contain rounded border border-gray-200" />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded">无图片</div>
                  )}
                </div>
              ))
            ) : (
              <div className="h-24 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                暂无子项
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* 头部 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${config.color}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="font-medium text-gray-800 truncate">{entry.title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                {config.label}
              </span>
              {entry.category && (
                <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                  <Folder size={9} />
                  {entry.category}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* 内容 */}
      <div className={`p-4 sm:p-5 flex flex-col gap-3 ${isMobile ? 'pb-24' : ''}`}>
        {renderContent()}

        {/* 时间信息 */}
        <div className="text-xs text-gray-400 flex flex-col gap-1 px-1 mt-1">
          <div>创建: {new Date(entry.createdAt).toLocaleString('zh-CN')}</div>
          <div>更新: {new Date(entry.updatedAt).toLocaleString('zh-CN')}</div>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 flex items-center gap-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 flex-1 justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Pencil size={15} />
          编辑
        </button>
        <button
          onClick={onDelete}
          className={`flex items-center gap-2 justify-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all border ${
            confirmDelete
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
          }`}
        >
          <Trash2 size={15} />
          {confirmDelete ? '确认删除' : '删除'}
        </button>
      </div>
    </>
  );
}
