import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiService, cleanTvId, ensurePosterUrl, ensureBackdropUrl } from '../services/api';
import TvCarousel from '../components/TvCarousel';
import TvCard from '../components/TvCard';
import { 
  Award, Star, FolderHeart, Eye, Vote, Check,
  Play, Globe, Code, Info, AlertTriangle, ArrowRight, X, Trophy, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import CinematicBackground from '../components/CinematicBackground';

export default function TVHome() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get('q');

  // TV Content states
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [airingToday, setAiringToday] = useState([]);
  const [onTheAir, setOnTheAir] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [sectionsOrder, setSectionsOrder] = useState([]);
  
  // Announcements
  const [announcements, setAnnouncements] = useState([]);

  // Search Results state
  const [searchResults, setSearchResults] = useState({ local: [], tmdb: [] });
  const [searching, setSearching] = useState(false);

  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const beamRotate = useMotionValue(0);
  const smoothBeamRotate = useSpring(beamRotate, { damping: 45, stiffness: 50, mass: 1.5 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      const heroEl = document.getElementById('tv-hero');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Lens position inside the 128px container at top-right:
        const lx = rect.width - 143;
        const ly = 100;

        const dx = mx - lx;
        const dy = my - ly;

        // Calculate absolute angle in screen-to-CSS coords:
        const rad = Math.atan2(dx, -dy);
        let targetAngle = rad * (180 / Math.PI);
        if (targetAngle < 0) targetAngle += 360;

        // Base angle of conic-gradient center is 228deg
        let rotation = targetAngle - 228;

        if (rotation > 180) rotation -= 360;
        if (rotation < -180) rotation += 360;

        beamRotate.set(rotation);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [prefersReducedMotion, beamRotate]);

  // Generate 8 dust particles drifting in the projector beam path (top-right to bottom-left)
  const tvDustParticles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1.2, // 1.2px to 3.2px
      right: Math.random() * 40 + 2, // concentrated closer to top-right corner
      top: Math.random() * 40 + 2,   // concentrated closer to top edge
      duration: Math.random() * 8 + 8,
      delay: Math.random() * -16,
      xOffset: Math.random() * -150 - 150, // drift leftwards
      yOffset: Math.random() * 150 + 150,  // drift downwards
    }));
  }, []);

  const loadTVHomeData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch TV sections layout config
      const secRes = await apiService.getTvHomepageSections().catch(() => []);
      setSectionsOrder(secRes);

      // 2. Fetch all raw feeds
      const [
        featuredRes, trendRes, popRes, topRes, todayRes, airRes,
        annRes, allTvRes
      ] = await Promise.all([
        apiService.getFeaturedTvShow().catch(() => null),
        apiService.getTvTrending().catch(() => []),
        apiService.getTvPopular().catch(() => []),
        apiService.getTvTopRated().catch(() => []),
        apiService.getTvAiringToday().catch(() => []),
        apiService.getTvOnTheAir().catch(() => []),
        apiService.getAnnouncements().catch(() => []),
        apiService.getAllTvShows().catch(() => [])
      ]);

      setFeatured(featuredRes);
      setAnnouncements(annRes || []);

      // Filter TV Recommendations from LocalStorage mapping
      const tvRecommends = JSON.parse(localStorage.getItem('trg_tv_recommends')) || [1396, 66732];
      const recSet = new Set(tvRecommends.map(id => cleanTvId(id)));
      const trgPicksTv = (allTvRes || []).filter(s => recSet.has(cleanTvId(s.tmdb_id || s.id)));

      // Dictionary of raw feeds
      const rawMap = {
        trending: trendRes || [],
        popular: popRes || [],
        topRated: topRes || [],
        airingToday: todayRes || [],
        onTheAir: airRes || [],
        trgPicks: trgPicksTv || []
      };

      // Helper to process section (exclusions and pins)
      const processSection = async (sectionId, baseList) => {
        let list = [...(baseList || [])];
        const sectionConfig = (secRes || []).find(s => s.id === sectionId);
        if (!sectionConfig) return list;
        
        // 1. Apply exclusions
        if (sectionConfig.exclusions && sectionConfig.exclusions.length > 0) {
          const exclSet = new Set(sectionConfig.exclusions.map(id => cleanTvId(id)));
          list = list.filter(s => !exclSet.has(cleanTvId(s.tmdb_id || s.id)));
        }
        
        // 2. Apply pins
        if (sectionConfig.pins && sectionConfig.pins.length > 0) {
          const pinsList = (await Promise.all(
            sectionConfig.pins.map(async (pinId) => {
              const cleanPinId = cleanTvId(pinId);
              let found = list.find(s => cleanTvId(s.tmdb_id || s.id) === cleanPinId);
              if (found) return found;
              found = (allTvRes || []).find(s => cleanTvId(s.tmdb_id || s.id) === cleanPinId);
              if (found) return found;
              try {
                const tvDetails = await apiService.getTvShowDetails(`ext_${cleanPinId}`);
                return tvDetails;
              } catch (e) {
                return null;
              }
            })
          )).filter(Boolean);
          
          const pinnedSet = new Set(pinsList.map(s => cleanTvId(s.tmdb_id || s.id)));
          list = [...pinsList, ...list.filter(s => !pinnedSet.has(cleanTvId(s.tmdb_id || s.id)))];
        }
        
        return list;
      };

      // Process all active sections
      const processedLists = {};
      for (const key of Object.keys(rawMap)) {
        processedLists[key] = await processSection(key, rawMap[key]);
      }

      setTrending(processedLists.trending);
      setPopular(processedLists.popular);
      setTopRated(processedLists.topRated);
      setAiringToday(processedLists.airingToday);
      setOnTheAir(processedLists.onTheAir);
      setRecommended(processedLists.trgPicks);

    } catch (e) {
      console.error("Failed to load TV home data:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderTvSection = (sec) => {
    if (!sec.enabled) return null;

    switch (sec.id) {
      case 'announcements':
        const banners = announcements.filter(a => a.bannerMode);
        if (banners.length === 0) return null;
        return (
          <div key={sec.id} className="w-full border-y border-white/5 bg-white/[0.01] backdrop-blur-md py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
              {banners.map((ann) => (
                <div key={ann.id} className="flex items-center space-x-3 p-4 rounded-2xl border bg-slate-900/40 border-white/5 text-gray-300 text-left backdrop-blur-md">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    SYSTEM
                  </span>
                  <p className="text-xs font-semibold leading-relaxed font-sans">{ann.title}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'trending':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <TvCarousel title="Trending Now" shows={trending} showStats={false} />
          </div>
        );

      case 'popular':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <TvCarousel title="Popular TV Shows" shows={popular} showStats={false} />
          </div>
        );

      case 'topRated':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <TvCarousel title="Top Rated By Community" shows={topRated} showStats={true} />
          </div>
        );

      case 'airingToday':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <TvCarousel title="Airing Today" shows={airingToday} showStats={false} />
          </div>
        );

      case 'onTheAir':
        return (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <TvCarousel title="Currently Airing" shows={onTheAir} showStats={false} />
          </div>
        );

      case 'trgPicks':
        return recommended.length > 0 ? (
          <div key={sec.id} className="max-w-7xl mx-auto w-full">
            <TvCarousel title="The Review Guy Recommends" shows={recommended} showStats={true} />
          </div>
        ) : null;

      default:
        return null;
    }
  };

  const executeSearch = async (query) => {
    try {
      setSearching(true);
      const results = await apiService.searchTvShows(query);
      setSearchResults(results);
    } catch (e) {
      console.error("Failed to search TV shows:", e);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (q) {
      executeSearch(q);
    } else {
      loadTVHomeData();
    }
  }, [q]);

  const handleScrollToContent = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (q) {
    // Search Results Mode
    return (
      <div className="w-full min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10 text-left">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white tracking-wide">
              Search Results for <span className="text-amber-500 font-serif italic">"{q}"</span>
            </h1>
            <p className="text-xs text-gray-400 font-light mt-1">
              TV Show search results from local curation and TMDB
            </p>
          </div>

          {searching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map(card => (
                <div key={card} className="w-full aspect-[2/3] bg-gray-950/80 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {searchResults.local && searchResults.local.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono">
                    In Local Database ({searchResults.local.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {searchResults.local.map(show => (
                      <TvCard key={show.tmdb_id || show.id} show={show} showStats={true} />
                    ))}
                  </div>
                </div>
              )}

              {searchResults.tmdb && searchResults.tmdb.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 font-mono">
                    External Results ({searchResults.tmdb.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {searchResults.tmdb.map(show => (
                      <TvCard key={show.tmdb_id || show.id} show={show} showStats={false} />
                    ))}
                  </div>
                </div>
              )}

              {(!searchResults.local || searchResults.local.length === 0) &&
               (!searchResults.tmdb || searchResults.tmdb.length === 0) && (
                <div className="text-center py-20 glass-panel rounded-3xl border border-white/5 space-y-3">
                  <p className="text-gray-400 text-sm">No TV shows found matching "{q}".</p>
                  <Link to="/tv" className="inline-flex bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-6 py-2 rounded-full transition-all">
                    Return to TV Home
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard TV Home Mode
  return (
    <CinematicBackground className="w-full min-h-screen text-white pb-16 animate-fade-in">
      
      {/* TV Cinematic Hero Section (Full Viewport Height) */}
      <div id="tv-hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Background Backdrop - Pure Black */}
        <div className="absolute inset-0 z-0 w-full h-full bg-black" />

        {/* Vintage 1950s Cinema Projector Silhouette (Facing Left - Repositioned to Top-Right Corner) */}
        <div className="absolute right-8 top-8 z-20 select-none pointer-events-none opacity-85 text-gray-800 transition-opacity">
          <svg viewBox="0 0 100 100" className="w-32 h-32 fill-current">
            {/* Left film reel spool */}
            <circle cx="36" cy="24" r="16" stroke="#1f2937" strokeWidth="1.5" fill="#030712" />
            <circle cx="36" cy="24" r="4" fill="#4b5563" />
            <line x1="36" y1="8" x2="36" y2="40" stroke="#4b5563" strokeWidth="1.5" />
            <line x1="20" y1="24" x2="52" y2="24" stroke="#4b5563" strokeWidth="1.5" />
            <line x1="24.7" y1="12.7" x2="47.3" y2="35.3" stroke="#4b5563" strokeWidth="1.2" />
            <line x1="24.7" y1="35.3" x2="47.3" y2="12.7" stroke="#4b5563" strokeWidth="1.2" />

            {/* Right film reel spool */}
            <circle cx="68" cy="20" r="18" stroke="#1f2937" strokeWidth="1.5" fill="#030712" />
            <circle cx="68" cy="20" r="4" fill="#4b5563" />
            <line x1="68" y1="2" x2="68" y2="38" stroke="#4b5563" strokeWidth="1.5" />
            <line x1="50" y1="20" x2="86" y2="20" stroke="#4b5563" strokeWidth="1.5" />
            <line x1="55.3" y1="7.3" x2="80.7" y2="32.7" stroke="#4b5563" strokeWidth="1.2" />
            <line x1="55.3" y1="32.7" x2="80.7" y2="7.3" stroke="#4b5563" strokeWidth="1.2" />

            {/* Projector central body */}
            <rect x="30" y="44" width="44" height="28" rx="2" fill="#111827" stroke="#1f2937" strokeWidth="1.5" />
            
            {/* Control knobs and panels */}
            <circle cx="38" cy="52" r="2.5" fill="#f5c542" />
            <circle cx="46" cy="52" r="2" fill="#4b5563" />
            <circle cx="53" cy="52" r="2" fill="#4b5563" />
            <rect x="38" y="60" width="10" height="3" rx="0.5" fill="#1f2937" />
            <rect x="52" y="60" width="10" height="3" rx="0.5" fill="#1f2937" />

            {/* Heavy tripod mounting stand base */}
            <path d="M48 72 L44 88 L58 88 L54 72 Z" fill="#111827" stroke="#1f2937" strokeWidth="1.5" />
            <circle cx="51" cy="74" r="3" fill="#4b5563" />
            <rect x="36" y="88" width="30" height="2.5" rx="0.5" fill="#1f2937" />

            {/* Projector lens projecting to the left */}
            <path d="M30 51 L13 45 L13 61 Z" fill="#1f2937" />
            {/* Glowing active projector lens core */}
            <ellipse cx="13" cy="53" rx="1.5" ry="7" fill="#22d3ee" className="animate-pulse" />
          </svg>
        </div>

        {/* TV Projector Beam Cone Wrapper (Interactive Mouse Follow) */}
        <motion.div
          className="absolute top-0 right-0 w-[120%] h-[120%] pointer-events-none origin-[calc(100%-143px)_100px] z-10"
          style={{
            rotate: smoothBeamRotate,
            willChange: 'transform'
          }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none origin-[calc(100%-143px)_100px]"
            style={{
              background: 'conic-gradient(from 205deg at calc(100% - 143px) 100px, transparent 0deg, rgba(255, 255, 255, 0.32) 12deg, rgba(245, 197, 66, 0.25) 22deg, rgba(255, 255, 255, 0.32) 34deg, transparent 46deg)',
              filter: 'blur(45px)',
            }}
            animate={prefersReducedMotion ? {} : {
              rotate: [-0.6, 0.6, -0.3, 0.5, -0.6],
              opacity: [0.9, 0.95, 0.3, 0.95, 0.9, 0.95, 0.88, 0.92, 0.9]
            }}
            transition={{
              rotate: { duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
              opacity: { duration: 3.5, repeat: Infinity, ease: 'linear' }
            }}
          />
        </motion.div>

        {/* Localized Film Grain Overlay inside TV Hero */}
        <div className="absolute inset-0 film-grain opacity-[0.25] pointer-events-none z-10" />

        {/* TV Projector Dust Particles (Brighter and more visible spottings) */}
        {!prefersReducedMotion && tvDustParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none bg-white/30"
            style={{
              width: p.size,
              height: p.size,
              right: `${p.right}%`,
              top: `${p.top}%`,
              filter: 'blur(0.5px)',
              zIndex: 15,
            }}
            animate={{
              x: [0, p.xOffset],
              y: [0, p.yOffset],
              opacity: [0, 0.75, 0.75, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Content text */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-left z-20 space-y-4 sm:space-y-6">
          <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Award className="h-3.5 w-3.5" />
            <span>TV Shows Platform</span>
          </span>

          <div className="space-y-2 max-w-2xl">
            <h1 className="text-4xl sm:text-6xl font-serif font-black leading-tight text-white tracking-wide drop-shadow-lg">
              {featured?.title || "Curated TV Verdicts"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed line-clamp-3 drop-shadow-md">
              {featured?.overview || "Explore detailed breakdowns, season records, official TRG ratings, and watch logs for premium series and dramas."}
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            {featured ? (
              <Link
                to={`/tv/ext_${featured.tmdb_id}`}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 rounded-xl shadow-lg transition-all text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-black" />
                <span>Read Full Verdict</span>
              </Link>
            ) : null}
            <button
              onClick={handleScrollToContent}
              className="px-6 py-3 border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white font-bold rounded-xl transition-all text-xs cursor-pointer flex items-center space-x-1"
            >
              <Info className="h-3.5 w-3.5" />
              <span>Explore Shows</span>
            </button>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            onClick={handleScrollToContent}
            className="cursor-pointer text-gray-400 hover:text-white transition-colors p-2"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </div>
      </div>

      {/* Main Lists Container */}
      <div ref={contentRef} className="w-full py-12 space-y-12">
        {loading ? (
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
            {/* Announcements Banners */}
            {announcements.filter(a => a.bannerMode).length > 0 && (
              <div className="w-full border-y border-white/5 bg-white/[0.01] backdrop-blur-md py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
                  {announcements.filter(a => a.bannerMode).map((ann) => (
                    <div key={ann.id} className="flex items-center space-x-3 p-4 rounded-2xl border bg-slate-900/40 border-white/5 text-gray-300 text-left backdrop-blur-md">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                        SYSTEM
                      </span>
                      <p className="text-xs font-semibold leading-relaxed font-sans">{ann.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spotlight Banner: TV Show of the Week */}
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
                    
                    {/* TV details */}
                    <div className="flex-grow space-y-4 z-10">
                      <div className="space-y-2">
                        <span className="inline-flex items-center space-x-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          <Award className="h-3.5 w-3.5 animate-pulse" />
                          <span>TV Show of the Week</span>
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
                          "{featured.short_verdict || 'An absolute television masterpiece.'}"
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <Link 
                          to={`/tv/ext_${featured.tmdb_id}`}
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

            {/* Dynamic TV lists */}
            {sectionsOrder.map((sec) => renderTvSection(sec))}
          </>
        )}
      </div>
    </CinematicBackground>
  );
}
