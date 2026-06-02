import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon, Film } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(queryParam);
  const [localResults, setLocalResults] = useState([]);
  const [tmdbResults, setTmdbResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced search trigger as user types
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
        setLocalResults([]);
        setTmdbResults([]);
      }
    }, 400); // 400ms debounce to prevent slamming requests

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Execute actual search when query parameter changes
  useEffect(() => {
    if (queryParam.trim()) {
      executeSearch(queryParam);
    }
  }, [queryParam]);

  const executeSearch = async (searchVal) => {
    setLoading(true);
    try {
      const data = await apiService.searchMovies(searchVal);
      setLocalResults(data.local || []);
      setTmdbResults(data.tmdb || []);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  // Combine and de-duplicate results into a single array
  const combinedMovies = [...localResults];
  const localTmdbIds = new Set(localResults.map(m => m.tmdb_id).filter(id => id));

  tmdbResults.forEach(tm => {
    if (!localTmdbIds.has(tm.tmdb_id)) {
      combinedMovies.push(tm);
    }
  });

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto flex flex-col space-y-12">
        
        {/* Search Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-serif tracking-wide">
            Search <span className="italic text-amber-500">Movies</span>
          </h1>
          <p className="text-sm text-gray-400 font-light max-w-md mx-auto">
            Search our databases to find, rate, and review your favorite films instantly.
          </p>
          
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearchSubmit}
            placeholder="Type movie name to search..."
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">Searching catalog...</span>
          </div>
        ) : (
          <div className="space-y-12 text-left">
            {/* NO QUERY ENTERED */}
            {!queryParam && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600 space-y-2">
                <SearchIcon className="h-10 w-10 text-gray-800" />
                <span className="text-xs font-mono tracking-widest uppercase">Enter a query to discover films</span>
              </div>
            )}

            {/* QUERY ENTERED BUT NO RESULTS */}
            {queryParam && combinedMovies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-2">
                <Film className="h-10 w-10 text-gray-800" />
                <span className="text-sm font-light">No films found for "{queryParam}"</span>
              </div>
            )}

            {/* UNIFIED RESULTS */}
            {combinedMovies.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-serif text-white tracking-wide border-b border-gray-900 pb-2 flex items-center space-x-2">
                  <Film className="h-4.5 w-4.5 text-amber-500" />
                  <span>Search Results</span>
                  <span className="text-xs font-mono font-light text-gray-500">({combinedMovies.length})</span>
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-2">
                  {combinedMovies.map(movie => (
                    <MovieCard key={movie.tmdb_id || movie.id} movie={movie} showStats={true} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
