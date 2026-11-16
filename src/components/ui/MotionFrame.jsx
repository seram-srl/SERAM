import React from 'react';
import { motion } from 'framer-motion';

/**
 * CornerAccents component renders thematic corner brackets and tech reticles
 * depending on the specified variant.
 */
function CornerAccents({ variant = 'experience' }) {
  if (variant === 'services') {
    // Technical GIS Reticle Brackets [ + ]
    return (
      <div className="absolute inset-0 pointer-events-none select-none z-10" aria-hidden="true">
        {/* Top-Left Reticle */}
        <div className="absolute top-2 left-2 flex items-center gap-1 font-mono text-[9px] text-[#00e03c]/70 tracking-widest">
          <span className="w-2.5 h-2.5 border-t-2 border-l-2 border-[#00e03c]" />
          <span className="opacity-60">[RTK·WGS84]</span>
        </div>

        {/* Top-Right Reticle */}
        <div className="absolute top-2 right-2 flex items-center gap-1 font-mono text-[9px] text-[#00e03c]/70 tracking-widest">
          <span className="opacity-60">[SRM·01]</span>
          <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-[#00e03c]" />
        </div>

        {/* Bottom-Left Reticle */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 font-mono text-[9px] text-[#00e03c]/70 tracking-widest">
          <span className="w-2.5 h-2.5 border-b-2 border-l-2 border-[#00e03c]" />
          <span className="opacity-60">+ -17.7833</span>
        </div>

        {/* Bottom-Right Reticle */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 font-mono text-[9px] text-[#00e03c]/70 tracking-widest">
          <span className="opacity-60">-63.1821 +</span>
          <span className="w-2.5 h-2.5 border-b-2 border-r-2 border-[#00e03c]" />
        </div>
      </div>
    );
  }

  if (variant === 'academy') {
    // Academic Constellation & Knowledge Nodes
    return (
      <div className="absolute inset-0 pointer-events-none select-none z-10" aria-hidden="true">
        {/* Top-Left Constellation Node */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          <span className="w-4 h-[1px] bg-emerald-400/50" />
        </div>

        {/* Top-Right Constellation Node */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <span className="w-4 h-[1px] bg-emerald-400/50" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
        </div>

        {/* Bottom-Left Constellation Node */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          <span className="w-4 h-[1px] bg-emerald-400/50" />
        </div>

        {/* Bottom-Right Constellation Node */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          <span className="w-4 h-[1px] bg-emerald-400/50" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
        </div>
      </div>
    );
  }

  // Default: 'experience' - Organic Botanical Foliage Accents
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10" aria-hidden="true">
      {/* Top-Left Botanical Leaf Accent */}
      <svg className="absolute top-2 left-2 w-5 h-5 text-[#4ade80]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21C3 21 4 9 14 4C14 4 15 15 3 21Z" />
        <path d="M3 21L14 10" />
      </svg>

      {/* Top-Right Botanical Leaf Accent */}
      <svg className="absolute top-2 right-2 w-5 h-5 text-[#4ade80]/60 scale-x-[-1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21C3 21 4 9 14 4C14 4 15 15 3 21Z" />
        <path d="M3 21L14 10" />
      </svg>

      {/* Bottom-Left Botanical Leaf Accent */}
      <svg className="absolute bottom-2 left-2 w-5 h-5 text-[#4ade80]/60 scale-y-[-1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21C3 21 4 9 14 4C14 4 15 15 3 21Z" />
        <path d="M3 21L14 10" />
      </svg>

      {/* Bottom-Right Botanical Leaf Accent */}
      <svg className="absolute bottom-2 right-2 w-5 h-5 text-[#4ade80]/60 scale-[-1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21C3 21 4 9 14 4C14 4 15 15 3 21Z" />
        <path d="M3 21L14 10" />
      </svg>
    </div>
  );
}

/**
 * MotionFrame
 *
 * An architectural motion container that frames content panels with
 * page-specific corner accents, subtle animated glowing perimeter, and clean aesthetic.
 *
 * @param {Object} props
 * @param {'experience'|'services'|'academy'} [props.variant='experience']
 * @param {React.ReactNode} props.children
 * @param {string} [props.className='']
 * @param {boolean} [props.accentGlow=true]
 */
export default function MotionFrame({
  variant = 'experience',
  children,
  className = '',
  accentGlow = true
}) {
  const getBorderColor = () => {
    switch (variant) {
      case 'services':
        return 'border-[#00e03c]/20 hover:border-[#00e03c]/40';
      case 'academy':
        return 'border-emerald-500/20 hover:border-emerald-400/40';
      case 'experience':
      default:
        return 'border-[#4ade80]/20 hover:border-[#4ade80]/40';
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case 'services':
        return 'bg-[#00e03c]/5';
      case 'academy':
        return 'bg-emerald-500/5';
      case 'experience':
      default:
        return 'bg-[#4ade80]/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl border ${getBorderColor()} transition-colors duration-300 overflow-hidden ${className}`}
    >
      {/* Corner Accents */}
      <CornerAccents variant={variant} />

      {/* Subtle ambient corner/perimeter glow */}
      {accentGlow && (
        <div
          className={`absolute -top-16 -right-16 w-48 h-48 rounded-full ${getGlowColor()} blur-3xl pointer-events-none`}
          aria-hidden="true"
        />
      )}

      {/* Frame content */}
      <div className="relative z-0">
        {children}
      </div>
    </motion.div>
  );
}
