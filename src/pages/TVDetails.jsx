import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService, cleanTvId } from '../services/api';
import { tmdbClient } from '../services/tmdb';
import RatingWidget from '../components/RatingWidget';
import ReviewCard from '../components/ReviewCard';
import TvCarousel from '../components/TvCarousel';
import { Star, Eye, ThumbsUp, Bookmark, Calendar, Clock, PenTool, MessageSquare, ChevronLeft, Award, Play } from 'lucide-react';

const TV_GENRE_MAP_REVERSE = {
  "Action & Adventure": 10759, "Animation": 16, "Comedy": 35,
  "Crime": 80, "Documentary": 99, "Drama": 18, "Family": 10751,
  "Kids": 10762, "Mystery": 9648, "News": 10763, "Reality": 10764,
  "Sci-Fi & Fantasy": 10765, "Soap": 10766, "Talk": 10767,
  "War & Politics": 10768, "Western": 37
};

export default function TVDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review Text state
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Recommendations & Trailer & Request states
  const [recommendations, setRecommendations] = useState([]);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [requestStats, setRequestStats] = useState({ count: 0, has_requested: false });
  
  // Seasons and Episodes States
  const [expandedSeason, setExpandedSeason] = useState(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState({});
  const [loadingSeason, setLoadingSeason] = useState(null);

  const fetchTVShowDetails = async () => {
    try {
      setLoading(true);
      
      const data = await apiService.getTvShowDetails(id);
      if (data) {
        setShow(data);
        setError(null);

        // Fetch TV recommendations
        const tmdbId = data.tmdb_id;
        if (tmdbId) {
          const firstGenre = data.genres ? (Array.isArray(data.genres) ? data.genres[0] : data.genres.split(',')[0].trim()) : '';
          const genreId = TV_GENRE_MAP_REVERSE[firstGenre] || 18;
          try {
            const recs = await tmdbClient.getTvRecommendations(tmdbId, genreId);
            setRecommendations(recs || []);
          } catch (e) {
            console.error("Failed to load recommendations:", e);
          }

          // Fetch trailer
          try {
            const trail = await apiService.getTvTrailer(tmdbId);
            if (trail && trail.trailer_url) {
              setTrailerUrl(trail.trailer_url);
            }
          } catch (e) {}

          // Fetch review requests count
          try {
            const reqData = await apiService.getReviewRequestCount('tv', tmdbId);
            setRequestStats(reqData);
          } catch (e) {}
        }
      } else {
        setError("TV Show not found");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load TV show details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTVShowDetails();
    setExpandedSeason(null);
    setSeasonEpisodes({});
    setLoadingSeason(null);
  }, [id]);

  const handleRate = async (ratingVal) => {
    try {
      await apiService.rateTvShow(show.id, ratingVal);
      const updated = await apiService.getTvShowDetails(show.id);
      setShow(updated);
      window.dispatchEvent(new Event('user-stats-updated'));
    } catch (e) {
      console.error("Failed to rate show:", e);
    }
  };

  const handleToggleWatched = async () => {
    try {
      await apiService.toggleTvWatched(show.id);
      const updated = await apiService.getTvShowDetails(show.id);
      setShow(updated);
      window.dispatchEvent(new Event('user-stats-updated'));
    } catch (e) {
      console.error("Failed to toggle watched:", e);
    }
  };

  const handleToggleWatchLater = async () => {
    try {
      await apiService.toggleTvWatchLater(show.id);
      const updated = await apiService.getTvShowDetails(show.id);
      setShow(updated);
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
      await apiService.addTvReview(show.id, reviewText.trim());
      setReviewText('');
      const updated = await apiService.getTvShowDetails(show.id);
      setShow(updated);
      window.dispatchEvent(new Event('user-stats-updated'));
    } catch (e) {
      console.error("Failed to submit review:", e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRequestReview = async () => {
    if (requestStats.has_requested) return;
    try {
      const tmdbId = show.tmdb_id || show.id;
      const res = await apiService.addReviewRequest('tv', tmdbId, show.title);
      if (res.success) {
        setRequestStats({ count: res.count, has_requested: true });
      }
    } catch (e) {
      console.error("Failed to request review:", e);
    }
  };

  const handleSeasonToggle = async (seasonNumber) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
      return;
    }
    
    setExpandedSeason(seasonNumber);
    
    if (!seasonEpisodes[seasonNumber]) {
      setLoadingSeason(seasonNumber);
      try {
        const data = await apiService.getTvSeasonDetails(show.id, seasonNumber);
        if (data && data.episodes) {
          setSeasonEpisodes(prev => ({
            ...prev,
            [seasonNumber]: data.episodes
          }));
        }
      } catch (e) {
        console.error("Failed to load season episodes:", e);
      } finally {
        setLoadingSeason(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">Loading series data...</span>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <span className="text-xl text-gray-400 font-light">{error || "TV show details unavailable"}</span>
        <Link to="/tv" className="text-amber-500 hover:text-amber-400 flex items-center space-x-1.5 text-sm font-semibold">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to TV Home</span>
        </Link>
      </div>
    );
  }

  const communityRating = show.community_rating ? parseFloat(show.community_rating).toFixed(1) : '0.0';
  const recPercentage = show.recommendation_percentage || 0;
  const watchCount = show.watch_count || 0;
  const totalRatings = show.total_ratings || 0;

  return (
    <div className="relative w-full min-h-screen bg-black text-gray-100 font-sans pb-16">
      
      {/* Backdrop Header */}
      <div className="relative h-[45vh] sm:h-[55vh] lg:h-[60vh] w-full overflow-hidden">
        <img
          src={show.backdrop_url}
          alt={show.title}
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
              src={show.poster_url}
              alt={`${show.title} Poster`}
              className="w-full object-cover"
            />
          </div>

          {/* Right: Info */}
          <div className="flex-grow space-y-5">
            {/* Breadcrumb */}
            <Link to="/tv" className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-amber-400 transition-colors py-1">
              <ChevronLeft className="h-3 w-3" />
              <span>Back to TV Discovery</span>
            </Link>

            {/* Title & Seasons */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white tracking-wide">
                {show.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-400 font-light">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                  <span>First Aired: {show.release_date || 'Unknown'}</span>
                </span>
                
                <span className="h-3 w-[1px] bg-gray-800" />
                
                <span className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                  <span>{show.number_of_seasons || 1} Seasons ({show.number_of_episodes || 10} Episodes)</span>
                </span>
                
                <span className="h-3 w-[1px] bg-gray-800" />
                
                <span className="px-2 py-0.5 bg-gray-900 border border-gray-800 rounded text-[10px] tracking-wider uppercase">
                  {show.language || 'en'}
                </span>

                {show.status && (
                  <>
                    <span className="h-3 w-[1px] bg-gray-800" />
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[10px] tracking-wide font-semibold">
                      {show.status}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Watch Trailer & YouTube Review Buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              {trailerUrl && (
                <a
                  href={trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
                >
                  <Play className="h-3.5 w-3.5 fill-black" />
                  <span>Watch Trailer</span>
                </a>
              )}

              {show.youtube_review_url && (
                <a
                  href={show.youtube_review_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-red-600/20 transition-all duration-300"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Watch YouTube Review</span>
                </a>
              )}
            </div>

            {/* Genres Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {show.genres && (Array.isArray(show.genres) ? show.genres : show.genres.split(',')).map((genre) => (
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
              <p>{show.overview || "No description available for this series."}</p>
            </div>

            {/* Premium Metadata Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs py-5 border-t border-b border-white/10 font-sans font-light">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Seasons</span>
                <p className="text-gray-200 font-medium text-sm">{show.number_of_seasons || 1}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Episodes</span>
                <p className="text-gray-200 font-medium text-sm">{show.number_of_episodes || 10}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">First Aired</span>
                <p className="text-gray-200 font-medium text-sm">{show.first_air_date || show.release_date || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Last Aired</span>
                <p className="text-gray-200 font-medium text-sm">{show.last_air_date || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Status</span>
                <p className="text-amber-400 font-medium text-sm">{show.status || 'Ended'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Network</span>
                <p className="text-gray-200 font-medium text-sm">{show.network || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Creator</span>
                <p className="text-gray-200 font-medium text-sm">{show.creator || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Top Cast</span>
                <p className="text-gray-200 font-medium text-sm line-clamp-1">{show.cast || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Review Guy Verdict (Official TV Verdict) */}
        {((show.trg_rating !== null && show.trg_rating !== undefined) || show.trg_review) ? (
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.04] to-transparent text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 h-48 w-48 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide flex items-center space-x-2.5">
                <Award className="h-6 w-6 text-amber-400" />
                <span>The Review Guy Verdict</span>
              </h2>
              {show.trg_rating !== null && show.trg_rating !== undefined && (
                <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-base font-extrabold text-amber-400">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span>TRG Rating: {parseFloat(show.trg_rating).toFixed(1)} / 10</span>
                </div>
              )}
            </div>
            
            {show.trg_review ? (
              <div className="space-y-4">
                <p className="text-gray-300 font-light italic text-base leading-relaxed sm:text-lg">
                  "{show.trg_review}"
                </p>
                <div className="text-right">
                  <span className="text-sm font-bold text-amber-400 tracking-wider">— The Review Guy</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">Rating set. Full written verdict pending.</p>
            )}
          </div>
        ) : (
          /* Review Requests Widget when there is no TRG verdict yet */
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 bg-gradient-to-r from-white/[0.01] to-transparent text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-serif font-semibold text-white">
                Request Review for {show.title}
              </h3>
              <p className="text-xs text-gray-400 max-w-2xl font-light">
                There is currently no official verdict or rating for this TV show. Let the team know you'd like a review! Vote count increases priority.
              </p>
            </div>
            <button
              onClick={handleRequestReview}
              disabled={requestStats.has_requested}
              className={`px-6 py-3 rounded-full text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                requestStats.has_requested
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-default'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-950/20 hover:shadow-amber-500/25'
              }`}
            >
              {requestStats.has_requested ? `Requested ✓ (${requestStats.count} Votes)` : `Request Review (${requestStats.count} Votes)`}
            </button>
          </div>
        )}

        {/* Dashboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Community Stats Card */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800/80 space-y-6 text-left">
            <h2 className="text-lg font-serif text-white tracking-wide border-b border-gray-900 pb-2">
              Community TV Rating
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-bold tracking-tight text-white">{communityRating}</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Community Score ({totalRatings})</span>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1">
                <ThumbsUp className="h-6 w-6 text-emerald-400 fill-emerald-400/10" />
                <span className="text-2xl font-bold tracking-tight text-white">{recPercentage}%</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Recommend</span>
              </div>

              <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1">
                <Eye className="h-6 w-6 text-sky-400" />
                <span className="text-2xl font-bold tracking-tight text-white">{watchCount}</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Watch Count</span>
              </div>
            </div>
          </div>

          {/* User Actions Panel */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800/80 space-y-6 text-left flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="text-lg font-serif text-white tracking-wide border-b border-gray-900 pb-2">
                Your TV Rating
              </h2>
              
              <RatingWidget
                initialRating={show.user_rating}
                onRate={handleRate}
                mediaType="tv"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {/* Toggle Watched Log */}
              <button
                onClick={handleToggleWatched}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs font-semibold border tracking-wide transition-all cursor-pointer ${
                  show.is_watched
                    ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>{show.is_watched ? 'Watched Series ✓' : 'Mark as Watched'}</span>
              </button>

              {/* Bookmark Toggle */}
              <button
                onClick={handleToggleWatchLater}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs font-semibold border tracking-wide transition-all cursor-pointer ${
                  show.is_watch_later
                    ? 'bg-amber-600/10 border-amber-500/40 text-amber-400'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${show.is_watch_later ? 'fill-amber-500/30 text-amber-500' : ''}`} />
                <span>{show.is_watch_later ? 'Bookmarked' : 'Add to Watch Later'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Seasons & Episodes Accordion Section */}
        {show.seasons && show.seasons.length > 0 && (
          <div className="space-y-6 text-left">
            <h2 className="text-xl font-serif text-white tracking-wide border-b border-gray-900 pb-2 flex items-center space-x-2">
              <Play className="h-5 w-5 text-amber-500 fill-amber-500/10" />
              <span>Seasons & Episodes</span>
            </h2>
            
            <div className="space-y-3">
              {(show.seasons || [])
                .filter(s => s.season_number > 0)
                .map((season) => {
                  const isExpanded = expandedSeason === season.season_number;
                  const episodes = seasonEpisodes[season.season_number] || [];
                  const isLoading = loadingSeason === season.season_number;
                  
                  return (
                    <div key={season.season_number} className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
                      {/* Season Accordion Header */}
                      <button
                        onClick={() => handleSeasonToggle(season.season_number)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 bg-gray-900/30 hover:bg-gray-900/50 transition-colors focus:outline-none cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          {season.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${season.poster_path}`}
                              className="h-12 w-8 object-cover rounded border border-white/5 flex-shrink-0"
                              alt=""
                            />
                          ) : (
                            <div className="h-12 w-8 bg-gray-800 rounded border border-gray-700 flex-shrink-0 flex items-center justify-center text-[8px] text-gray-500">
                              No Poster
                            </div>
                          )}
                          <div className="text-left">
                            <h3 className="text-sm sm:text-base font-semibold text-white">
                              {season.name || `Season ${season.season_number}`}
                            </h3>
                            <p className="text-xs text-gray-400 font-light mt-0.5">
                              {season.episode_count} Episodes
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <span className="text-xs text-amber-500 font-medium flex items-center space-x-1">
                              <span>Collapse</span>
                              <span className="text-sm">▲</span>
                            </span>
                          ) : (
                            <span className="text-xs hover:text-amber-400 font-medium flex items-center space-x-1">
                              <span>Expand</span>
                              <span className="text-sm">▼</span>
                            </span>
                          )}
                        </div>
                      </button>
                      
                      {/* Season Accordion Episodes Content */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 bg-black/40 border-t border-white/5 space-y-4 animate-fadeIn">
                          {isLoading ? (
                            <div className="flex items-center justify-center py-8 space-x-2">
                              <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs text-gray-400 font-mono">Loading episodes...</span>
                            </div>
                          ) : episodes.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-500 font-mono">
                              No episodes details available.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {episodes.map((ep) => (
                                <div
                                  key={ep.episode_number}
                                  className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-950/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                                >
                                  {/* Episode Thumbnail */}
                                  {ep.still_url ? (
                                    <img
                                      src={ep.still_url}
                                      className="w-full sm:w-40 aspect-video object-cover rounded-lg flex-shrink-0 border border-white/5"
                                      alt=""
                                    />
                                  ) : (
                                    <div className="w-full sm:w-40 aspect-video bg-gray-900 border border-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] text-gray-500">
                                      No Preview Available
                                    </div>
                                  )}
                                  
                                  {/* Episode Text Info */}
                                  <div className="flex-grow space-y-1.5 text-left">
                                    <div className="flex flex-wrap items-baseline gap-2">
                                      <h4 className="text-sm font-semibold text-white">
                                        Episode {ep.episode_number}: {ep.name || `Episode ${ep.episode_number}`}
                                      </h4>
                                      {ep.air_date && (
                                        <span className="text-[10px] text-gray-400 bg-gray-900 border border-gray-800 px-1.5 py-0.5 rounded">
                                          Aired: {ep.air_date}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-300 font-light leading-relaxed">
                                      {ep.overview || "No overview available for this episode."}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Reviews and Community Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Write Review Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800/80 space-y-4 text-left">
            <h2 className="text-lg font-serif text-white tracking-wide border-b border-gray-900 pb-2 flex items-center space-x-2">
              <PenTool className="h-4.5 w-4.5 text-amber-500" />
              <span>Add a TV Review</span>
            </h2>

            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts on the series..."
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
              <span>TV Show Reviews</span>
              <span className="text-xs font-mono font-light text-gray-500">
                ({show.reviews ? show.reviews.length : 0})
              </span>
            </h2>

            <div className="flex flex-col space-y-4 pt-2 max-h-[500px] overflow-y-auto pr-1">
              {!show.reviews || show.reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-600 text-xs font-mono tracking-wide uppercase">
                  No reviews published yet. Be the first to review this TV show!
                </div>
              ) : (
                show.reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* TV Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="pt-6 border-t border-gray-900/60">
            <TvCarousel
              title="You May Also Like"
              shows={recommendations}
              showStats={false}
            />
          </div>
        )}

      </div>
    </div>
  );
}
