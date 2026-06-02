import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, ThumbsUp, Calendar } from 'lucide-react';

export default function MovieCard({ movie, showStats = true }) {
  // Determine link target - either local_id or id (some TMDB lists have tmdb_id, some have local_id)
  const detailsUrl = movie.local_id ? `/movie/${movie.local_id}` : `/movie/ext_${movie.tmdb_id}`;
  
  const communityRating = movie.community_rating ? parseFloat(movie.community_rating).toFixed(1) : null;
  const recPct = movie.recommendation_percentage || 0;
  const watchCount = movie.watch_count || 0;

  const getYear = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-')[0];
  };

  return (
    <div className="flex-shrink-0 w-44 sm:w-52 flex flex-col group select-none">
      {/* Poster Wrapper */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden glass-card cursor-pointer">
        <img
          src={movie.poster_url}
          alt={`${movie.title} Poster`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Rating overlays inside poster */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {/* The Review Guy Rating (Community) */}
          {communityRating && communityRating > 0 ? (
            <div className="flex items-center space-x-1 bg-black/75 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>TRG {communityRating}</span>
            </div>
          ) : null}
        </div>

        {/* Bottom backdrop gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 z-10">
          <div className="w-full flex flex-col space-y-2">
            <Link
              to={detailsUrl}
              className="w-full bg-white hover:bg-amber-600 text-black hover:text-white text-center text-[10px] font-bold py-1.5 rounded-lg transition-all"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* Movie Text Info */}
      <div className="mt-3 flex flex-col space-y-1 text-left px-1">
        {/* Title */}
        <Link to={detailsUrl} className="text-sm font-semibold text-gray-200 group-hover:text-amber-400 transition-colors line-clamp-1">
          {movie.title}
        </Link>

        {/* Genre & Year */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-light">
          <span className="truncate max-w-[70%]">{movie.genres ? movie.genres.split(',')[0] : 'Drama'}</span>
          <span className="flex items-center space-x-0.5">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span>{getYear(movie.release_date) || 'N/A'}</span>
          </span>
        </div>

        {/* Extra stats if toggled */}
        {showStats && (
          <div className="pt-1.5 flex items-center justify-between border-t border-gray-900/60 mt-1">
            {/* Recommend % */}
            {recPct > 0 ? (
              <div className="flex items-center space-x-1 text-[10px] text-amber-400" title="Recommendation Percentage">
                <ThumbsUp className="h-3 w-3 fill-amber-500/10" />
                <span>{recPct}% Rec</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-[10px] text-gray-500">
                <ThumbsUp className="h-3 w-3" />
                <span>No Ratings</span>
              </div>
            )}

            {/* Watch Count */}
            {watchCount > 0 && (
              <div className="flex items-center space-x-0.5 text-[10px] text-gray-400" title="Watch Count">
                <Eye className="h-3 w-3" />
                <span>{watchCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
