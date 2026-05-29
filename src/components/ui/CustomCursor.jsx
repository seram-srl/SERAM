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
        // 0.45 is the lag coefficient (0.45 = extremely fast and fluid)
        return {
          x: prev.x + dx * 0.45,
          y: prev.y + dy * 0.45,
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
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('a, button, [role="button"], .cursor-hover-premium');
      if (target) {
        setHovered(false);
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
        className="fixed pointer-events-none z-[9999] w-1.5 h-1.5 bg-[#00e03c] rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 mix-blend-screen shadow-[0_0_8px_#00e03c]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${clicked ? 0.5 : 1})`,
        }}
      />

      {/* 2. Outer cinematic circle (Trails smoothly and extremely fast behind) */}
      <div
        className={`fixed pointer-events-none z-[9998] rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center select-none transition-all duration-300 mix-blend-screen ${
          hovered 
            ? 'w-14 h-14 border border-[#00e03c] bg-[#00e03c]/5 shadow-[0_0_16px_rgba(0,224,60,0.35)]' 
            : 'w-7 h-7 border border-[#00e03c]/40 bg-transparent'
        }`}
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
          transform: `translate(-50%, -50%) scale(${clicked ? 0.85 : 1})`,
        }}
      />
    </>
  );
}
