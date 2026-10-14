import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useScan } from '../context/ScanContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useScan();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto p-3.5 bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 rounded-xl shadow-xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-2 fade-in"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
