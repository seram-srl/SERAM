import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * RotatingVegetation
 *
 * Vector-based botanical rosette featuring 12 radial native leaves with central venation.
 * Slowly rotates 360° continuously in SERAM vivid green (#00e03c / #029907).
 * Fully non-blocking (pointer-events-none) and accessible with prefers-reduced-motion check.
 *
 * @param {Object} props
 * @param {number|string} [props.size=180] - Size in pixels (width & height)
 * @param {number} [props.duration=28] - Rotation cycle duration in seconds
 * @param {number} [props.opacity=0.35] - Visual opacity
 * @param {string} [props.className=''] - Additional CSS classes
 */
export default function RotatingVegetation({
  size = 180,
  duration = 28,
  opacity = 0.35,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion();

  // 12 radial botanical leaf petals arranged at 30° increments
  const petalAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <div
      className={`pointer-events-none select-none relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, opacity }}
      aria-hidden="true"
    >
      {/* Outer ambient glow disc */}
      <div className="absolute inset-0 rounded-full bg-[#00e03c]/10 blur-2xl pointer-events-none" />

      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        animate={shouldReduceMotion ? { rotate: 0 } : { rotate: 360 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration, repeat: Infinity, ease: 'linear' }
        }
      >
        <defs>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e03c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#029907" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00e03c" stopOpacity="0.3" />
          </linearGradient>
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer orbital guide rings */}
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="#00e03c"
          strokeWidth="0.75"
          strokeDasharray="4 6"
          strokeOpacity="0.3"
        />
        <circle
          cx="100"
          cy="100"
          r="68"
          fill="none"
          stroke="#00e03c"
          strokeWidth="0.5"
          strokeOpacity="0.2"
        />

        {/* 12 Botanical Foliar Elements */}
        <g transform="translate(100, 100)" filter="url(#subtleGlow)">
          {petalAngles.map((angle) => (
            <g key={angle} transform={`rotate(${angle})`}>
              {/* Stylized native leaf contour */}
              <path
                d="M 0,-24 C -8,-44 -12,-62 0,-84 C 12,-62 8,-44 0,-24 Z"
                fill="url(#leafGrad)"
                stroke="#00e03c"
                strokeWidth="0.8"
                strokeOpacity="0.7"
              />
              {/* Central venation / nervure */}
              <line
                x1="0"
                y1="-24"
                x2="0"
                y2="-78"
                stroke="#ffffff"
                strokeWidth="0.75"
                strokeOpacity="0.6"
              />
              {/* Lateral secondary vein accents */}
              <line
                x1="0"
                y1="-45"
                x2="-4"
                y2="-55"
                stroke="#ffffff"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
              <line
                x1="0"
                y1="-45"
                x2="4"
                y2="-55"
                stroke="#ffffff"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
              <line
                x1="0"
                y1="-60"
                x2="-3"
                y2="-68"
                stroke="#ffffff"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
              <line
                x1="0"
                y1="-60"
                x2="3"
                y2="-68"
                stroke="#ffffff"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
            </g>
          ))}

          {/* Central organic seed core */}
          <circle cx="0" cy="0" r="16" fill="#040905" stroke="#00e03c" strokeWidth="1" strokeOpacity="0.8" />
          <circle cx="0" cy="0" r="11" fill="url(#centerGrad)" />
          <circle cx="0" cy="0" r="4" fill="#ffffff" fillOpacity="0.8" />
        </g>
      </motion.svg>
    </div>
  );
}
