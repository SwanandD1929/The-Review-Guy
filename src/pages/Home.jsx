import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import Hero from '../components/Hero';
import MovieCarousel from '../components/MovieCarousel';

export default function Home() {
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [mostWatched, setMostWatched] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const contentRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [upRes, trendRes, playRes, topRes, watchRes] = await Promise.all([
        apiService.getUpcoming(),
        apiService.getTrending(),
        apiService.getNowPlaying(),
        apiService.getTopRated(),
        apiService.getMostWatched(),
      ]);

      console.log("Home Page Loaded Movies:", {
        upcoming: upRes,
        trending: trendRes,
        nowPlaying: playRes,
        topRated: topRes,
        mostWatched: watchRes
      });

      setUpcoming(upRes || []);
      setTrending(trendRes || []);
      setNowPlaying(playRes || []);
      setTopRated(topRes || []);
      setMostWatched(watchRes || []);
    } catch (e) {
      console.error("Failed to load home page movies:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScrollToContent = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Cinematic Hero */}
      <Hero onExploreClick={handleScrollToContent} />

      {/* Main Movie Lists */}
      <div ref={contentRef} className="max-w-7xl mx-auto py-12 space-y-12">
        {loading ? (
          // Shimmer loading feedback
          <div className="space-y-12 px-4 sm:px-6 lg:px-8">
            {[1, 2, 3].map((val) => (
              <div key={val} className="space-y-4 text-left">
                <div className="h-6 w-48 bg-gray-900 rounded-lg animate-pulse" />
                <div className="flex space-x-6 overflow-x-hidden">
                  {[1, 2, 3, 4, 5].map((card) => (
                    <div key={card} className="w-44 sm:w-52 aspect-[2/3] bg-gray-950/80 rounded-2xl animate-pulse flex-shrink-0" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 1. Upcoming Movies */}
            <MovieCarousel
              title="Upcoming Movies In India"
              movies={upcoming}
              showStats={false}
            />

            {/* 2. Trending Now */}
            <MovieCarousel
              title="Trending Now"
              movies={trending}
              showStats={false}
            />

            {/* 3. In Theaters */}
            <MovieCarousel
              title="Now Playing In Theaters"
              movies={nowPlaying}
              showStats={false}
            />

            {/* 4. Top Rated By Community */}
            <MovieCarousel
              title="Top Rated By Community"
              movies={topRated}
              showStats={true}
            />

            {/* 5. Most Watched */}
            <MovieCarousel
              title="Most Watched Movies"
              movies={mostWatched}
              showStats={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
