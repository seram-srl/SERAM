import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toast } = useApp();
  if (!toast.show) return null;

  const styles = {
    success: {
      bg: 'bg-slate-950 border-[#00e03c]/60',
      text: 'text-emerald-100',
      icon: <CheckCircle className="w-4 h-4 text-[#00e03c] shrink-0" />,
    },
    error: {
      bg: 'bg-rose-950 border-rose-500/60',
      text: 'text-rose-100',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900 border-slate-600/60',
      text: 'text-slate-100',
      icon: <Info className="w-4 h-4 text-slate-400 shrink-0" />,
    },
  };

  const s = styles[toast.type] || styles.success;

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl animate-fadeIn max-w-sm ${s.bg}`}>
      {s.icon}
      <p className={`text-sm font-semibold ${s.text}`}>{toast.message}</p>
    </div>
  );
}
