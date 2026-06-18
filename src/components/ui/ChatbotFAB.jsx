import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * @component ChatbotFAB
 * @description Botón flotante (FAB) de Chatbot en la esquina inferior derecha.
 * Al hacer click dispara un toast indicando que el chatbot estará disponible próximamente.
 */
export default function ChatbotFAB() {
  const { triggerToast } = useApp();

  const handleClick = () => {
    triggerToast('Chatbot de atención al cliente disponible próximamente.', 'info');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[110] pointer-events-auto">
      <button
        onClick={handleClick}
        className="group relative flex items-center justify-center p-4 rounded-full bg-slate-950/65 backdrop-blur-xl border border-white/10 hover:border-[#00e03c]/50 hover:bg-[#00e03c]/10 text-slate-300 hover:text-[#00e03c] transition-all duration-300 shadow-xl cursor-none"
        title="Chat de Atención"
      >
        <MessageCircle className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
        
        {/* Tooltip */}
        <span className="absolute right-14 bg-slate-950/90 border border-white/10 text-white text-[10px] font-bold tracking-wider uppercase py-1.5 px-3 rounded-xl opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
          Chat de Atención
        </span>
      </button>
    </div>
  );
}
