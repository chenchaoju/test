import type { ClipboardEntry } from '@/lib/types';
import { Type, Image, Link, List, Copy, Folder } from 'lucide-react';
import { useVaultStore } from '@/store/vaultStore';

interface EntryCardProps {
  entry: ClipboardEntry;
  onClick: () => void;
}

const typeConfig: Record<string, { icon: typeof Type; label: string; color: string }> = {
  text: { icon: Type, label: '文本', color: 'text-blue-500 bg-blue-50 border-blue-200' },
  image: { icon: Image, label: '图片', color: 'text-purple-500 bg-purple-50 border-purple-200' },
  link: { icon: Link, label: '链接', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  mixed: { icon: List, label: '混合', color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
};

export default function EntryCard({ entry, onClick }: EntryCardProps) {
  const addToast = useVaultStore(s => s.addToast);
  const config = typeConfig[entry.type];
  const Icon = config.icon;

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    addToast('success', `${label}已复制`);
  };

  const getPreview = () => {
    switch (entry.type) {
      case 'text':
        return entry.textContent?.slice(0, 60) || '无内容';
      case 'link':
        return entry.linkContent || '无链接';
      case 'image':
        return entry.imageContent ? '[图片]' : '无图片';
      case 'mixed':
        return `${entry.subItems?.length || 0} 条内容`;
      default:
        return '';
    }
  };

  const getCopyContent = () => {
    switch (entry.type) {
      case 'text':
        return entry.textContent || '';
      case 'link':
        return entry.linkContent || '';
      case 'mixed':
        return entry.subItems?.map(i => i.content).join('\n') || '';
      default:
        return '';
    }
  };

  const copyable = entry.type === 'text' || entry.type === 'link' || entry.type === 'mixed';

  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-gray-200 rounded-xl p-4 cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100"
    >
      {/* 头部 */}
      <div className="flex items-start gap-3 mb-3">
        {/* 类型图标 */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${config.color}`}>
          <Icon size={16} />
        </div>

        {/* 标题 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate text-sm">{entry.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
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

      {/* 预览 */}
      {entry.type === 'image' && entry.imageContent ? (
        <div className="h-24 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
          <img src={entry.imageContent} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <p className="text-xs text-gray-500 truncate">{getPreview()}</p>
      )}

      {/* 复制按钮 */}
      {copyable && (
        <button
          onClick={(e) => handleCopy(e, getCopyContent(), '内容')}
          className="absolute top-3 right-3 p-1.5 rounded-md text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all"
          title="复制内容"
        >
          <Copy size={14} />
        </button>
      )}
    </div>
  );
}
