import { useState, useEffect } from 'react';
import { useVaultStore } from '@/store/vaultStore';
import { generatePassword, checkStrength, defaultGeneratorOptions } from '@/lib/passwordGenerator';
import type { GeneratorOptions } from '@/lib/types';
import { RefreshCw, Copy, Check } from 'lucide-react';

export default function Generator() {
  const addToast = useVaultStore(s => s.addToast);
  const [options, setOptions] = useState<GeneratorOptions>(defaultGeneratorOptions);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // 初始生成
  useEffect(() => {
    const pwd = generatePassword(options);
    setPassword(pwd);
  }, []);

  const handleGenerate = () => {
    const pwd = generatePassword(options);
    setPassword(pwd);
    setHistory(prev => [pwd, ...prev].slice(0, 5));
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    addToast('success', '密码已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = checkStrength(password);

  const toggleOption = (key: keyof GeneratorOptions) => {
    if (key === 'length') return;
    if (key === 'excludeAmbiguous') {
      setOptions(prev => ({ ...prev, excludeAmbiguous: !prev.excludeAmbiguous }));
    } else {
      setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const optionList: { key: keyof GeneratorOptions; label: string }[] = [
    { key: 'uppercase', label: '大写字母 (A-Z)' },
    { key: 'lowercase', label: '小写字母 (a-z)' },
    { key: 'numbers', label: '数字 (0-9)' },
    { key: 'symbols', label: '特殊符号 (!@#$...)' },
    { key: 'excludeAmbiguous', label: '排除易混淆字符 (Il1O0o)' },
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-vault-bg bg-grid">
      <header className="sticky top-0 glass border-b border-vault-border px-6 py-4 z-20">
        <h1 className="font-mono text-xl font-bold gradient-text">密码生成器</h1>
        <p className="text-sm text-vault-muted mt-0.5">生成安全的随机密码</p>
      </header>

      <div className="p-6 max-w-2xl mx-auto">
        {/* 密码显示区 */}
        <div className="bg-vault-card/60 border border-vault-border rounded-2xl p-6 mb-6">
          <div className="font-mono text-2xl md:text-3xl text-gray-100 break-all min-h-[80px] flex items-center justify-center text-center px-4">
            {password || '—'}
          </div>

          {/* 强度条 */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-1.5 bg-vault-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(strength.score / 8) * 100}%`, backgroundColor: strength.color }}
              />
            </div>
            <span className="text-sm font-mono font-medium" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleGenerate}
              className="btn-primary flex items-center gap-2 flex-1 justify-center py-2.5"
            >
              <RefreshCw size={16} />
              重新生成
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all border ${
                copied
                  ? 'bg-vault-success/10 text-vault-success border-vault-success/30'
                  : 'bg-vault-card text-gray-200 border-vault-border hover:border-vault-accent hover:text-vault-accent'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>

        {/* 设置区 */}
        <div className="bg-vault-card/40 border border-vault-border rounded-2xl p-6">
          <h3 className="text-sm font-mono text-vault-muted uppercase tracking-wider mb-4">生成选项</h3>

          {/* 长度滑块 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">密码长度</label>
              <span className="font-mono text-lg font-bold text-vault-accent">{options.length}</span>
            </div>
            <input
              type="range"
              min="4"
              max="64"
              value={options.length}
              onChange={e => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
              className="w-full h-2 bg-vault-border rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-vault-accent
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,240,255,0.5)]
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-vault-accent
                [&::-moz-range-thumb]:border-none
                [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-vault-muted mt-1 font-mono">
              <span>4</span>
              <span>16</span>
              <span>32</span>
              <span>48</span>
              <span>64</span>
            </div>
          </div>

          {/* 字符选项 */}
          <div className="flex flex-col gap-2">
            {optionList.map(opt => {
              const isEnabled = options[opt.key as keyof GeneratorOptions] as boolean;
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleOption(opt.key)}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-vault-bg/50 border border-vault-border hover:border-vault-accent/30 transition-all text-left"
                >
                  <span className="text-sm text-gray-300">{opt.label}</span>
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      isEnabled ? 'bg-vault-accent/30' : 'bg-vault-border'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                        isEnabled ? 'left-5 bg-vault-accent' : 'left-0.5 bg-vault-muted'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-mono text-vault-muted uppercase tracking-wider mb-3">最近生成</h3>
            <div className="flex flex-col gap-2">
              {history.map((pwd, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-vault-card/30 border border-vault-border"
                >
                  <code className="font-mono text-sm text-gray-300 flex-1 truncate">{pwd}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pwd);
                      addToast('success', '已复制');
                    }}
                    className="p-1.5 rounded-md text-vault-muted hover:text-vault-accent transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
