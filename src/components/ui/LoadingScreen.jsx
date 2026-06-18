import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @component LoadingScreen
 * @description Pantalla de carga superpuesta premium que lee el estado de carga de Drei useProgress.
 * Desaparece con una transición suave una vez compiladas las texturas y geometrías.
 */
export default function LoadingScreen() {
  const { active, progress, item } = useProgress();
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => {
        setShouldShow(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(true);
    }
  }, [active, progress]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#010409] flex flex-col items-center justify-center select-none"
        >
          {/* Atmósfera luminosa */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
          
          <div className="space-y-6 text-center z-10">
            {/* Logotipo */}
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-black text-white tracking-tighter">SER</span>
              <span className="text-3xl font-black text-[#00e03c] tracking-tighter">A</span>
              <span className="text-3xl font-black text-white tracking-tighter">M</span>
            </div>
            
            {/* Porcentaje */}
            <div className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">
              Cargando Ecosistema... {Math.round(progress)}%
            </div>

            {/* Barra de progreso */}
            <div className="w-64 h-[3px] bg-white/15 rounded-full overflow-hidden mx-auto relative">
              <motion.div
                className="h-full bg-[#00e03c] shadow-[0_0_8px_#00e03c]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              />
            </div>
            
            {/* Detalle del archivo en carga */}
            <div className="text-[9px] font-mono text-slate-500 tracking-wider h-4 max-w-[280px] truncate px-4">
              {item ? `Recurso: ${item.split('/').pop()}` : 'Compilando shaders en memoria...'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
