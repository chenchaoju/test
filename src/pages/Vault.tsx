import { useState, useMemo } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import PasswordCard from '@/components/PasswordCard';
import PasswordForm from '@/components/PasswordForm';
import PasswordDetail from '@/components/PasswordDetail';
import type { PasswordEntry } from '@/lib/types';
import { Search, Plus, ShieldX, KeyRound } from 'lucide-react';

export default function Vault() {
  const entries = useVaultStore(s => s.entries);
  const searchQuery = useVaultStore(s => s.searchQuery);
  const setSearchQuery = useVaultStore(s => s.setSearchQuery);
  const selectedCategory = useVaultStore(s => s.selectedCategory);
  const setSelectedCategory = useVaultStore(s => s.setSelectedCategory);

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<PasswordEntry | null>(null);

  // 过滤后的条目
  const filteredEntries = useMemo(() => {
    let result = entries;
    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.username.toLowerCase().includes(q) ||
        e.url?.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [entries, searchQuery, selectedCategory]);

  // 分类列表
  const categories = useVaultStore(s => s.categories);

  const handleEdit = (entry: PasswordEntry) => {
    setDetailEntry(null);
    setEditingEntry(entry);
    setShowForm(true);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-vault-bg bg-grid">
      {/* 顶部栏 */}
      <header className="sticky top-0 glass border-b border-vault-border px-6 py-4 z-20">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vault-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索密码..."
              className="vault-input pl-10"
            />
          </div>

          {/* 分类筛选 - 桌面端横向按钮，移动端横向滚动 */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-vault-accent/10 text-vault-accent border border-vault-accent/30'
                  : 'text-gray-400 hover:text-white border border-transparent hover:bg-vault-card/50'
              }`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-vault-accent/10 text-vault-accent border border-vault-accent/30'
                    : 'text-gray-400 hover:text-white border border-transparent hover:bg-vault-card/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 新增按钮 */}
          <button
            onClick={() => { setEditingEntry(null); setShowForm(true); }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">新增密码</span>
          </button>
        </div>
      </header>

      {/* 内容区 */}
      <div className="p-4 sm:p-6 pb-24 md:pb-6">
        {entries.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-vault-accent/10 to-vault-purple/10 border border-vault-border flex items-center justify-center mb-4 sm:mb-6">
              <KeyRound size={28} className="text-vault-muted sm:hidden" />
              <KeyRound size={36} className="text-vault-muted hidden sm:block" />
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-gray-200 mb-2">密码库为空</h2>
            <p className="text-sm text-vault-muted mb-5 sm:mb-6">添加您的第一个密码，开始安全管理</p>
            <button
              onClick={() => { setEditingEntry(null); setShowForm(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              添加密码
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          /* 无搜索结果 */
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-vault-card border border-vault-border flex items-center justify-center mb-3 sm:mb-4">
              <ShieldX size={24} className="text-vault-muted sm:hidden" />
              <ShieldX size={28} className="text-vault-muted hidden sm:block" />
            </div>
            <h2 className="text-base sm:text-lg font-medium text-gray-200 mb-1">未找到匹配的密码</h2>
            <p className="text-sm text-vault-muted">尝试调整搜索关键词或分类筛选</p>
          </div>
        ) : (
          /* 密码列表 */
          <>
            <div className="mb-3 sm:mb-4 text-xs text-vault-muted font-mono">
              共 {filteredEntries.length} 条密码
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredEntries.map(entry => (
                <PasswordCard
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
        <PasswordForm
          entry={editingEntry}
          onClose={() => { setShowForm(false); setEditingEntry(null); }}
        />
      )}

      {/* 详情抽屉 */}
      {detailEntry && (
        <PasswordDetail
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onEdit={() => handleEdit(detailEntry)}
        />
      )}
    </div>
  );
}
