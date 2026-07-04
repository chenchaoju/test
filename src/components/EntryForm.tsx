import { useState } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import type { ClipboardEntry, SubItem, EntryType, SubItemType } from '@/lib/types';
import {
  X, Type, Image, Link, List, Plus, ArrowUp, ArrowDown, Trash2, ChevronDown, Upload
} from 'lucide-react';

interface EntryFormProps {
  entry?: ClipboardEntry | null;
  onClose: () => void;
}

const typeOptions: { value: EntryType; label: string; icon: typeof Type }[] = [
  { value: 'text', label: '纯文本', icon: Type },
  { value: 'image', label: '图片', icon: Image },
  { value: 'link', label: '链接', icon: Link },
  { value: 'mixed', label: '多条混合', icon: List },
];

export default function EntryForm({ entry, onClose }: EntryFormProps) {
  const addEntry = useVaultStore(s => s.addEntry);
  const updateEntry = useVaultStore(s => s.updateEntry);
  const categories = useVaultStore(s => s.categories);
  const entries = useVaultStore(s => s.entries);
  const addCategory = useVaultStore(s => s.addCategory);

  const isEditing = !!entry;

  const [formType, setFormType] = useState<EntryType>(entry?.type || 'text');
  const [title, setTitle] = useState(entry?.title || '');
  const [category, setCategory] = useState(entry?.category || '');
  const [textContent, setTextContent] = useState(entry?.textContent || '');
  const [imageContent, setImageContent] = useState(entry?.imageContent || '');
  const [linkContent, setLinkContent] = useState(entry?.linkContent || '');
  const [subItems, setSubItems] = useState<SubItem[]>(entry?.subItems || []);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const allCategories = Array.from(new Set([...categories, ...entries.map(e => e.category).filter(Boolean)]));

  const handleSubmit = () => {
    if (!title.trim()) return;

    const baseData = {
      title: title.trim(),
      type: formType,
      category,
    };

    if (formType === 'text') {
      if (isEditing && entry) {
        updateEntry(entry.id, { ...baseData, textContent });
      } else {
        addEntry({ ...baseData, textContent });
      }
    } else if (formType === 'image') {
      if (isEditing && entry) {
        updateEntry(entry.id, { ...baseData, imageContent });
      } else {
        addEntry({ ...baseData, imageContent });
      }
    } else if (formType === 'link') {
      if (isEditing && entry) {
        updateEntry(entry.id, { ...baseData, linkContent });
      } else {
        addEntry({ ...baseData, linkContent });
      }
    } else if (formType === 'mixed') {
      if (isEditing && entry) {
        updateEntry(entry.id, { ...baseData, subItems });
      } else {
        addEntry({ ...baseData, subItems });
      }
    }

    onClose();
  };

  const addSubItem = (type: SubItemType) => {
    const newItem: SubItem = {
      id: crypto.randomUUID(),
      type,
      title: type === 'text' ? '新文本' : '新图片',
      content: '',
    };
    setSubItems([...subItems, newItem]);
  };

  const updateSubItem = (id: string, patch: Partial<SubItem>) => {
    setSubItems(subItems.map(item =>
      item.id === id ? { ...item, ...patch } : item
    ));
  };

  const deleteSubItem = (id: string) => {
    setSubItems(subItems.filter(item => item.id !== id));
  };

  const moveSubItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...subItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setSubItems(newItems);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, onImage: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewCategory = () => {
    if (newCategoryInput.trim()) {
      addCategory(newCategoryInput.trim());
      setCategory(newCategoryInput.trim());
      setNewCategoryInput('');
      setShowCategoryDropdown(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl glass border border-vault-border rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-vault-border">
          <h2 className="font-mono font-bold text-lg gradient-text">
            {isEditing ? '编辑复制板' : '新建复制板'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-vault-muted hover:text-white hover:bg-vault-card transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 标题 */}
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1.5">标题</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="请输入标题"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white"
            />
          </div>

          {/* 类型 + 分类 */}
          <div className="flex items-start gap-6">
            {/* 类型 */}
            <div className="flex-1">
              <label className="block text-sm text-gray-700 font-medium mb-1.5">类型</label>
              <div className="flex gap-2">
                {typeOptions.map(opt => {
                  const Icon = opt.icon;
                  const isActive = formType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormType(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-300'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={14} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 分类下拉框 */}
            <div className="w-40 relative">
              <label className="block text-sm text-gray-700 font-medium mb-1.5">分类</label>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 transition-all"
              >
                <span className={category ? 'text-gray-800' : 'text-gray-400'}>
                  {category || '选择分类'}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { setCategory(''); setShowCategoryDropdown(false); }}
                    className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    无分类
                  </button>
                  {allCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setCategory(cat); setShowCategoryDropdown(false); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      {cat}
                    </button>
                  ))}
                  <div className="px-3 py-2 border-t border-gray-100">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={e => setNewCategoryInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddNewCategory()}
                        placeholder="新建分类..."
                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                      >
                        新建
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 根据类型显示不同内容 */}
          {formType === 'text' && (
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1.5">文本内容</label>
              <textarea
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="输入文本内容..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none bg-white"
              />
            </div>
          )}

          {formType === 'image' && (
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1.5">图片</label>
              {imageContent ? (
                <div className="relative">
                  <img
                    src={imageContent}
                    alt=""
                    className="w-full max-h-64 object-contain border border-gray-200 rounded-lg bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setImageContent('')}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-md text-gray-600 hover:text-red-500 shadow-sm transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="block w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                  <Upload size={24} className="text-gray-400 mb-1.5" />
                  <span className="text-sm text-gray-500">点击上传图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageUpload(e, dataUrl => setImageContent(dataUrl))}
                  />
                </label>
              )}
            </div>
          )}

          {formType === 'link' && (
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1.5">链接地址</label>
              <input
                type="url"
                value={linkContent}
                onChange={e => setLinkContent(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white"
              />
            </div>
          )}

          {formType === 'mixed' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-700 font-medium">
                  子项列表{subItems.length > 0 && ` (${subItems.length} 项)`}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addSubItem('text')}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Type size={12} />
                    添加文本
                  </button>
                  <button
                    type="button"
                    onClick={() => addSubItem('image')}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                  >
                    <Image size={12} />
                    添加图片
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {subItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-400">{index + 1}.</span>
                      {item.type === 'text' ? (
                        <span className="text-xs font-medium px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                          文本
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">
                          图片
                        </span>
                      )}
                      <input
                        type="text"
                        value={item.title}
                        onChange={e => updateSubItem(item.id, { title: e.target.value })}
                        className="flex-1 text-sm border-none focus:outline-none focus:ring-0 px-0 bg-transparent"
                      />
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveSubItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSubItem(index, 'down')}
                          disabled={index === subItems.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {item.type === 'text' ? (
                      <input
                        type="text"
                        value={item.content}
                        onChange={e => updateSubItem(item.id, { content: e.target.value })}
                        placeholder="输入文本内容..."
                        className="w-full text-sm border border-gray-100 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-300 bg-gray-50"
                      />
                    ) : item.content ? (
                      <div className="relative">
                        <img
                          src={item.content}
                          alt=""
                          className="w-full max-h-40 object-contain border border-gray-100 rounded bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={() => updateSubItem(item.id, { content: '' })}
                          className="absolute top-1 right-1 p-1 bg-white/90 rounded text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ) : (
                      <label className="block w-full h-20 border border-dashed border-gray-200 rounded flex items-center justify-center cursor-pointer hover:border-indigo-300 bg-gray-50 transition-colors">
                        <span className="text-xs text-gray-400">点击上传图片</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleImageUpload(e, dataUrl => updateSubItem(item.id, { content: dataUrl }))}
                        />
                      </label>
                    )}
                  </div>
                ))}

                {subItems.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-400">
                    点击上方按钮添加文本或图片
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-vault-border bg-white/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEditing ? '保存修改' : '立即创建'}
          </button>
        </div>
      </div>
    </div>
  );
}
