import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Lock, Shield, Sparkles, BookOpen, Star, HelpCircle, ArrowRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export default function ShopPage() {
  const navigate = useNavigate();
  const { products, hasPremiumAccess, handleAddToCart, handleAccessItem, triggerToast } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');

  // Categorías de "Marca/Canal" estilo Disney+
  const CATEGORIES = [
    { id: 'all', label: 'Todo', icon: <Tag className="w-4 h-4" /> },
    { id: 'Bio-Insumos', label: 'Bio-Insumos', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'Monitoreo', label: 'Monitoreo', icon: <Shield className="w-4 h-4" /> },
    { id: 'E-Books', label: 'E-Books', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'SIG & Mapas', label: 'SIG & Mapas', icon: <Star className="w-4 h-4" /> },
    { id: 'Merchandise', label: 'Merchandise', icon: <Tag className="w-4 h-4" /> }
  ];

  // Filtrar productos
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  // Producto destacado para el banner (Lombri-Kit)
  const featuredProduct = products.find(p => p.id === 11) || products[0];

  const handleBuyProduct = (product) => {
    handleAccessItem(product, 'product', () => {
      handleAddToCart(product);
    });
  };

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10"
    >
      {/* ── 1. DISNEY+ FEATURED PRODUCT SHOWCASE ── */}
      {featuredProduct && (
        <div className="relative w-full h-[40vh] sm:h-[48vh] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] group border border-white/5 pointer-events-auto">
          <div className="absolute inset-0">
            <img
              src={featuredProduct.image}
              alt={featuredProduct.name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-[6s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 p-6 sm:p-10 space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00e03c]/20 text-[#00e03c] text-[10px] font-black uppercase tracking-widest border border-[#00e03c]/30">
              <Shield className="w-3 h-3 text-[#00e03c]" /> ENVÍO CARBONO NEUTRO
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight uppercase font-display drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {featuredProduct.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg hidden sm:block">
              {featuredProduct.desc}
            </p>
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => handleBuyProduct(featuredProduct)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 hover:bg-[#00e03c] hover:text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-none"
                data-cursor-text="COMPRAR"
              >
                Añadir al Carrito · Bs. {featuredProduct.price}
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950/60 px-3 py-1 rounded border border-white/5">
                Stock: {featuredProduct.stock} unidades
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. CATEGORIES SELECTOR (Disney+ Brands Bar) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`relative py-4 px-3 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-none transition-all duration-300 ${
                isActive
                  ? 'bg-[#00e03c]/15 border-[#00e03c] text-[#00e03c] shadow-[0_0_20px_rgba(0,224,60,0.25)] scale-105'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-[#00e03c]/40 text-slate-400 hover:text-white hover:scale-105 hover:bg-[#00e03c]/5 hover:shadow-[0_0_15px_rgba(0,224,60,0.15)]'
              }`}
            >
              <div className={`p-2.5 rounded-xl border ${isActive ? 'bg-[#00e03c]/20 border-[#00e03c]/30 text-[#00e03c]' : 'bg-white/5 border-white/10'}`}>
                {cat.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-center">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. PRODUCT ROW GRIDS (Movie-style items) ── */}
      <div className="space-y-6 text-left">
        <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
          <h2 className="font-extrabold text-lg text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#00e03c]" />
            Catálogo: {CATEGORIES.find(c => c.id === activeCategory)?.label}
          </h2>
          <span className="text-xs text-slate-500">Envíos a toda Bolivia</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="glass-panel-dark rounded-2xl p-10 text-center text-slate-500 text-xs">
            No hay productos cargados en esta categoría actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const isEbook = product.category === 'E-Books';
              return (
                <div
                  key={product.id}
                  className="group relative rounded-2xl overflow-hidden glass-panel-dark border border-white/[0.06] hover:border-[#00e03c]/40 hover:shadow-[0_10px_30px_rgba(0,224,60,0.15)] transition-all duration-300 flex flex-col h-full cursor-none pointer-events-auto"
                >
                  {/* Imagen del Producto */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    {/* Categoría */}
                    <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-slate-300 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10">
                      {product.category}
                    </span>

                    {/* Badge de Interlinking de Ebooks */}
                    {isEbook && (
                      <span className="absolute top-3 right-3 bg-emerald-500/90 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> ACADEMIA
                      </span>
                    )}

                    {product.isPremium && (
                      <span className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-white text-base group-hover:text-[#00e03c] transition-colors leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.desc}
                      </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-[#00e03c]">Bs. {product.price}</span>
                        <span className="text-[9.5px] text-slate-500 font-bold uppercase">Stock: {product.stock} un.</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEbook && product.courseId && (
                          <button
                            onClick={() => {
                              triggerToast('Redirigiendo a recurso en Academy...', 'info');
                              navigate(`/academy/course/${product.courseId}`);
                            }}
                            className="bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-white/10"
                            data-cursor-text="LEER"
                          >
                            Ver en Academy
                          </button>
                        )}

                        <button
                          onClick={() => handleBuyProduct(product)}
                          className="bg-white/10 hover:bg-[#00e03c]/20 text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all border border-white/10 hover:border-[#00e03c]/40 flex items-center gap-1.5 uppercase tracking-wider"
                          data-cursor-text="COMPRAR"
                        >
                          {product.isPremium && !hasPremiumAccess ? (
                            <><Lock className="w-3.5 h-3.5 text-amber-400" /><span>Locked</span></>
                          ) : (
                            <><ShoppingCart className="w-3.5 h-3.5" /><span>Comprar</span></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. BRAND ACCREDITATION BAR (Disney+ Style bottom banner) ── */}
      <div className="glass-panel-dark rounded-3xl p-6 border border-white/[0.06] flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left pointer-events-auto">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#00e03c]" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Pago 100% Seguro</h4>
            <p className="text-[10px] text-slate-500">Transacciones cifradas SSL y QR instantáneo</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/[0.06] hidden sm:block" />
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#00e03c]" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Calidad Certificada</h4>
            <p className="text-[10px] text-slate-500">Materiales y bio-insumos evaluados por ingenieros</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/[0.06] hidden sm:block" />
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[#00e03c]" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Interlinking Educativo</h4>
            <p className="text-[10px] text-slate-500">Lee tus Ebooks directo en nuestra plataforma e-learning</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
