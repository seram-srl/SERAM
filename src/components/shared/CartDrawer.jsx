import React from 'react';
import { X, ShoppingCart, Trash2, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CartDrawer() {
  const { cart, setShowCart, handleRemoveFromCart, handleCheckout } = useApp();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end" onClick={() => setShowCart(false)}>
      <div
        className="glass-panel-dark w-full max-w-md h-full flex flex-col shadow-2xl animate-slideLeft border-l border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#00e03c]" />
            <h3 className="font-bold text-lg text-white">Carrito de Compras</h3>
          </div>
          <button
            onClick={() => setShowCart(false)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Tu carrito ecológico está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 p-3 glass-border rounded-xl items-center justify-between bg-white/[0.03]">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-100 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-500">${item.price} USD × {item.qty}</p>
                </div>
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/[0.06] space-y-4">
            <div className="flex justify-between items-center text-white">
              <span className="font-semibold text-sm">Total Estimado:</span>
              <span className="font-black text-2xl text-[#00e03c]">${total} USD</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-[#00e03c] text-slate-950 py-3.5 rounded-xl font-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
              data-cursor-text="PAGAR"
            >
              Confirmar Pedido <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
