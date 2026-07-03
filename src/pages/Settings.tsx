import { useRef, useState } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import {
  Download, Upload, Trash2, Clock, ShieldCheck, AlertTriangle, Check, UserCircle
} from 'lucide-react';

export default function Settings() {
  const settings = useVaultStore(s => s.settings);
  const updateSettings = useVaultStore(s => s.updateSettings);
  const clearVault = useVaultStore(s => s.clearVault);
  const currentAccount = useVaultStore(s => s.currentAccount);
  const entries = useVaultStore(s => s.entries);
  const addToast = useVaultStore(s => s.addToast);
  const exportData = useVaultStore(s => s.exportData);
  const importData = useVaultStore(s => s.importData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-cipher-backup-${currentAccount}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', '加密数据已导出');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importData(text);
      if (result.success) {
        addToast('success', `数据已导入为 "${result.account}"，请重新输入主密码`);
        setTimeout(() => clearVault(), 500);
      } else {
        addToast('error', '导入失败：文件格式无效');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCsv = () => {
    if (entries.length === 0) {
      addToast('info', '没有可导出的数据');
      return;
    }
    const headers = ['标题', '用户名', '密码', '网址', '分类', '备注'];
    const rows = entries.map(e =>
      [e.title, e.username, e.password, e.url || '', e.category, e.notes || '']
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = '\ufeff' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault-export-${currentAccount}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'CSV 已导出（明文，请注意安全）');
  };

  const handleClear = () => {
    if (confirmClear) {
      clearVault();
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 5000);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-vault-bg bg-grid">
      <header className="sticky top-0 glass border-b border-vault-border px-4 sm:px-6 py-3 sm:py-4 z-20">
        <h1 className="font-mono text-lg sm:text-xl font-bold gradient-text">设置</h1>
        <p className="text-xs sm:text-sm text-vault-muted mt-0.5">管理数据和偏好设置</p>
      </header>

      <div className="p-4 sm:p-6 pb-24 md:pb-6 max-w-2xl mx-auto flex flex-col gap-5 sm:gap-6">
        {/* 当前账户 */}
        <section className="bg-vault-card/40 border border-vault-border rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <UserCircle size={18} className="text-vault-accent" />
            <h2 className="font-medium text-gray-100">当前账户</h2>
          </div>
          <div className="bg-vault-bg/50 rounded-lg p-3 border border-vault-border">
            <div className="font-mono text-sm text-vault-accent">{currentAccount}</div>
          </div>
        </section>

        {/* 安全设置 */}
        <section className="bg-vault-card/40 border border-vault-border rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-vault-accent" />
            <h2 className="font-medium text-gray-100">安全设置</h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* 自动锁定 */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-vault-muted" />
                <span className="text-sm text-gray-300">自动锁定时间</span>
              </div>
              <select
                value={settings.autoLockMinutes}
                onChange={e => updateSettings({ autoLockMinutes: parseInt(e.target.value) })}
                className="vault-input w-auto py-1.5 px-3 text-sm"
              >
                <option value={5}>5 分钟</option>
                <option value={15}>15 分钟</option>
                <option value={30}>30 分钟</option>
                <option value={60}>1 小时</option>
                <option value={0}>不自动锁定</option>
              </select>
            </div>
          </div>
        </section>

        {/* 数据管理 */}
        <section className="bg-vault-card/40 border border-vault-border rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Download size={18} className="text-vault-accent" />
            <h2 className="font-medium text-gray-100">数据管理</h2>
          </div>

          <div className="flex flex-col gap-3">
            {/* 导出加密备份 */}
            <button
              onClick={handleExport}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-vault-bg/50 border border-vault-border hover:border-vault-accent/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <Download size={16} className="text-vault-accent" />
                <div className="text-left">
                  <div className="text-sm text-gray-200">导出加密备份</div>
                  <div className="text-xs text-vault-muted">导出加密的 JSON 文件用于备份</div>
                </div>
              </div>
            </button>

            {/* 导入备份 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-vault-bg/50 border border-vault-border hover:border-vault-accent/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <Upload size={16} className="text-vault-accent" />
                <div className="text-left">
                  <div className="text-sm text-gray-200">导入备份</div>
                  <div className="text-xs text-vault-muted">从加密 JSON 文件恢复数据</div>
                </div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            {/* 导出 CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-vault-bg/50 border border-vault-border hover:border-vault-warning/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <Download size={16} className="text-vault-warning" />
                <div className="text-left">
                  <div className="text-sm text-gray-200">导出明文 CSV</div>
                  <div className="text-xs text-vault-muted">明文导出，请注意安全风险</div>
                </div>
              </div>
              <AlertTriangle size={14} className="text-vault-warning" />
            </button>
          </div>
        </section>

        {/* 危险区域 */}
        <section className="bg-vault-danger/5 border border-vault-danger/20 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-vault-danger" />
            <h2 className="font-medium text-vault-danger">危险区域</h2>
          </div>

          <button
            onClick={handleClear}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
              confirmClear
                ? 'bg-vault-danger/20 border-vault-danger'
                : 'bg-vault-danger/5 border-vault-danger/20 hover:border-vault-danger/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Trash2 size={16} className="text-vault-danger" />
              <div className="text-left">
                <div className="text-sm text-gray-200">
                  {confirmClear ? '再次点击确认清除所有数据' : '清除所有数据'}
                </div>
                <div className="text-xs text-vault-muted">删除所有密码和主密码，不可恢复</div>
              </div>
            </div>
            {confirmClear && <Check size={16} className="text-vault-danger" />}
          </button>
        </section>

        {/* 统计信息 */}
        <section className="bg-vault-card/30 border border-vault-border rounded-2xl p-4 sm:p-5">
          <h2 className="font-mono text-xs text-vault-muted uppercase tracking-wider mb-3">保险库信息</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-vault-bg/50 rounded-lg p-3 border border-vault-border">
              <div className="text-2xl font-mono font-bold text-vault-accent">{entries.length}</div>
              <div className="text-xs text-vault-muted mt-0.5">密码总数</div>
            </div>
            <div className="bg-vault-bg/50 rounded-lg p-3 border border-vault-border">
              <div className="text-2xl font-mono font-bold text-vault-purple">
                {new Set(entries.map(e => e.category).filter(Boolean)).size}
              </div>
              <div className="text-xs text-vault-muted mt-0.5">分类数量</div>
            </div>
          </div>
        </section>

        {/* 关于 */}
        <div className="text-center text-xs text-vault-muted font-mono pb-2 sm:pb-4">
          VaultCipher v1.0 · AES-256 加密 · 多账户隔离
        </div>
      </div>
    </div>
  );
}
