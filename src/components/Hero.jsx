import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Play, ChevronDown, LogIn } from 'lucide-react';
import SearchBar from './SearchBar';
import cinemaBackdrop from '../assets/cinema_backdrop.png';

export default function Hero({ onExploreClick }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);
  const heroSmoothX = useSpring(heroMouseX, { damping: 50, stiffness: 80, mass: 1.0 });
  const heroSmoothY = useSpring(heroMouseY, { damping: 50, stiffness: 80, mass: 1.0 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      const heroEl = document.getElementById('movies-hero');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        heroMouseX.set(e.clientX - rect.left);
        heroMouseY.set(e.clientY - rect.top);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [prefersReducedMotion, heroMouseX, heroMouseY]);

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

  // Generate 28 stable, tiny gold dust particles for a richer cinematic environment
  const dustParticles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 1.2, // 1.2px to 3.7px
      x: Math.random() * 100, // percentage left
      y: Math.random() * 100, // percentage top
      duration: Math.random() * 15 + 15, // 15s to 30s
      delay: Math.random() * -30, // start immediately
      xOffset: Math.random() * 10 - 5, // side drift
    }));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div id="movies-hero" className="relative h-[80vh] sm:h-[85vh] lg:h-[90vh] w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image / Backdrop with prestigious cinematic overlay */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden bg-black animate-fade-in">
        <img
          src={cinemaBackdrop}
          alt="Cinematic Movie Theater Backdrop"
          className="w-full h-full object-cover scale-105 filter brightness-[0.45] contrast-[1.1] saturate-[0.6] opacity-65"
        />
        {/* Soft gradient overlay to blend into the dark page */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent z-10" />
        {/* Subtle vignette on the hero itself */}
        <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
      </div>

      {/* Local Cursor-Following Gold Spotlight (fades in as curtains open - Boosted & Stronger) */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            x: heroSmoothX,
            y: heroSmoothY,
            left: -350,
            top: -350,
            background: 'radial-gradient(circle, rgba(245, 197, 66, 0.22) 0%, rgba(255, 179, 71, 0.15) 40%, rgba(255, 140, 66, 0.08) 75%, transparent 100%)',
            filter: 'blur(110px)',
            zIndex: 10,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.2 }}
        />
      )}

      {/* Golden Stage Spotlight (Stronger) */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none z-5"
        style={{
          background: 'radial-gradient(circle at center, rgba(245, 197, 66, 0.35) 0%, rgba(245, 197, 66, 0.12) 60%, transparent 100%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Subtle floating gold dust particles */}
      {!prefersReducedMotion && dustParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: 'rgba(255, 215, 0, 0.55)',
            filter: 'blur(0.5px)',
            zIndex: 10,
          }}
          animate={{
            y: ['110%', '-10%'],
            x: ['0%', `${p.xOffset}%`],
            opacity: [0, 0.75, 0.75, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Left velvet curtain */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-1/2 z-30 border-r border-[#4a0208]/30 shadow-2xl pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(to right, #110001 0px, #260104 20px, #3b0207 40px, #260104 60px, #110001 80px)',
          boxShadow: 'inset -20px 0 35px rgba(0, 0, 0, 0.95), inset 0 10px 30px rgba(0, 0, 0, 0.8)'
        }}
        initial={{ x: 0 }}
        animate={{ x: '-100%' }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : 2.0, 
          ease: [0.77, 0, 0.175, 1],
          delay: 0.1 
        }}
      />

      {/* Right velvet curtain */}
      <motion.div
        className="absolute top-0 bottom-0 right-0 w-1/2 z-30 border-l border-[#4a0208]/30 shadow-2xl pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(to right, #110001 0px, #260104 20px, #3b0207 40px, #260104 60px, #110001 80px)',
          boxShadow: 'inset 20px 0 35px rgba(0, 0, 0, 0.95), inset 0 10px 30px rgba(0, 0, 0, 0.8)'
        }}
        initial={{ x: 0 }}
        animate={{ x: '100%' }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : 2.0, 
          ease: [0.77, 0, 0.175, 1],
          delay: 0.1 
        }}
      />

      {/* Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.0, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Tagline Badge */}
          <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-xs font-semibold tracking-widest text-amber-400 uppercase">
            COMMUNITY-POWERED CINEMA
          </span>

          {/* Heading in Instrument Serif */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-tight select-none">
            Discover Movies <br />
            <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-300">
              Through Community
            </span>
          </h1>

          {/* Subtitle in Inter */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed font-light font-sans">
            Explore, rate, review and discover the films people actually love. <br className="hidden md:inline" />
            No critics, no algorithms—just real community rankings.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto pt-2 pb-4 relative z-30">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearchSubmit}
              placeholder="Search movies instantly..."
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-amber-500 text-black hover:text-white text-sm font-semibold px-8 py-3.5 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Explore Movies</span>
            </button>

            <button
              onClick={() => alert("Login / Sign up feature coming soon!")}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-white text-sm font-semibold px-8 py-3.5 rounded-full backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              <LogIn className="h-4 w-4 text-amber-500" />
              <span>Login / Sign Up</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Animated Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          onClick={onExploreClick}
          className="cursor-pointer text-gray-400 hover:text-white transition-colors p-2"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </div>
    </div>
  );
}
