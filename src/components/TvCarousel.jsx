import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TvCard from './TvCard';

export default function TvCarousel({ title, shows, showStats = true }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!shows || shows.length === 0) {
    return null;
  }

  return (
    <div className="relative group w-full py-4 text-left">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide">
          {title}
        </h2>
        
        {/* Navigation Arrow Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-full border border-gray-800 hover:border-gray-700 bg-gray-950/80 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-all cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-full border border-gray-800 hover:border-gray-700 bg-gray-950/80 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-all cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex items-start space-x-4 sm:space-x-6 overflow-x-auto carousel-hide-scrollbar px-4 sm:px-6 lg:px-8 pb-4"
      >
        {shows.map((show, idx) => (
          <TvCard
            key={show.tmdb_id || show.id || idx}
            show={show}
            showStats={showStats}
          />
        ))}
      </div>
    </div>
  );
}
