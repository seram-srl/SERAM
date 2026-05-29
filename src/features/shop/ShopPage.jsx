import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Lock, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

export default function ShopPage() {
  const { products, hasPremiumAccess, handleAddToCart, handleAccessItem } = useApp();

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/[0.06] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Catálogo de Productos Ecológicos</h1>
          <p className="text-sm text-slate-500 mt-1">Accesorios, cuadernos educativos de biodiversidad y cursos oficiales.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="glass-panel-dark text-[#00e03c] border border-[#00e03c]/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Envíos Carbono Neutro
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(product => (
          <div key={product.id} className="glass-panel-dark rounded-2xl overflow-hidden flex flex-col h-full group border border-white/[0.06] hover:border-white/12 transition-all">
            <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-[#00e03c] text-slate-950 text-[10px] font-black px-2 py-1 rounded">
                {product.category}
              </span>
              {product.isPremium && (
                <span className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-1 rounded">
                  Premium
                </span>
              )}
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-base group-hover:text-[#00e03c] transition-colors">{product.name}</h3>
                <p className="text-xs text-slate-400">{product.desc}</p>
              </div>
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-[#00e03c]">${product.price} USD</span>
                  <span className="text-[10px] text-slate-600">Stock: {product.stock} unidades</span>
                </div>
                <button
                  onClick={() => handleAccessItem(product, 'product', () => handleAddToCart(product))}
                  className="bg-white/10 hover:bg-[#00e03c]/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-[#00e03c]/40 flex items-center gap-1.5 uppercase"
                  data-cursor-text="COMPRAR"
                >
                  {product.isPremium && !hasPremiumAccess ? (
                    <><Lock className="w-3.5 h-3.5 text-amber-400" /><span>Premium</span></>
                  ) : (
                    <><ShoppingCart className="w-4 h-4" /><span>Comprar</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
