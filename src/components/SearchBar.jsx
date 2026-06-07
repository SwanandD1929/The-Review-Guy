import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { apiService } from '../services/api';

export default function SearchBar({ value, onChange, onSubmit, placeholder = "Search for movies..." }) {
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.trim().length > 1) {
        try {
          const results = await apiService.searchMovies(value);
          const combined = [...(results.local || [])];
          const localTmdbIds = new Set(combined.map(m => m.tmdb_id).filter(id => id));
          (results.tmdb || []).forEach(t => {
            if (!localTmdbIds.has(t.tmdb_id)) {
              combined.push(t);
            }
          });
          setSuggestions(combined.slice(0, 5));
        } catch (e) {
          console.error("Suggestions fetch error:", e);
        }
      } else {
        setSuggestions([]);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={suggestionsRef}>
      <form onSubmit={onSubmit} className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-950/60 border-2 border-gray-800 hover:border-gray-700/80 focus:border-amber-500 text-white font-sans placeholder-gray-500 pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 shadow-2xl backdrop-blur-md transition-all duration-300"
        />
        <Search className="absolute left-4 h-5 w-5 text-gray-500" />
        
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
            }}
            className="absolute right-4 p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-950/95 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl z-50 text-left glass-panel">
          {suggestions.map(s => {
            const linkUrl = s.local_id ? `/movie/${s.local_id}` : `/movie/ext_${s.tmdb_id}`;
            return (
              <Link
                key={s.tmdb_id || s.id}
                to={linkUrl}
                onClick={() => setSuggestions([])}
                className="flex items-center space-x-3 p-3 hover:bg-gray-900 transition-colors border-b border-gray-900/60 last:border-0"
              >
                <img src={s.poster_url} className="h-10 w-7 rounded object-cover flex-shrink-0" alt="" />
                <div className="flex-grow min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{s.title}</div>
                  <div className="text-[10px] text-gray-400 truncate">{s.genres ? (Array.isArray(s.genres) ? s.genres[0] : s.genres.split(',')[0]) : 'Drama'}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
