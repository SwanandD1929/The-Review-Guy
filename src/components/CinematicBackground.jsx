import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CinematicBackground({ children, className = "" }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Motion values to track actual mouse coords
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs configuration for organic lagging delay
  const springConfig = { damping: 50, stiffness: 80, mass: 1.0 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [prefersReducedMotion, mouseX, mouseY]);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      
      {/* Background Layer Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        
        {/* Base dark backdrop */}
        <div className="absolute inset-0 bg-black" />

        {/* Ambient Glow Sphere 1: Deep Purple (12% opacity) */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Ambient Glow Sphere 2: Orange (10% opacity) */}
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 140, 66, 0.10) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />

        {/* Ambient Glow Sphere 3: Gold (10% opacity) */}
        <div 
          className="absolute top-[25%] right-[15%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(245, 197, 66, 0.10) 0%, transparent 70%)',
            filter: 'blur(85px)',
          }}
        />

        {/* Cursor-Following Gradient Spotlight (Warm Gold/Amber/Orange Theater Spotlight - Boosted) */}
        {!prefersReducedMotion && (
          <motion.div
            className="fixed w-[1040px] h-[1040px] rounded-full pointer-events-none"
            style={{
              x: smoothX,
              y: smoothY,
              left: -520,
              top: -520,
              background: 'radial-gradient(circle, rgba(245, 197, 66, 0.12) 0%, rgba(255, 179, 71, 0.09) 40%, rgba(255, 140, 66, 0.06) 75%, transparent 100%)',
              filter: 'blur(140px)',
              zIndex: 1,
            }}
          />
        )}

        {/* Film grain noise texture */}
        <div className="absolute inset-0 film-grain opacity-[0.22] pointer-events-none" />

        {/* Subtle Vignette Mask */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.85) 100%)'
          }}
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
