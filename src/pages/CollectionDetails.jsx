import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService, ensurePosterUrl, ensureBackdropUrl } from '../services/api';
import MovieCard from '../components/MovieCard';
import { ChevronLeft, FolderHeart } from 'lucide-react';

export default function CollectionDetails() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        const collections = await apiService.getCollections();
        const match = collections.find(c => c.id === id);
        
        if (!match) {
          setError("Collection not found");
          return;
        }

        setCollection(match);

        // Fetch details for each movie in the collection
        if (match.movieIds && match.movieIds.length > 0) {
          const movieDetailsList = await Promise.all(
            match.movieIds.map(async (mid) => {
              try {
                // If it is numeric, check TMDB first
                return await apiService.getMovieDetails(`ext_${mid}`);
              } catch (e) {
                try {
                  return await apiService.getMovieDetails(mid);
                } catch (err) {
                  return null;
                }
              }
            })
          );
          setMovies(movieDetailsList.filter(m => m !== null));
        }
      } catch (e) {
        console.error("Failed to load collection details:", e);
        setError("Failed to load collection details");
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">Loading collection...</span>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <span className="text-xl text-gray-400 font-light">{error || "Collection details unavailable"}</span>
        <Link to="/" className="text-amber-500 hover:text-amber-400 flex items-center space-x-1.5 text-sm font-semibold">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#020205] text-gray-100 font-sans pb-16">
      
      {/* Backdrop Cinematic Header */}
      <div className="relative h-[40vh] sm:h-[50vh] w-full overflow-hidden">
        <img
          src={ensureBackdropUrl(collection.backdrop)}
          alt={collection.name}
          className="w-full h-full object-cover filter brightness-[0.35] blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-black/40 to-transparent z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 sm:-mt-36 z-20 space-y-12 text-left">
        
        {/* Collection info Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent shadow-2xl space-y-4">
          <Link to="/" className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-amber-400 transition-colors mb-2">
            <ChevronLeft className="h-3 w-3" />
            <span>Back to Discovery</span>
          </Link>
          
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <FolderHeart className="h-3.5 w-3.5" />
              <span>Curated Collection</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
              {collection.name}
            </h1>
          </div>
          
          <p className="text-gray-300 font-light text-sm sm:text-base leading-relaxed max-w-3xl">
            {collection.description || "A custom selection of films curated by The Review Guy."}
          </p>
        </div>

        {/* Movies Grid */}
        <div className="space-y-6">
          <h2 className="text-lg font-serif text-white tracking-wide border-b border-gray-900 pb-3 flex items-center space-x-2">
            <span>Movies in this Collection</span>
            <span className="text-xs font-mono font-light text-gray-500">({movies.length})</span>
          </h2>

          {movies.length === 0 ? (
            <div className="text-center py-20 text-gray-600 text-xs font-mono uppercase">
              No movies populated in this collection.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.tmdb_id || movie.id}
                  movie={movie}
                  showStats={true}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
