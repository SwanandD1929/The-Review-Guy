import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import CategoryTabs from '../components/CategoryTabs';
import MovieCard from '../components/MovieCard';
import { SlidersHorizontal, Bookmark, Eye, Star, Compass } from 'lucide-react';

const CATEGORIES_LIST = [
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

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'Top Rated';

  const [activeTab, setActiveTab] = useState(filterParam);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Keep state in sync with URL
  useEffect(() => {
    setActiveTab(filterParam);
  }, [filterParam]);

  const loadCategoryData = async (category) => {
    setLoading(true);
    try {
      let data = [];
      
      switch (category) {
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
        case 'Hollywood':
          // Fetch top rated and filter by original language English
          const hwAll = await apiService.getTopRated();
          data = hwAll.filter(m => m.language === 'en');
          break;
        case 'Bollywood':
          // Fetch top rated and filter by Indian languages
          const bwAll = await apiService.getTopRated();
          const indianLanguages = ['hi', 'te', 'ta', 'kn', 'ml'];
          data = bwAll.filter(m => indianLanguages.includes(m.language));
          break;
        default:
          // Genre filters: Sci-Fi, Thriller, Mystery, Action, Drama, Horror
          const allMovies = await apiService.getTopRated();
          data = allMovies.filter(m => {
            if (!m.genres) return false;
            const normalizedGenre = category.toLowerCase().replace('-', ' ');
            const movieGenres = m.genres.toLowerCase();
            return movieGenres.includes(normalizedGenre) || 
                   (category === 'Sci-Fi' && (movieGenres.includes('science fiction') || movieGenres.includes('sci-fi')));
          });
          break;
      }
      
      setMovies(data);
    } catch (e) {
      console.error(`Failed to load movies for category ${category}:`, e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryData(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setSearchParams({ filter: tab });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
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
            // Grid loaders
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-10">
              {[...Array(12)].map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[2/3] w-full bg-gray-950/80 rounded-2xl animate-pulse"
                />
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {movies.map((movie) => (
                    <MovieCard
                      key={movie.tmdb_id || movie.id}
                      movie={movie}
                      showStats={activeTab !== 'Upcoming' && activeTab !== 'Trending' && activeTab !== 'Now Playing'}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
