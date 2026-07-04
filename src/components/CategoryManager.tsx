import { useState } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import { X, Plus, Pencil, Trash2, Folder, Check, Tags } from 'lucide-react';

interface CategoryManagerProps {
  onClose: () => void;
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const categories = useVaultStore(s => s.categories);
  const entries = useVaultStore(s => s.entries);
  const addCategory = useVaultStore(s => s.addCategory);
  const deleteCategory = useVaultStore(s => s.deleteCategory);
  const renameCategory = useVaultStore(s => s.renameCategory);

  const [newCat, setNewCat] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    addCategory(newCat.trim());
    setNewCat('');
  };

  const handleRename = (oldCat: string) => {
    if (!editValue.trim() || editValue.trim() === oldCat) {
      setEditingCat(null);
      return;
    }
    renameCategory(oldCat, editValue.trim());
    setEditingCat(null);
    setEditValue('');
  };

  const handleDelete = (cat: string) => {
    if (confirmDelete === cat) {
      deleteCategory(cat);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(cat);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md glass border border-vault-border rounded-2xl shadow-2xl animate-slide-up max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-vault-border">
          <div className="flex items-center gap-2">
            <Tags size={18} className="text-vault-accent" />
            <h2 className="font-mono font-bold text-lg gradient-text">分类管理</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-vault-muted hover:text-white hover:bg-vault-card transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 新增分类 */}
        <form onSubmit={handleAdd} className="p-5 pb-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              placeholder="输入新分类名称"
              className="vault-input flex-1"
            />
            <button
              type="submit"
              className="btn-primary flex items-center gap-1.5 px-4 py-2.5"
              disabled={!newCat.trim()}
            >
              <Plus size={16} />
              添加
            </button>
          </div>
        </form>

        {/* 分类列表 */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-sm text-vault-muted">
              暂无分类，密码添加时会自动创建
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => {
                const count = entries.filter(e => e.category === cat).length;
                const isEditing = editingCat === cat;
                const isConfirming = confirmDelete === cat;

                return (
                  <div
                    key={cat}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-vault-card/40 border border-vault-border hover:border-vault-accent/20 transition-all"
                  >
                    <Folder size={14} className="text-vault-purple flex-shrink-0" />

                    {isEditing ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => handleRename(cat)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(cat);
                          if (e.key === 'Escape') setEditingCat(null);
                        }}
                        className="vault-input flex-1 py-1.5 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 text-sm text-gray-200 truncate">{cat}</span>
                    )}

                    <span className="text-xs text-vault-muted font-mono">{count} 条</span>

                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingCat(cat); setEditValue(cat); }}
                          className="p-1.5 rounded-md text-vault-muted hover:text-vault-accent transition-colors"
                          title="重命名"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className={`p-1.5 rounded-md transition-colors ${
                            isConfirming
                              ? 'text-vault-danger bg-vault-danger/10'
                              : 'text-vault-muted hover:text-vault-danger'
                          }`}
                          title={isConfirming ? '确认删除' : '删除'}
                        >
                          {isConfirming ? <Check size={13} /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
