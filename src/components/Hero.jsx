import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Hero({ onExploreClick }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative h-[80vh] sm:h-[85vh] lg:h-[90vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image / Backdrop (Supports video component placeholder) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1920"
          alt="Cinematic Movie Theater Backdrop"
          className="w-full h-full object-cover scale-105 filter brightness-50 contrast-110 saturate-[0.8]"
        />
        {/* Soft, rich gradient overlays to blend the image into the page background */}
        <div className="absolute inset-0 cinematic-overlay z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
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

            <Link
              to="/add-movie"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-white text-sm font-semibold px-8 py-3.5 rounded-full backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 text-amber-500" />
              <span>Add Movie</span>
            </Link>
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
