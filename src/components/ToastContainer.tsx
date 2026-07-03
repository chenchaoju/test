import { useVaultStore } from '@/store/vaultStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const toasts = useVaultStore(s => s.toasts);
  const removeToast = useVaultStore(s => s.removeToast);

  const icons = {
    success: <CheckCircle size={18} className="text-vault-success" />,
    error: <XCircle size={18} className="text-vault-danger" />,
    info: <Info size={18} className="text-vault-accent" />,
  };

  const borders = {
    success: 'border-vault-success/30',
    error: 'border-vault-danger/30',
    info: 'border-vault-accent/30',
  };

  return (
    <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`glass border ${borders[toast.type]} rounded-xl px-4 py-3 flex items-center gap-3 min-w-[260px] animate-slide-up shadow-lg`}
        >
          {icons[toast.type]}
          <span className="text-sm text-gray-200 flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-vault-muted hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
