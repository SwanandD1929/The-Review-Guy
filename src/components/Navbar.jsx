import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Clapperboard, Bookmark, Plus, Menu, X } from 'lucide-react';
import { apiService } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [watchLaterCount, setWatchLaterCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const desktopSuggestionsRef = useRef(null);
  const mobileSuggestionsRef = useRef(null);

  const fetchUserStats = async () => {
    try {
      const stats = await apiService.getUserStats();
      setWatchLaterCount(stats.watch_later_count || 0);
    } catch (e) {
      console.error(e);
    }
  };

  // Autocomplete fetcher
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const results = await apiService.searchMovies(searchQuery);
          // Combine and slice top 5
          const combined = [...(results.local || [])];
          const localTmdbIds = new Set(combined.map(m => m.tmdb_id).filter(id => id));
          (results.tmdb || []).forEach(t => {
            if (!localTmdbIds.has(t.tmdb_id)) {
              combined.push(t);
            }
          });
          setSuggestions(combined.slice(0, 5));
        } catch (e) {
          console.error(e);
        }
      } else {
        setSuggestions([]);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchUserStats();

    // Close suggestions on outside clicks
    const handleClickOutside = (e) => {
      if (desktopSuggestionsRef.current && !desktopSuggestionsRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };

    window.addEventListener('user-stats-updated', fetchUserStats);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('user-stats-updated', fetchUserStats);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear suggestions on route changes
  useEffect(() => {
    setSuggestions([]);
    setSearchQuery('');
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'Top Rated', path: '/categories?filter=Top Rated' },
    { label: 'Most Watched', path: '/categories?filter=Most Watched' },
    { label: 'Trending', path: '/categories?filter=Trending' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <Clapperboard className="h-6 w-6 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors duration-300">
                The Review <span className="text-amber-500 font-serif italic font-medium">Guy</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path || 
                               (link.path.includes('filter') && location.search === link.path.split('?')[1]);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-all duration-300 hover:text-amber-400 relative py-1 ${
                    isActive ? 'text-amber-500' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section: Search, WatchLater Badge, Add Movie Button */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Input with Autocomplete Suggestions */}
            <div className="relative" ref={desktopSuggestionsRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-48 xl:w-64 bg-gray-900/60 border border-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
              </form>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-950/95 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl z-50 text-left glass-panel w-64 sm:w-72">
                  {suggestions.map(s => {
                    const linkUrl = s.local_id ? `/movie/${s.local_id}` : `/movie/ext_${s.tmdb_id}`;
                    return (
                      <Link
                        key={s.tmdb_id || s.id}
                        to={linkUrl}
                        onClick={() => {
                          setSuggestions([]);
                          setSearchQuery('');
                        }}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-900 transition-colors border-b border-gray-900/60 last:border-0"
                      >
                        <img src={s.poster_url} className="h-10 w-7 rounded object-cover flex-shrink-0" alt="" />
                        <div className="flex-grow min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{s.title}</div>
                          <div className="text-[10px] text-gray-400 truncate">{s.genres ? s.genres.split(',')[0] : 'Drama'}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Watch Later Badge */}
            <Link
              to="/categories?filter=Watch Later"
              className="relative p-2 text-gray-300 hover:text-amber-400 hover:bg-gray-900/40 rounded-full transition-all duration-300 flex items-center justify-center"
              title="Watch Later"
            >
              <Bookmark className="h-4 w-4" />
              {watchLaterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {watchLaterCount}
                </span>
              )}
            </Link>

            {/* Add Movie CTA */}
            <Link
              to="/add-movie"
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-amber-950/20 hover:shadow-amber-500/25 transition-all duration-300"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3px]" />
              <span>Add Movie</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              to="/categories?filter=Watch Later"
              className="relative p-2 text-gray-300 hover:text-amber-400 rounded-full transition-all"
            >
              <Bookmark className="h-4.5 w-4.5" />
              {watchLaterCount > 0 && (
                <span className="absolute top-0 right-0 bg-amber-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {watchLaterCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-gray-800 transition-all duration-300">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {/* Search Input for Mobile */}
            <div className="relative" ref={mobileSuggestionsRef}>
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full bg-gray-900 border border-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
              </form>

              {/* Suggestions for Mobile */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl z-50 text-left">
                  {suggestions.map(s => {
                    const linkUrl = s.local_id ? `/movie/${s.local_id}` : `/movie/ext_${s.tmdb_id}`;
                    return (
                      <Link
                        key={s.tmdb_id || s.id}
                        to={linkUrl}
                        onClick={() => {
                          setSuggestions([]);
                          setSearchQuery('');
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-900 transition-colors border-b border-gray-900 last:border-0"
                      >
                        <img src={s.poster_url} className="h-10 w-7 rounded object-cover flex-shrink-0" alt="" />
                        <div className="flex-grow min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{s.title}</div>
                          <div className="text-[10px] text-gray-400 truncate">{s.genres ? s.genres.split(',')[0] : 'Drama'}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nav Links */}
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname + location.search === link.path || 
                                 (link.path.includes('filter') && location.search === link.path.split('?')[1]);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive ? 'bg-amber-500/10 text-amber-500' : 'text-gray-300 hover:bg-gray-900/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              <Link
                to="/add-movie"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-4 py-2.5 rounded-full mt-4"
              >
                <Plus className="h-4 w-4 stroke-[3px]" />
                <span>Add Movie</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
