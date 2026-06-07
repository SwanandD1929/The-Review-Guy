import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiService, cleanMovieId, ensurePosterUrl, ensureBackdropUrl } from '../services/api';
import Hero from '../components/Hero';
import MovieCarousel from '../components/MovieCarousel';
import { 
  Award, Star, Swords, FolderHeart, Eye, Vote, Check,
  Play, Globe, Code, Info, AlertTriangle, ArrowRight, X, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CinematicBackground from '../components/CinematicBackground';

export default function Home() {
  // Homepage content states
  const [featured, setFeatured] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [trending, setTrending] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [mostWatched, setMostWatched] = useState([]);

  // Premium Features States
  const [announcements, setAnnouncements] = useState([]);
  const [sectionsOrder, setSectionsOrder] = useState([]);
  const [top10Rankings, setTop10Rankings] = useState([]);
  const [activeBattle, setActiveBattle] = useState(null);
  const [collections, setCollections] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  
  // Voting tracking
  const [votedBattle, setVotedBattle] = useState(null); // 1 or 2 if voted

  // Modal / Banner dismissals
  const [popupAnnouncement, setPopupAnnouncement] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);

  // User fingerprint for voting limits
  const fingerprint = localStorage.getItem('trg_fingerprint') || 'anon';

  const loadHomepageData = async () => {
    try {
      setLoading(true);
      
      // Fetch layout and config data in parallel
      const [
        upRes, trendRes, playRes, topRes, watchRes, featuredRes,
        annRes, secRes, top10Res, batRes, colRes, hidRes, recRes, allMovies
      ] = await Promise.all([
        apiService.getUpcoming(),
        apiService.getTrending(),
        apiService.getNowPlaying(),
        apiService.getTopRated(),
        apiService.getMostWatched(),
        apiService.getFeaturedMovie(),
        apiService.getAnnouncements(),
        apiService.getHomepageSections(),
        apiService.getTop10Rankings(),
        apiService.getMovieBattles(),
        apiService.getCollections(),
        apiService.getHiddenMovies(),
        apiService.getRecommendedMovies(),
        apiService.getAllMovies()
      ]);

      // Normalize hidden movie IDs
      const hiddenSet = new Set((hidRes || []).map(id => cleanMovieId(id)));

      // Helper to exclude hidden movies
      const filterHidden = (list) => {
        if (!list) return [];
        return list.filter(m => !hiddenSet.has(cleanMovieId(m.tmdb_id || m.id)));
      };

      // Helper to apply sections config (exclusions and pins)
      const processSection = async (sectionId, baseList) => {
        let list = filterHidden(baseList);
        const sectionConfig = (secRes || []).find(s => s.id === sectionId);
        if (!sectionConfig) return list;
        
        // 1. Apply exclusions
        if (sectionConfig.exclusions && sectionConfig.exclusions.length > 0) {
          const exclSet = new Set(sectionConfig.exclusions.map(id => cleanMovieId(id)));
          list = list.filter(m => !exclSet.has(cleanMovieId(m.tmdb_id || m.id)));
        }
        
        // 2. Apply pins
        if (sectionConfig.pins && sectionConfig.pins.length > 0) {
          const pinsList = (await Promise.all(
            sectionConfig.pins.map(async (pinId) => {
              const cleanPinId = cleanMovieId(pinId);
              let found = list.find(m => cleanMovieId(m.tmdb_id || m.id) === cleanPinId);
              if (found) return found;
              found = (allMovies || []).find(m => cleanMovieId(m.tmdb_id || m.id) === cleanPinId);
              if (found) return found;
              try {
                const movieDetails = await apiService.getMovieDetails(`ext_${cleanPinId}`);
                return movieDetails;
              } catch (e) {
                return null;
              }
            })
          )).filter(Boolean);
          
          const pinnedSet = new Set(pinsList.map(m => cleanMovieId(m.tmdb_id || m.id)));
          list = [...pinsList, ...list.filter(m => !pinnedSet.has(cleanMovieId(m.tmdb_id || m.id)))];
        }
        
        return list;
      };

      // Set movies lists
      const finalUpcoming = await processSection("upcoming", upRes);
      const finalTrending = await processSection("trending", trendRes);
      const finalNowPlaying = await processSection("nowPlaying", playRes);
      const finalTopRated = await processSection("topRated", topRes);
      const finalMostWatched = await processSection("mostWatched", watchRes);
      
      setUpcoming(finalUpcoming);
      setTrending(finalTrending);
      setNowPlaying(finalNowPlaying);
      setTopRated(finalTopRated);
      setMostWatched(finalMostWatched);
      
      // Spotlight featured check
      if (featuredRes && !hiddenSet.has(cleanMovieId(featuredRes.tmdb_id || featuredRes.id || featuredRes.local_id))) {
        setFeatured(featuredRes);
      } else {
        setFeatured(null);
      }

      // Announcements & filter for banners/popups
      setAnnouncements(annRes || []);
      
      // Find one active popup announcement that isn't dismissed yet
      const popup = (annRes || []).find(ann => {
        if (!ann.popupMode) return false;
        return !localStorage.getItem(`trg_dismissed_ann_${ann.id}`);
      });
      if (popup) {
        setPopupAnnouncement(popup);
      }

      // Homepage layout sections configurations
      setSectionsOrder(secRes || []);

      // Top 10 rankings details loader
      const top10Loaded = await Promise.all(
        (top10Res || []).map(async (item) => {
          // Attempt to resolve poster/backdrop details
          try {
            const movieDetails = await apiService.getMovieDetails(`ext_${item.tmdb_id}`);
            return { ...item, ...movieDetails };
          } catch (e) {
            return item;
          }
        })
      );
      setTop10Rankings(top10Loaded);

      // Active movie battle
      const today = new Date().toISOString().split('T')[0];
      const activeBat = (batRes || []).find(b => {
        return (!b.startDate || b.startDate <= today) && (!b.endDate || b.endDate >= today);
      });
      if (activeBat) {
        setActiveBattle(activeBat);
        if (activeBat.votes1 && activeBat.votes1.includes(fingerprint)) {
          setVotedBattle(1);
        } else if (activeBat.votes2 && activeBat.votes2.includes(fingerprint)) {
          setVotedBattle(2);
        }
      }

      // Curated Collections list
      setCollections(colRes || []);

      // The Review Guy Recommends list
      const recSet = new Set((recRes || []).map(id => cleanMovieId(id)));
      const filteredRecMovies = allMovies.filter(m => recSet.has(cleanMovieId(m.tmdb_id || m.id)) && !hiddenSet.has(cleanMovieId(m.tmdb_id || m.id)));
      const finalRecommended = await processSection("trgPicks", filteredRecMovies);
      setRecommendedMovies(finalRecommended);

    } catch (e) {
      console.error("Failed to load homepage data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomepageData();
  }, []);

  const handleVoteHomeBattle = async (movieIndex) => {
    if (!activeBattle) return;
    try {
      await apiService.voteMovieBattle(activeBattle.id, movieIndex);
      setVotedBattle(movieIndex);
      // Reload battles results
      const battles = await apiService.getMovieBattles();
      const updated = battles.find(b => b.id === activeBattle.id);
      if (updated) {
        setActiveBattle(updated);
      }
    } catch (e) {
      console.error("Failed to vote:", e);
    }
  };

  const dismissPopup = (id) => {
    localStorage.setItem(`trg_dismissed_ann_${id}`, 'true');
    setPopupAnnouncement(null);
  };

  const handleScrollToContent = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Renderer helper for dynamically ordered homepage sections
  const renderSection = (sec) => {
    if (!sec.enabled) return null;

    switch (sec.id) {
      case 'announcements':
        // Filter out announcements that aren't banners
        const banners = announcements.filter(a => a.bannerMode);
        if (banners.length === 0) return null;
        return (
          <div key={sec.id} className="w-full border-y border-white/5 bg-white/[0.01] backdrop-blur-md py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
              {banners.map((ann) => {
                const borderStyles = {
                  Critical: "bg-rose-500/10 border-rose-500/20 text-rose-300",
                  Important: "bg-amber-500/10 border-amber-500/20 text-amber-300",
                  Normal: "bg-slate-900/40 border-white/5 text-gray-300"
                };
                const badgeStyles = {
                  Critical: "bg-rose-500/20 border-rose-500/30 text-rose-400",
                  Important: "bg-amber-500/20 border-amber-500/30 text-amber-400",
                  Normal: "bg-white/5 border-white/10 text-gray-400"
                };
                return (
                  <div 
                    key={ann.id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur-md text-left transition-all ${borderStyles[ann.priority] || borderStyles.Normal}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${badgeStyles[ann.priority] || badgeStyles.Normal}`}>
                        {ann.priority}
                      </span>
                      <p className="text-xs font-semibold leading-relaxed font-sans">{ann.title}</p>
                    </div>
                    {ann.title.includes('Battle') && (
                      <Link 
                        to="/battles" 
                        className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-amber-400 hover:text-amber-300 underline decoration-amber-500/40 hover:decoration-amber-300 flex-shrink-0"
                      >
                        <span>Vote Now</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'upcoming':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <MovieCarousel
              title="Upcoming Movies In India"
              movies={upcoming}
              showStats={false}
            />
          </div>
        );

      case 'trending':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <MovieCarousel
              title="Trending Now"
              movies={trending}
              showStats={false}
            />
          </div>
        );

      case 'nowPlaying':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <MovieCarousel
              title="Now Playing In Theaters"
              movies={nowPlaying}
              showStats={false}
            />
          </div>
        );

      case 'topRated':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <MovieCarousel
              title="Top Rated By Community"
              movies={topRated}
              showStats={true}
            />
          </div>
        );

      case 'mostWatched':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <MovieCarousel
              title="Most Watched Movies"
              movies={mostWatched}
              showStats={true}
            />
          </div>
        );

      case 'trgPicks':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <MovieCarousel
              title="The Review Guy Recommends"
              movies={recommendedMovies}
              showStats={true}
            />
          </div>
        );

      case 'movieBattles':
        if (!activeBattle) return null;
        const v1 = (activeBattle.votes1 || []).length;
        const v2 = (activeBattle.votes2 || []).length;
        const tot = v1 + v2;
        const p1 = tot > 0 ? Math.round((v1 / tot) * 100) : 50;
        const p2 = tot > 0 ? 100 - p1 : 50;
        
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-left">
            <div className="glass-panel border border-rose-500/20 bg-gradient-to-r from-rose-950/10 via-black to-black p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-48 w-48 bg-rose-500/5 blur-3xl pointer-events-none rounded-full" />
              
              {/* Battle info and voting */}
              <div className="space-y-4 max-w-md">
                <span className="inline-flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Swords className="h-3.5 w-3.5 animate-pulse" />
                  <span>Active Head-to-Head Battle</span>
                </span>
                
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                  {activeBattle.movie1.title} <span className="text-rose-500 text-sm">VS</span> {activeBattle.movie2.title}
                </h3>
                
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Join the clash! Cast your community vote below on this active matchup. Real-time percentages update instantly.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  {votedBattle === null ? (
                    <>
                      <button 
                        onClick={() => handleVoteHomeBattle(1)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl transition-all text-[11px] cursor-pointer flex items-center space-x-1"
                      >
                        <Vote className="h-3.5 w-3.5" />
                        <span>Vote {activeBattle.movie1.title}</span>
                      </button>
                      <button 
                        onClick={() => handleVoteHomeBattle(2)}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-black font-extrabold rounded-xl transition-all text-[11px] cursor-pointer flex items-center space-x-1"
                      >
                        <Vote className="h-3.5 w-3.5" />
                        <span>Vote {activeBattle.movie2.title}</span>
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                      <Check className="h-3.5 w-3.5" />
                      <span>Vote Registered (You voted {votedBattle === 1 ? 'Left' : 'Right'})</span>
                    </span>
                  )}
                  <Link 
                    to="/battles" 
                    className="text-xs font-semibold text-gray-400 hover:text-white underline ml-2 decoration-gray-700"
                  >
                    View Archives
                  </Link>
                </div>
              </div>

              {/* Progress visual feedback */}
              <div className="flex-grow max-w-md bg-white/[0.01] border border-white/5 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-gray-300">
                  <span>{activeBattle.movie1.title}</span>
                  <span>{activeBattle.movie2.title}</span>
                </div>

                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                  <div className="h-full bg-amber-500 shadow-lg" style={{ width: `${p1}%` }} />
                  <div className="h-full bg-sky-500 shadow-lg" style={{ width: `${p2}%` }} />
                </div>

                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span className="text-amber-400 font-bold">{p1}% ({v1} votes)</span>
                  <span>{tot} community votes</span>
                  <span className="text-sky-400 font-bold">{p2}% ({v2} votes)</span>
                </div>
              </div>

            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <CinematicBackground className="w-full min-h-screen text-white pb-16 animate-fade-in">
      {/* Cinematic Hero */}
      <Hero onExploreClick={handleScrollToContent} />

      {/* Announcements Modal Popup Overlay */}
      <AnimatePresence>
        {popupAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card border border-rose-500/20 bg-gradient-to-b from-[#140b0f] to-black p-8 max-w-lg w-full rounded-3xl text-center shadow-2xl relative"
            >
              <button 
                onClick={() => dismissPopup(popupAnnouncement.id)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <span className="inline-flex items-center space-x-1.5 bg-rose-500/15 border border-rose-500/35 text-rose-400 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
                System Announcement
              </span>

              <h3 className="text-lg font-bold text-white leading-snug mb-4">
                {popupAnnouncement.title}
              </h3>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => dismissPopup(popupAnnouncement.id)}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors text-xs cursor-pointer"
                >
                  Dismiss Notification
                </button>
                {popupAnnouncement.title.includes('Battle') && (
                  <Link
                    to="/battles"
                    onClick={() => dismissPopup(popupAnnouncement.id)}
                    className="px-6 py-2 bg-white text-black font-extrabold rounded-xl hover:bg-gray-200 transition-colors text-xs flex items-center space-x-1"
                  >
                    <span>Cast Your Vote</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Movie Lists */}
      <div ref={contentRef} className="w-full py-12 space-y-12 animate-fade-in">
        {loading ? (
          // Premium shimmer loader
          <div className="max-w-7xl mx-auto space-y-12 px-4 sm:px-6 lg:px-8">
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
            {/* Spotlight Banner: Movie of the Week */}
            {featured && (
              <div className="w-full border-y border-white/5 bg-white/[0.01] backdrop-blur-md py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-black/45 backdrop-blur-md p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center gap-6 lg:gap-10 text-left shadow-2xl">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Poster */}
                    <div className="w-32 sm:w-40 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-gray-900 z-10">
                      <img 
                        src={ensurePosterUrl(featured.poster_url)} 
                        alt={featured.title} 
                        className="w-full h-auto object-cover" 
                      />
                    </div>
                    
                    {/* Movie details */}
                    <div className="flex-grow space-y-4 z-10">
                      <div className="space-y-2">
                        <span className="inline-flex items-center space-x-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          <Award className="h-3.5 w-3.5 animate-pulse" />
                          <span>Movie of the Week</span>
                        </span>
                        
                        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
                          {featured.title}
                        </h2>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs font-light text-gray-400">
                        <span>{featured.release_date ? featured.release_date.split('-')[0] : 'N/A'}</span>
                        <span className="h-3 w-[1px] bg-gray-800" />
                        <span className="truncate max-w-[150px]">{featured.genres ? (Array.isArray(featured.genres) ? featured.genres[0] : featured.genres.split(',')[0]) : 'Drama'}</span>
                        {featured.trg_rating !== null && featured.trg_rating !== undefined && (
                          <>
                            <span className="h-3 w-[1px] bg-gray-800" />
                            <span className="flex items-center space-x-1 text-amber-400 font-bold">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span>TRG {parseFloat(featured.trg_rating).toFixed(1)}</span>
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">The Verdict</span>
                        <p className="text-gray-300 font-serif italic text-sm sm:text-base leading-relaxed line-clamp-3">
                          "{featured.short_verdict || 'An absolute cinematic masterpiece.'}"
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <Link 
                          to={featured.tmdb_id ? `/movie/ext_${featured.tmdb_id}` : `/movie/${featured.id}`}
                          className="inline-flex items-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-lg text-xs cursor-pointer"
                        >
                          Read Full Verdict
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamically ordered homepage sections */}
            {sectionsOrder.map(sec => renderSection(sec))}

            {/* Curated Collections list display */}
            {collections.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
                <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide flex items-center space-x-2">
                  <FolderHeart className="h-5 w-5 text-amber-500" />
                  <span>Curated Movie Collections</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {collections.map((col) => (
                    <Link 
                      key={col.id}
                      to={`/collection/${col.id}`}
                      className="glass-panel border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/20 transition-all flex flex-col justify-between group shadow-xl relative"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={col.backdrop} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.55]" 
                          alt="" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      </div>
                      <div className="p-5 space-y-2">
                        <h4 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">{col.name}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{col.description}</p>
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider font-mono">
                          {col.movieIds ? col.movieIds.length : 0} Cinematic Pieces
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* TRG TOP 10 MOVIES OF ALL TIME SECTION */}
            {top10Rankings.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
                <div className="border-b border-gray-900 pb-3 flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <span>TRG Top 10 Movies Of All Time</span>
                  </h2>
                  <span className="text-xs text-amber-500 font-mono tracking-widest uppercase">Purely Curated</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {top10Rankings.slice(0, 10).map((movie, index) => {
                    const r = index + 1;
                    return (
                      <Link 
                        key={r}
                        to={movie.tmdb_id ? `/movie/ext_${movie.tmdb_id}` : '#'}
                        className="glass-panel border border-white/5 rounded-3xl p-4 flex flex-col justify-between hover:border-amber-500/20 hover:bg-white/[0.01] transition-all group relative text-left"
                      >
                        <div className="absolute top-3 left-3 h-7 w-7 bg-amber-500 text-black rounded-full flex items-center justify-center font-black text-xs z-10 shadow-lg">
                          #{r}
                        </div>

                        <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border border-white/5 bg-gray-900">
                          <img
                            src={movie.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500"}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="mt-3 space-y-1">
                          <h4 className="font-bold text-gray-200 text-xs truncate group-hover:text-white">{movie.title}</h4>
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                            <span>Score: <strong className="text-amber-400 font-bold">{movie.rating ? movie.rating.toFixed(1) : '9.0'}</strong></span>
                            <span className="truncate max-w-[80px]" title={movie.verdict}>{movie.verdict || 'An absolute classic'}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ABOUT THE REVIEW GUY SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left pt-6">
              <div className="glass-panel border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-64 w-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
                
                {/* Profile Brand */}
                <div className="h-16 w-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/15 flex-shrink-0">
                  <span className="font-serif font-black text-black text-xl">TRG</span>
                </div>
                
                {/* Profile info */}
                <div className="flex-grow space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">
                      About The Review Guy
                    </h3>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Movie Reviewer', 'Film Analyst', 'Tech Creator', 'Engineering Student', 'Space-Tech Enthusiast'].map(badge => (
                        <span key={badge} className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-400 font-light text-xs sm:text-sm leading-relaxed max-w-3xl">
                    The Review Guy is a movie analysis and review platform focused on community opinions, detailed verdicts, rankings, recommendations, and film discovery. Explore curated lists, cast votes on community battles, and join the discourse on cinema's greatest masterworks.
                  </p>

                  {/* Social Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a 
                      href="https://youtube.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600/15 hover:bg-red-600 border border-red-500/25 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>YouTube Channel</span>
                    </a>
                    
                    <a 
                      href="https://linkedin.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600/15 hover:bg-blue-600 border border-blue-500/25 text-blue-400 hover:text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>LinkedIn Profile</span>
                    </a>

                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gray-800/20 hover:bg-gray-800 border border-gray-700/30 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                    >
                      <Code className="h-3.5 w-3.5" />
                      <span>GitHub Codebase</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </CinematicBackground>
  );
}
