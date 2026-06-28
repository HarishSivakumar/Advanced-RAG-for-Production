'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Detect hoverable elements
    const handleElementHover = () => {
      const hoverableSelectors = 'a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]';
      
      document.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest(hoverableSelectors)) {
          setIsHovering(true);
        } else {
          setIsHovering(false);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    handleElementHover();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Main dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block"
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      >
        <div
          className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
          style={{
            transform: isHovering ? 'scale(0)' : 'scale(1)',
            transition: 'transform 0.2s ease',
          }}
        />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] hidden md:block"
        animate={{
          x: position.x - (isHovering ? 24 : 16),
          y: position.y - (isHovering ? 24 : 16),
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 250,
          damping: 20,
          mass: 0.8,
        }}
      >
        <div
          className="rounded-full border border-[var(--color-primary)]/50"
          style={{
            width: isHovering ? 48 : 32,
            height: isHovering ? 48 : 32,
            transition: 'width 0.3s ease, height 0.3s ease, background 0.3s ease',
            background: isHovering ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
          }}
        />
      </motion.div>
    </>
  );
}
