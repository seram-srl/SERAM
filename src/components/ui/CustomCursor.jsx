import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const [clicked, setClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Outer circle lag effect (Interpolation for physics trail)
  useEffect(() => {
    let animationFrameId;

    const updateTrail = () => {
      setTrail((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        // 0.15 is the lag coefficient (lower = more lag / drag)
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      animationFrameId = requestAnimationFrame(updateTrail);
    };

    animationFrameId = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  // Hover detection for interactive items
  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, [role="button"], .cursor-hover-premium');
      if (target) {
        setHovered(true);
        // If the target has a specific data attribute, show custom text inside the cursor
        const text = target.getAttribute('data-cursor-text') || '';
        setHoverText(text);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('a, button, [role="button"], .cursor-hover-premium');
      if (target) {
        setHovered(false);
        setHoverText('');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* 1. Inner small dot (Snaps directly to cursor) */}
      <div
        className="fixed pointer-events-none z-[9999] w-1.5 h-1.5 bg-[#00e03c] rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 mix-blend-screen"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${clicked ? 0.5 : 1})`,
        }}
      />

      {/* 2. Outer cinematic circle (Trails smoothly behind) */}
      <div
        className={`fixed pointer-events-none z-[9998] rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[8px] font-black tracking-widest text-slate-950 uppercase select-none transition-all duration-300 mix-blend-screen ${
          hovered 
            ? 'w-16 h-16 bg-white border-none shadow-[0_0_24px_rgba(0,224,60,0.4)]' 
            : 'w-8 h-8 border border-white/40 bg-transparent'
        }`}
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
          transform: `translate(-50%, -50%) scale(${clicked ? 0.85 : 1})`,
        }}
      >
        <span 
          className={`transition-opacity duration-200 text-[#010409] font-bold ${hovered && hoverText ? 'opacity-100' : 'opacity-0'}`}
        >
          {hoverText}
        </span>
      </div>
    </>
  );
}
