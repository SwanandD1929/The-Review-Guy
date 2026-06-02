import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { tmdbClient } from '../services/tmdb';
import RatingWidget from '../components/RatingWidget';
import ReviewCard from '../components/ReviewCard';
import { Star, Eye, ThumbsUp, Bookmark, Calendar, Clock, User, PenTool, MessageSquare, ChevronLeft } from 'lucide-react';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review Text state
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      
      // Silent on-the-fly TMDB import check
      if (id && id.startsWith('ext_')) {
        const tmdbId = id.replace('ext_', '');
        const details = await tmdbClient.getMovieDetails(tmdbId);
        if (details) {
          const saved = await apiService.importMovie(details);
          const newLocalId = saved.local_id || saved.id;
          window.dispatchEvent(new Event('user-stats-updated'));
          navigate(`/movie/${newLocalId}`, { replace: true });
          return;
        } else {
          setError("Failed to fetch details.");
          return;
        }
      }

      const data = await apiService.getMovieDetails(id);
      if (data) {
        setMovie(data);
        setError(null);
      } else {
        setError("Movie not found");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const handleRate = async (ratingVal) => {
    try {
      await apiService.rateMovie(movie.id, ratingVal);
      // Re-fetch details to update averages and recommendation %
      const updated = await apiService.getMovieDetails(movie.id);
      setMovie(updated);
      // Broadcast stats update for navbar
      window.dispatchEvent(new Event('user-stats-updated'));
    } catch (e) {
      console.error("Failed to rate movie:", e);
    }
  };

  const handleToggleWatched = async () => {
    try {
      await apiService.toggleWatched(movie.id);
      const updated = await apiService.getMovieDetails(movie.id);
      setMovie(updated);
      window.dispatchEvent(new Event('user-stats-updated'));
    } catch (e) {
      console.error("Failed to toggle watched:", e);
    }
  };

  const handleToggleWatchLater = async () => {
    try {
      await apiService.toggleWatchLater(movie.id);
      const updated = await apiService.getMovieDetails(movie.id);
      setMovie(updated);
      window.dispatchEvent(new Event('user-stats-updated'));
    } catch (e) {
      console.error("Failed to toggle watch later:", e);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      await apiService.addReview(movie.id, reviewText.trim());
      setReviewText('');
      // Re-fetch details to update reviews feed
      const updated = await apiService.getMovieDetails(movie.id);
      setMovie(updated);
      window.dispatchEvent(new Event('user-stats-updated'));
    } catch (e) {
      console.error("Failed to submit review:", e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">Loading cinematic experience...</span>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <span className="text-xl text-gray-400 font-light">{error || "Movie details unavailable"}</span>
        <Link to="/" className="text-amber-500 hover:text-amber-400 flex items-center space-x-1.5 text-sm font-semibold">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  // Format statistics
  const communityRating = movie.community_rating ? parseFloat(movie.community_rating).toFixed(1) : '0.0';
  const tmdbRating = movie.tmdb_rating ? parseFloat(movie.tmdb_rating).toFixed(1) : 'N/A';
  const recPercentage = movie.recommendation_percentage || 0;
  const watchCount = movie.watch_count || 0;
  const totalRatings = movie.total_ratings || 0;

  return (
    <div className="relative w-full min-h-screen bg-black text-gray-100 font-sans pb-16">
      
      {/* Backdrop Header (Cinematic Banner Blur) */}
      <div className="relative h-[45vh] sm:h-[55vh] lg:h-[60vh] w-full overflow-hidden">
        <img
          src={movie.backdrop_url}
          alt={movie.title}
          className="w-full h-full object-cover filter brightness-[0.4] scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
      </div>

      {/* Main Details Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-32 sm:-mt-48 lg:-mt-64 z-20 flex flex-col space-y-12">
        
        {/* Poster & Main Metadata */}
        <div className="flex flex-col md:flex-row items-start md:space-x-8 lg:space-x-12 space-y-6 md:space-y-0 text-left">
          
          {/* Left: Poster */}
          <div className="w-48 sm:w-60 lg:w-72 flex-shrink-0 rounded-2xl overflow-hidden glass-panel border border-white/5 shadow-2xl self-center md:self-start">
            <img
              src={movie.poster_url}
              alt={`${movie.title} Poster`}
              className="w-full object-cover"
            />
          </div>

          {/* Right: Info */}
          <div className="flex-1 space-y-5">
            {/* Breadcrumb */}
            <Link to="/" className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-amber-400 transition-colors py-1">
              <ChevronLeft className="h-3 w-3" />
              <span>Back to Discovery</span>
            </Link>

            {/* Title & Year */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white tracking-wide">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-400 font-light">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  <span>{movie.release_date || 'Unknown'}</span>
                </span>
                
                <span className="h-3 w-[1px] bg-gray-800" />
                
                <span className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                  <span>{movie.runtime} mins</span>
                </span>
                
                <span className="h-3 w-[1px] bg-gray-800" />
                
                <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded text-[10px] tracking-wider uppercase">
                  {movie.language}
                </span>
              </div>
            </div>

            {/* Genres Chips */}
            <div className="flex flex-wrap gap-2">
              {movie.genres && (Array.isArray(movie.genres) ? movie.genres : movie.genres.split(',')).map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-gray-950/80 border border-gray-800 rounded-full text-[11px] font-semibold text-gray-300 tracking-wide"
                >
                  {genre.trim()}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div className="space-y-2 font-sans font-light text-sm sm:text-base leading-relaxed text-gray-300 max-w-3xl">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400">Synopsis</h3>
              <p>{movie.overview || "No description available for this film."}</p>
            </div>

            {/* Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs py-4 border-t border-b border-gray-950 font-sans font-light">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Director</span>
                <p className="text-gray-200 font-medium text-sm">{movie.director || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Top Cast</span>
                <p className="text-gray-200 font-medium text-sm line-clamp-1">{movie.cast || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Section: Community Stats & User Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Community Stats Dashboard Card */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800/80 space-y-6 text-left">
            <h2 className="text-lg font-serif text-white tracking-wide border-b border-gray-900 pb-2">
              Community Ratings Dashboard
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {/* Avg Community Rating */}
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-bold tracking-tight text-white">{communityRating}</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">TRG Rating ({totalRatings})</span>
              </div>

              {/* Recommendation % */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1">
                <ThumbsUp className="h-6 w-6 text-emerald-400 fill-emerald-400/10" />
                <span className="text-2xl font-bold tracking-tight text-white">{recPercentage}%</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Recommend</span>
              </div>

              {/* Watch Count */}
              <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1">
                <Eye className="h-6 w-6 text-sky-400" />
                <span className="text-2xl font-bold tracking-tight text-white">{watchCount}</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Watch Count</span>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-500 italic text-right">
              * Recommendation % represents users who scored this film 7/10 or higher.
            </p>
          </div>

          {/* User Quick Actions Panel */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800/80 space-y-6 text-left flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="text-lg font-serif text-white tracking-wide border-b border-gray-900 pb-2">
                Your Verdict
              </h2>
              
              {/* Star Rating Widget */}
              <RatingWidget
                initialRating={movie.user_rating}
                onRate={handleRate}
              />
            </div>

            {/* Watch List Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Mark Watched Button */}
              <button
                onClick={handleToggleWatched}
                className={`flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs font-semibold border tracking-wide transition-all cursor-pointer ${
                  movie.is_watched
                    ? 'bg-sky-600/10 border-sky-500/40 text-sky-400'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white'
                }`}
              >
                <Eye className={`h-4 w-4 ${movie.is_watched ? 'fill-sky-400/10' : ''}`} />
                <span>{movie.is_watched ? 'Watched' : 'Mark Watched'}</span>
              </button>

              {/* Watch Later Button */}
              <button
                onClick={handleToggleWatchLater}
                className={`flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs font-semibold border tracking-wide transition-all cursor-pointer ${
                  movie.is_watch_later
                    ? 'bg-amber-600/10 border-amber-500/40 text-amber-400'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${movie.is_watch_later ? 'fill-amber-500/30 text-amber-500' : ''}`} />
                <span>{movie.is_watch_later ? 'Bookmarked' : 'Watch Later'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews and Community Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Write Review Form Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800/80 space-y-4 text-left">
            <h2 className="text-lg font-serif text-white tracking-wide border-b border-gray-900 pb-2 flex items-center space-x-2">
              <PenTool className="h-4.5 w-4.5 text-amber-500" />
              <span>Write a Review</span>
            </h2>

            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts on the film..."
                rows="4"
                className="w-full bg-gray-950 border border-gray-800 hover:border-gray-700 text-gray-200 p-4 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                required
              />
              
              <button
                type="submit"
                disabled={isSubmittingReview || !reviewText.trim()}
                className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-4 rounded-full text-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Review</span>
                )}
              </button>
            </form>
          </div>

          {/* Community Reviews List Feed */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h2 className="text-lg sm:text-xl font-serif text-white tracking-wide border-b border-gray-900 pb-2 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              <span>Community Reviews</span>
              <span className="text-xs font-mono font-light text-gray-500">
                ({movie.reviews ? movie.reviews.length : 0})
              </span>
            </h2>

            <div className="flex flex-col space-y-4 pt-2 max-h-[500px] overflow-y-auto pr-1">
              {!movie.reviews || movie.reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-600 text-xs font-mono tracking-wide uppercase">
                  No reviews published yet. Be the first to share your thoughts!
                </div>
              ) : (
                movie.reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
