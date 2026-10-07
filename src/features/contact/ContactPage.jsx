import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, User, Building, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabaseClient';
import Magnetic from '../../components/ui/Magnetic';

export default function ContactPage() {
  const { triggerToast } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      triggerToast('El nombre es obligatorio.', 'error');
      return;
    }
    if (!formData.email.trim()) {
      triggerToast('El correo electrónico es obligatorio.', 'error');
      return;
    }
    if (!formData.message.trim()) {
      triggerToast('El mensaje es obligatorio.', 'error');
      return;
    }
    if (!consent) {
      triggerToast('Debes ser mayor de 18 años y aceptar la Política de Privacidad y Términos.', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      triggerToast('¡Mensaje enviado con éxito!', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setConsent(false);
    } catch (err) {
      console.error('[Contact Form Error]:', err);
      triggerToast(err.message || 'Error al enviar el mensaje. Inténtalo de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inner-page min-h-screen bg-transparent flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-8 space-y-2">
          <span className="section-label-accent">Contacto Oficial</span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            CONÉCTATE CON <span className="text-[#00e03c]">SERAM</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            ¿Tienes alguna consulta técnica, requerimiento de auditoría o deseas conocer más sobre nuestros servicios de ingeniería ambiental? Escríbenos directamente.
          </p>
        </div>

        <div className="neuform-card p-8 sm:p-10">
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-16 h-16 bg-[#00e03c]/10 border border-[#00e03c]/30 rounded-full flex items-center justify-center mx-auto text-[#00e03c]">
                <CheckCircle2 className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
                ¡Mensaje Recibido!
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Tu mensaje ha sido enviado exitosamente al departamento técnico de SERAM. Un especialista se pondrá en contacto contigo a la brevedad.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 bg-slate-900 border border-white/10 hover:border-[#00e03c] rounded-xl text-xs text-white transition-all cursor-none"
                >
                  Enviar otro mensaje
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00e03c]" />
                  Nombre Completo *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-slate-950/40 border border-white/10 focus:border-[#00e03c] focus:ring-2 focus:ring-[#00e03c]/30 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00e03c]" />
                  Correo Electrónico *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ej. contacto@empresa.com"
                  className="w-full bg-slate-950/40 border border-white/10 focus:border-[#00e03c] focus:ring-2 focus:ring-[#00e03c]/30 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#00e03c]" />
                  Asunto / Empresa
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Ej. Cotización Auditoría Ley 1333"
                  className="w-full bg-slate-950/40 border border-white/10 focus:border-[#00e03c] focus:ring-2 focus:ring-[#00e03c]/30 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#00e03c]" />
                  Mensaje o Requerimiento *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Por favor describe brevemente tus requerimientos o dudas técnicas..."
                  className="w-full bg-slate-950/40 border border-white/10 focus:border-[#00e03c] focus:ring-2 focus:ring-[#00e03c]/30 rounded-xl p-4 text-xs text-white outline-none transition-all resize-none"
                />
              </div>

              {/* Checkbox de Consentimiento Obligatorio y Mayoría de Edad */}
              <div className="pt-2 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="contact-consent"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-white/20 bg-slate-950/60 text-[#00e03c] focus:ring-2 focus:ring-[#00e03c] cursor-pointer accent-[#126c0f]"
                />
                <label htmlFor="contact-consent" className="text-[11px] text-slate-300 leading-snug cursor-pointer select-none">
                  Declaro que <strong>soy mayor de 18 años</strong> y acepto la{' '}
                  <Link to="/privacidad" target="_blank" className="text-[#00e03c] hover:underline font-semibold">
                    Política de Privacidad
                  </Link>
                  , los{' '}
                  <Link to="/terminos" target="_blank" className="text-[#00e03c] hover:underline font-semibold">
                    Términos de Servicio
                  </Link>{' '}
                  y el Acuerdo de Confidencialidad Técnica de SERAM.
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <Magnetic>
                  <button
                    type="submit"
                    disabled={loading || !consent}
                    className="neuform-btn-primary min-h-[44px] inline-flex items-center justify-center gap-2 !bg-[#c9a84c] !border-[#b0913b] hover:!bg-[#bda043] text-slate-950 font-black shadow-[0_4px_15px_rgba(201,168,76,0.25)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.4)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Enviar Mensaje Técnico
                      </>
                    )}
                  </button>
                </Magnetic>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
