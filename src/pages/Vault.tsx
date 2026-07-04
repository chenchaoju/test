import { useState, useMemo } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import EntryCard from '@/components/EntryCard';
import EntryForm from '@/components/EntryForm';
import EntryDetail from '@/components/EntryDetail';
import type { ClipboardEntry } from '@/lib/types';
import { Search, Plus, FileX, ClipboardList } from 'lucide-react';

export default function Vault() {
  const entries = useVaultStore(s => s.entries);
  const searchQuery = useVaultStore(s => s.searchQuery);
  const setSearchQuery = useVaultStore(s => s.setSearchQuery);
  const selectedCategory = useVaultStore(s => s.selectedCategory);
  const setSelectedCategory = useVaultStore(s => s.setSelectedCategory);
  const categories = useVaultStore(s => s.categories);

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ClipboardEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<ClipboardEntry | null>(null);

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.textContent?.toLowerCase().includes(q) ||
        e.linkContent?.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [entries, searchQuery, selectedCategory]);

  const handleEdit = (entry: ClipboardEntry) => {
    setDetailEntry(null);
    setEditingEntry(entry);
    setShowForm(true);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-50">
      {/* 顶部栏 */}
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-4 z-20">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索复制板..."
              className="w-full h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  : 'text-gray-500 hover:text-gray-700 border border-transparent hover:bg-gray-100'
              }`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    : 'text-gray-500 hover:text-gray-700 border border-transparent hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 新增按钮 */}
          <button
            onClick={() => { setEditingEntry(null); setShowForm(true); }}
            className="flex items-center gap-2 whitespace-nowrap px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">新建复制板</span>
          </button>
        </div>
      </header>

      {/* 内容区 */}
      <div className="p-4 sm:p-6 pb-24 md:pb-6">
        {entries.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-100 flex items-center justify-center mb-4 sm:mb-6">
              <ClipboardList size={28} className="text-indigo-400 sm:hidden" />
              <ClipboardList size={36} className="text-indigo-400 hidden sm:block" />
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">复制板为空</h2>
            <p className="text-sm text-gray-500 mb-5 sm:mb-6">添加您的第一条内容，开始高效管理</p>
            <button
              onClick={() => { setEditingEntry(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <Plus size={18} />
              添加内容
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          /* 无搜索结果 */
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-3 sm:mb-4">
              <FileX size={24} className="text-gray-400 sm:hidden" />
              <FileX size={28} className="text-gray-400 hidden sm:block" />
            </div>
            <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-1">未找到匹配的内容</h2>
            <p className="text-sm text-gray-500">尝试调整搜索关键词或分类筛选</p>
          </div>
        ) : (
          /* 列表 */
          <>
            <div className="mb-3 sm:mb-4 text-xs text-gray-400 font-mono">
              共 {filteredEntries.length} 条
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredEntries.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => setDetailEntry(entry)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 表单弹窗 */}
      {showForm && (
        <EntryForm
          entry={editingEntry}
          onClose={() => { setShowForm(false); setEditingEntry(null); }}
        />
      )}

      {/* 详情抽屉 */}
      {detailEntry && (
        <EntryDetail
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onEdit={() => handleEdit(detailEntry)}
        />
      )}
    </div>
  );
}
