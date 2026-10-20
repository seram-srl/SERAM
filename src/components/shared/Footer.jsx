import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin } from 'lucide-react';

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/seram.world/',
    Icon: Instagram,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/seramconsultora',
    Icon: Facebook,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/consultoraseram',
    Icon: Linkedin,
  },
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <footer className="w-full bg-[#010409] border-t border-white/10 py-16 px-6 sm:px-12 md:px-24 select-none relative z-10 pointer-events-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-left items-center">
        {/* Columna 1: Logotipo Oficial Interactivo (Retorno al Hero) */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 h-full">
          <button
            type="button"
            onClick={handleLogoClick}
            aria-label="Volver al inicio de SERAM"
            className="group flex flex-col items-center p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-[#00e03c]/40 transition-all duration-300 pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00e03c]/40"
            data-cursor-text="INICIO"
          >
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 mb-1">
              <img
                src="/assets/brand/ícono_logo.png"
                alt="SERAM"
                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,224,60,0.3)]"
              />
            </div>
            <div className="flex items-baseline tracking-widest font-tech font-black text-2xl">
              <span className="text-white">SER</span>
              <span className="text-[#00e03c]">A</span>
              <span className="text-white">M</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-1">
              Consultora Ambiental & Tecnológica
            </span>
          </button>
        </div>

        {/* Columna 2: Redes Sociales */}
        <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Conéctate con nosotros</p>
          <div className="flex items-center gap-4 pt-1">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`SERAM en ${label}`}
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 hover:border-[#00e03c] text-slate-400 hover:text-[#00e03c] flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md pointer-events-auto"
                data-cursor-text={label.toUpperCase()}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-tech max-w-xs">
            Innovación tecnológica y compromiso socio-ambiental de élite.
          </p>
        </div>

        {/* Columna 3: Información de Contacto e Enlaces Legales */}
        <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Ubicación y Legalidad</p>
          <div className="text-xs text-slate-400 leading-relaxed">
            <p className="font-bold text-slate-300">Oficina Central Bolivia:</p>
            <p>Calle Los Álamos N° 140, Obrajes, La Paz, Bolivia.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 pt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Link to="/contact" className="hover:text-white transition-colors pointer-events-auto">Contacto</Link>
            <Link to="/terminos" className="hover:text-white transition-colors pointer-events-auto">Términos</Link>
            <Link to="/privacidad" className="hover:text-white transition-colors pointer-events-auto">Privacidad</Link>
            <Link to="/cookies" className="hover:text-white transition-colors pointer-events-auto">Cookies</Link>
            <Link to="/reembolsos" className="hover:text-white transition-colors pointer-events-auto">Reembolsos</Link>
          </div>
          <p className="text-[10px] text-slate-600 font-mono mt-4">
            © 2026 SERAM SRL. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
