import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService, cleanTvId } from '../services/api';
import CategoryTabs from '../components/CategoryTabs';
import TvCard from '../components/TvCard';
import { SlidersHorizontal, Bookmark, Eye, Star, Compass } from 'lucide-react';

const TV_CATEGORIES_LIST = [
  'TRG Recommendations',
  'Top Rated',
  'Airing Today',
  'Currently Airing',
  'Sci-Fi & Fantasy',
  'Action & Adventure',
  'Drama',
  'Comedy',
  'Mystery',
  'Crime',
  'Watch Later'
];

const TV_GENRE_IDS = {
  'Sci-Fi & Fantasy': 10765,
  'Action & Adventure': 10759,
  'Drama': 18,
  'Comedy': 35,
  'Mystery': 9648,
  'Crime': 80
};

export default function TVCategories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'Top Rated';

  const [activeTab, setActiveTab] = useState(filterParam);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Keep state in sync with URL
  useEffect(() => {
    setActiveTab(filterParam);
  }, [filterParam]);

  const loadCategoryData = async (category) => {
    setLoading(true);
    try {
      let data = [];
      const isGenre = TV_GENRE_IDS[category] !== undefined;
      
      if (isGenre) {
        const genreId = TV_GENRE_IDS[category];
        const tmdbShows = await apiService.discoverTvShows(genreId);
        
        // Fetch local shows to merge ratings/verdicts
        const localShows = await apiService.getAllTvShows();
        
        data = tmdbShows.map(s => {
          const localMatch = localShows.find(ls => cleanTvId(ls.tmdb_id) === cleanTvId(s.tmdb_id));
          if (localMatch) {
            return {
              ...s,
              ...localMatch,
              local_id: localMatch.id || localMatch.local_id
            };
          }
          return s;
        });
      } else {
        switch (category) {
          case 'TRG Recommendations': {
            const recIds = JSON.parse(localStorage.getItem('trg_tv_recommends')) || [1396, 66732];
            const recSet = new Set(recIds.map(id => cleanTvId(id)));
            const allTv = await apiService.getAllTvShows();
            data = allTv.filter(s => recSet.has(cleanTvId(s.tmdb_id || s.id)));
            break;
          }
          case 'Top Rated':
            data = await apiService.getTvTopRated();
            break;
          case 'Airing Today':
            data = await apiService.getTvAiringToday();
            break;
          case 'Currently Airing':
            data = await apiService.getTvOnTheAir();
            break;
          case 'Watch Later':
            data = await apiService.getUserTvWatchLater();
            break;
          default:
            data = [];
            break;
        }
      }
      
      setShows(data);
    } catch (e) {
      console.error(`Failed to load TV shows for category ${category}:`, e);
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
      case 'TRG Recommendations': return <Star className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />;
      case 'Top Rated': return <Star className="h-5 w-5 text-amber-500 fill-amber-500" />;
      case 'Watch Later': return <Bookmark className="h-5 w-5 text-amber-500 fill-amber-500/20" />;
      default: return <Compass className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto flex flex-col space-y-8 font-sans">
        
        {/* Page Title */}
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-serif tracking-wide flex items-center space-x-2.5">
              <SlidersHorizontal className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
              <span>Explore TV <span className="italic text-amber-500">Categories</span></span>
            </h1>
            <p className="text-xs text-gray-400 font-light">
              Filter series lists, find top genres, and check your TV watch lists.
            </p>
          </div>
        </div>

        {/* Categories Tabs */}
        <CategoryTabs
          categories={TV_CATEGORIES_LIST}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Results Grid */}
        <div className="px-4 sm:px-6 lg:px-8 text-left">
          {loading ? (
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
              {/* Header */}
              <div className="flex items-center space-x-2 border-b border-gray-900 pb-3">
                {getCategoryIcon(activeTab)}
                <h2 className="text-lg font-serif text-white tracking-wide">{activeTab}</h2>
                <span className="text-xs font-mono font-light text-gray-500">({shows.length})</span>
              </div>

              {shows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-2">
                  <Bookmark className="h-10 w-10 text-gray-800" />
                  <span className="text-xs font-mono tracking-widest uppercase">No shows in this collection</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {shows.map((show, idx) => (
                    <TvCard
                      key={`${show.tmdb_id || show.id}-${idx}`}
                      show={show}
                      showStats={activeTab !== 'Airing Today' && activeTab !== 'Currently Airing'}
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
