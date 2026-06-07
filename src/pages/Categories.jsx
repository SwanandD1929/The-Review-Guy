import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService, cleanMovieId } from '../services/api';
import { tmdbClient } from '../services/tmdb';
import CategoryTabs from '../components/CategoryTabs';
import MovieCard from '../components/MovieCard';
import { SlidersHorizontal, Bookmark, Eye, Star, Compass } from 'lucide-react';

const CATEGORIES_LIST = [
  'TRG Recommendations',
  'Top Rated',
  'Most Watched',
  'Trending',
  'Upcoming',
  'Hollywood',
  'Bollywood',
  'Sci-Fi',
  'Thriller',
  'Mystery',
  'Action',
  'Drama',
  'Horror',
  'Watch Later'
];

const GENRE_IDS = {
  'Sci-Fi': 878,
  'Thriller': 53,
  'Mystery': 9648,
  'Action': 28,
  'Drama': 18,
  'Horror': 27
};

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'Top Rated';

  const [activeTab, setActiveTab] = useState(filterParam);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Keep state in sync with URL
  useEffect(() => {
    setActiveTab(filterParam);
  }, [filterParam]);

  const loadCategoryData = async (category, p = 1, append = false) => {
    if (p === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      let data = [];
      const isGenre = GENRE_IDS[category] !== undefined;
      
      if (isGenre) {
        // Fetch from TMDB discover
        const genreId = GENRE_IDS[category];
        const tmdbMovies = await tmdbClient.discoverMovies({
          with_genres: genreId,
          page: p,
          sort_by: 'popularity.desc',
          'vote_count.gte': 1000,
          with_original_language: 'en'
        });
        
        // Fetch local movies to merge stats
        const localMovies = await apiService.getAllMovies();
        
        data = tmdbMovies.map(m => {
          const localMatch = localMovies.find(lm => lm.tmdb_id === m.tmdb_id);
          if (localMatch) {
            return {
              ...m,
              ...localMatch,
              local_id: localMatch.id || localMatch.local_id
            };
          }
          return m;
        });
        
        setHasMore(tmdbMovies.length >= 20); // standard page size is 20
      } else {
        setHasMore(false);
        switch (category) {
          case 'TRG Recommendations': {
            const recIds = await apiService.getRecommendedMovies();
            const recSet = new Set(recIds.map(id => cleanMovieId(id)));
            const allMovies = await apiService.getAllMovies();
            data = allMovies.filter(m => recSet.has(cleanMovieId(m.tmdb_id || m.id)));
            break;
          }
          case 'Top Rated':
            data = await apiService.getTopRated();
            break;
          case 'Most Watched':
            data = await apiService.getMostWatched();
            break;
          case 'Trending':
            data = await apiService.getTrending();
            break;
          case 'Upcoming':
            data = await apiService.getUpcoming();
            break;
          case 'Watch Later':
            data = await apiService.getUserWatchLater();
            break;
          case 'Hollywood': {
            const tmdbMovies = await tmdbClient.discoverMovies({
              with_original_language: 'en',
              sort_by: 'popularity.desc',
              'vote_count.gte': 500,
              page: p
            });
            const localMovies = await apiService.getAllMovies();
            data = tmdbMovies.map(m => {
              const localMatch = localMovies.find(lm => lm.tmdb_id === m.tmdb_id);
              return localMatch ? { ...m, ...localMatch, local_id: localMatch.id || localMatch.local_id } : m;
            });
            setHasMore(tmdbMovies.length >= 20);
            break;
          }
          case 'Bollywood': {
            const tmdbMovies = await tmdbClient.discoverMovies({
              with_original_language: 'hi|te|ta|ml|kn',
              sort_by: 'popularity.desc',
              'vote_count.gte': 50,
              page: p
            });
            const localMovies = await apiService.getAllMovies();
            data = tmdbMovies.map(m => {
              const localMatch = localMovies.find(lm => lm.tmdb_id === m.tmdb_id);
              return localMatch ? { ...m, ...localMatch, local_id: localMatch.id || localMatch.local_id } : m;
            });
            setHasMore(tmdbMovies.length >= 20);
            break;
          }
          default:
            data = [];
            break;
        }
      }
      
      if (append) {
        setMovies(prev => [...prev, ...data]);
      } else {
        setMovies(data);
      }
    } catch (e) {
      console.error(`Failed to load movies for category ${category}:`, e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadCategoryData(activeTab, 1, false);
  }, [activeTab]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadCategoryData(activeTab, nextPage, true);
  };

  const handleTabChange = (tab) => {
    setSearchParams({ filter: tab });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'TRG Recommendations': return <Star className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />;
      case 'Top Rated': return <Star className="h-5 w-5 text-amber-500 fill-amber-500" />;
      case 'Most Watched': return <Eye className="h-5 w-5 text-sky-400" />;
      case 'Watch Later': return <Bookmark className="h-5 w-5 text-amber-500 fill-amber-500/20" />;
      default: return <Compass className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto flex flex-col space-y-8">
        
        {/* Page Title */}
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-serif tracking-wide flex items-center space-x-2.5">
              <SlidersHorizontal className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
              <span>Explore <span className="italic text-amber-500">Categories</span></span>
            </h1>
            <p className="text-xs text-gray-400 font-light font-sans">
              Filter movie lists, find top genres, and check your watch lists.
            </p>
          </div>
        </div>

        {/* Categories Navigation Bar */}
        <CategoryTabs
          categories={CATEGORIES_LIST}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Results Grid */}
        <div className="px-4 sm:px-6 lg:px-8 text-left">
          {loading ? (
            // Premium shimmer skeleton loader
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-10">
              {[...Array(12)].map((_, idx) => (
                <div key={idx} className="flex flex-col space-y-3 animate-pulse">
                  <div className="aspect-[2/3] w-full bg-white/[0.03] border border-white/5 rounded-2xl" />
                  <div className="h-4 bg-white/[0.03] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.02] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Category Title Header */}
              <div className="flex items-center space-x-2 border-b border-gray-900 pb-3">
                {getCategoryIcon(activeTab)}
                <h2 className="text-lg font-serif text-white tracking-wide">{activeTab}</h2>
                <span className="text-xs font-mono font-light text-gray-500">({movies.length})</span>
              </div>

              {movies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-2">
                  <Bookmark className="h-10 w-10 text-gray-800" />
                  <span className="text-xs font-mono tracking-widest uppercase">No movies in this collection</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {movies.map((movie, idx) => (
                      <MovieCard
                        key={`${movie.tmdb_id || movie.id}-${idx}`}
                        movie={movie}
                        showStats={activeTab !== 'Upcoming' && activeTab !== 'Trending' && activeTab !== 'Now Playing'}
                      />
                    ))}
                  </div>

                  {/* Loading more skeletons */}
                  {loadingMore && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-10">
                      {[...Array(6)].map((_, idx) => (
                        <div key={idx} className="flex flex-col space-y-3 animate-pulse">
                          <div className="aspect-[2/3] w-full bg-white/[0.03] border border-white/5 rounded-2xl" />
                          <div className="h-4 bg-white/[0.03] rounded w-3/4" />
                          <div className="h-3 bg-white/[0.02] rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Load More Button */}
                  {hasMore && !loadingMore && (
                    <div className="flex justify-center pt-8">
                      <button
                        onClick={handleLoadMore}
                        className="flex items-center space-x-2 bg-white/5 hover:bg-amber-500 hover:text-black border border-white/10 hover:border-amber-500 text-gray-300 font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-amber-500/10 text-sm"
                      >
                        <span>Load More Movies</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
