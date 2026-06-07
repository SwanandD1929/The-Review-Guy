import React, { useState, useEffect } from 'react';
import { apiService, ensurePosterUrl, ensureBackdropUrl, cleanMovieId, cleanTvId } from '../services/api';
import { 
  Trash2, Edit3, Award, Star, Search, Plus, X, Film, Check, Sparkles,
  BarChart2, Bell, LayoutGrid, Trophy, Swords, FolderHeart, EyeOff, 
  LogOut, ArrowRight, Eye, ShieldAlert, Calendar, ChevronDown, ChevronUp, RotateCcw,
  Tv, Vote
} from 'lucide-react';

export default function Admin() {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(apiService.isModeratorLoggedIn());
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab navigation
  const [activeTab, setActiveTab] = useState('analytics');

  // Unified data lists
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState(null);
  const [featuredMovieId, setFeaturedMovieId] = useState(null);
  const [youtubeReviewUrl, setYoutubeReviewUrl] = useState('');

  // TV Curation states
  const [tvShows, setTvShows] = useState([]);
  const [editingTvShow, setEditingTvShow] = useState(null);
  const [tvSearchQuery, setTvSearchQuery] = useState('');
  const [tvTmdbResults, setTvTmdbResults] = useState([]);
  const [searchingTvTmdb, setSearchingTvTmdb] = useState(false);
  const [featuredTvShowId, setFeaturedTvShowId] = useState(null);
  const [tvRecommends, setTvRecommends] = useState([]);
  const [tvTrending, setTvTrending] = useState([]);
  const [tvNowPlaying, setTvNowPlaying] = useState([]);
  
  // TV Homepage Sections Curation States
  const [tvSections, setTvSections] = useState([]);
  const [expandedTvSection, setExpandedTvSection] = useState(null);
  const [pinTvInputs, setPinTvInputs] = useState({});
  const [tvSectionShowsMap, setTvSectionShowsMap] = useState({
    trending: [],
    popular: [],
    topRated: [],
    airingToday: [],
    onTheAir: [],
    trgPicks: [],
    announcements: []
  });
  
  // TV form states
  const [tvTitle, setTvTitle] = useState('');
  const [tvReleaseDate, setTvReleaseDate] = useState('');
  const [tvGenres, setTvGenres] = useState('');
  const [tvPosterUrl, setTvPosterUrl] = useState('');
  const [tvBackdropUrl, setTvBackdropUrl] = useState('');
  const [tvOverview, setTvOverview] = useState('');
  const [tvTrgRating, setTvTrgRating] = useState('');
  const [tvTrgReview, setTvTrgReview] = useState('');
  const [isTvFeatured, setIsTvFeatured] = useState(false);
  const [tvShortVerdict, setTvShortVerdict] = useState('');
  const [tvYoutubeReviewUrl, setTvYoutubeReviewUrl] = useState('');

  // Review Requests state
  const [reviewRequests, setReviewRequests] = useState({ movies: [], tv: [] });

  // TMDB live search states
  const [tmdbResults, setTmdbResults] = useState([]);
  const [searchingTmdb, setSearchingTmdb] = useState(false);

  // Form states for Movie Edit Overrides
  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [genres, setGenres] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [overview, setOverview] = useState('');
  const [trgRating, setTrgRating] = useState('');
  const [trgReview, setTrgReview] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [shortVerdict, setShortVerdict] = useState('');

  // Premium Features States
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [sections, setSections] = useState([]);
  const [top10, setTop10] = useState([]);
  const [battles, setBattles] = useState([]);
  const [collections, setCollections] = useState([]);
  const [hiddenMovieIds, setHiddenMovieIds] = useState([]);
  const [recommendedMovieIds, setRecommendedMovieIds] = useState([]);
  const [sectionMoviesMap, setSectionMoviesMap] = useState({
    upcoming: [],
    trending: [],
    nowPlaying: [],
    topRated: [],
    mostWatched: [],
    trgPicks: [],
    announcements: [],
    movieBattles: []
  });
  const [expandedSection, setExpandedSection] = useState(null);
  const [pinInputs, setPinInputs] = useState({});

  // Form states for Announcements
  const [annForm, setAnnForm] = useState({ id: '', title: '', priority: 'Normal', expiryDate: '', pinned: true, popupMode: false, bannerMode: true });
  // Form states for Battles
  const [battleForm, setBattleForm] = useState({ id: '', movie1Id: '', movie1Title: '', movie1Poster: '', movie2Id: '', movie2Title: '', movie2Poster: '', startDate: '', endDate: '' });
  // Form states for Collections
  const [colForm, setColForm] = useState({ id: '', name: '', description: '', backdrop: '', movieIdsCsv: '' });

  // Autocomplete helpers
  const [batSearchQuery1, setBatSearchQuery1] = useState('');
  const [batSearchQuery2, setBatSearchQuery2] = useState('');
  const [colSearchQuery, setColSearchQuery] = useState('');
  const [batSuggestions1, setBatSuggestions1] = useState([]);
  const [batSuggestions2, setBatSuggestions2] = useState([]);
  const [colSuggestions, setColSuggestions] = useState([]);

  // Notification states
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadAllAdminData();
    }
  }, [isLoggedIn]);

  // Debounced TMDB search effect for general catalog additions
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setTmdbResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearchingTmdb(true);
        const res = await apiService.searchMovies(searchQuery);
        setTmdbResults(res.tmdb || []);
      } catch (err) {
        console.error("Error searching TMDB in admin panel:", err);
      } finally {
        setSearchingTmdb(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Debounced TMDB search effect for TV shows curation
  useEffect(() => {
    if (tvSearchQuery.trim() === '') {
      setTvTmdbResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        setSearchingTvTmdb(true);
        const res = await apiService.searchTvShows(tvSearchQuery);
        setTvTmdbResults(res.tmdb || []);
      } catch (err) {
        console.error("Error searching TMDB TV in admin panel:", err);
      } finally {
        setSearchingTvTmdb(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [tvSearchQuery]);

  // Battles autocomplete search 1
  useEffect(() => {
    if (batSearchQuery1.trim().length < 2) {
      setBatSuggestions1([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await apiService.searchMovies(batSearchQuery1);
      const combined = [...(results.local || []), ...(results.tmdb || [])];
      // Deduplicate suggestion list
      const seen = new Set();
      const unique = [];
      combined.forEach(m => {
        if (!seen.has(m.tmdb_id)) {
          seen.add(m.tmdb_id);
          unique.push(m);
        }
      });
      setBatSuggestions1(unique.slice(0, 5));
    }, 300);
    return () => clearTimeout(timer);
  }, [batSearchQuery1]);

  // Battles autocomplete search 2
  useEffect(() => {
    if (batSearchQuery2.trim().length < 2) {
      setBatSuggestions2([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await apiService.searchMovies(batSearchQuery2);
      const combined = [...(results.local || []), ...(results.tmdb || [])];
      const seen = new Set();
      const unique = [];
      combined.forEach(m => {
        if (!seen.has(m.tmdb_id)) {
          seen.add(m.tmdb_id);
          unique.push(m);
        }
      });
      setBatSuggestions2(unique.slice(0, 5));
    }, 300);
    return () => clearTimeout(timer);
  }, [batSearchQuery2]);

  const showNotification = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [
        allMovies, featured, analyticsRes, annRes, secRes, topRes, batRes, colRes, hidRes, recRes,
        upRes, trendRes, playRes, topRatedRes, watchRes,
        allTvShows, reqStats, featuredTv,
        tvSecRes, tvTrend, tvPop, tvTop, tvToday, tvAiring
      ] = await Promise.all([
        apiService.getAllMovies(),
        apiService.getFeaturedMovie(),
        apiService.getAdminAnalytics(),
        apiService.getAnnouncements(),
        apiService.getHomepageSections(),
        apiService.getTop10Rankings(),
        apiService.getMovieBattles(),
        apiService.getCollections(),
        apiService.getHiddenMovies(),
        apiService.getRecommendedMovies(),
        apiService.getUpcoming().catch(() => []),
        apiService.getTrending().catch(() => []),
        apiService.getNowPlaying().catch(() => []),
        apiService.getTopRated().catch(() => []),
        apiService.getMostWatched().catch(() => []),
        apiService.getAllTvShows().catch(() => []),
        apiService.getReviewRequestsStats().catch(() => ({ movies: [], tv: [] })),
        apiService.getFeaturedTvShow().catch(() => null),
        apiService.getTvHomepageSections().catch(() => []),
        apiService.getTvTrending().catch(() => []),
        apiService.getTvPopular().catch(() => []),
        apiService.getTvTopRated().catch(() => []),
        apiService.getTvAiringToday().catch(() => []),
        apiService.getTvOnTheAir().catch(() => [])
      ]);
      setMovies(allMovies);
      if (featured) {
        setFeaturedMovieId(featured.tmdb_id || featured.id || featured.local_id);
      }
      setAnalytics(analyticsRes);
      setAnnouncements(annRes);
      setSections(secRes);
      setTop10(topRes);
      setBattles(batRes);
      setCollections(colRes);
      setHiddenMovieIds(hidRes || []);
      setRecommendedMovieIds(recRes || []);

      setTvShows(allTvShows);
      setReviewRequests(reqStats);
      if (featuredTv) {
        setFeaturedTvShowId(featuredTv.tmdb_id || featuredTv.id);
      } else {
        setFeaturedTvShowId(null);
      }
      
      const currentTvRecs = JSON.parse(localStorage.getItem('trg_tv_recommends')) || [];
      setTvRecommends(currentTvRecs);
      setTvTrending(JSON.parse(localStorage.getItem('trg_tv_trending')) || []);
      setTvNowPlaying(JSON.parse(localStorage.getItem('trg_tv_now_playing')) || []);
      setTvSections(tvSecRes);

      const recSet = new Set((recRes || []).map(id => cleanMovieId(id)));
      const trgPicksMovies = allMovies.filter(m => recSet.has(cleanMovieId(m.tmdb_id || m.id)));

      setSectionMoviesMap({
        upcoming: upRes || [],
        trending: trendRes || [],
        nowPlaying: playRes || [],
        topRated: topRatedRes || [],
        mostWatched: watchRes || [],
        trgPicks: trgPicksMovies || [],
        announcements: [],
        movieBattles: []
      });

      const tvRecSet = new Set(currentTvRecs.map(id => cleanTvId(id)));
      const trgPicksTv = allTvShows.filter(s => tvRecSet.has(cleanTvId(s.tmdb_id || s.id)));

      setTvSectionShowsMap({
        trending: tvTrend || [],
        popular: tvPop || [],
        topRated: tvTop || [],
        airingToday: tvToday || [],
        onTheAir: tvAiring || [],
        trgPicks: trgPicksTv || [],
        announcements: []
      });
    } catch (error) {
      console.error('Error loading admin panel data:', error);
      showNotification('Failed to retrieve dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const res = await apiService.loginModerator(usernameInput, passwordInput);
    if (res.success) {
      setIsLoggedIn(true);
      setLoginError('');
      showNotification('Access authorized. Welcome, Moderator.', 'success');
    } else {
      setLoginError(res.error);
    }
  };

  const handleLogoutClick = async () => {
    await apiService.logoutModerator();
    setIsLoggedIn(false);
    showNotification('Logged out successfully', 'success');
  };

  // Movie toggle functions (Hidden, Recommended)
  const handleToggleHidden = async (movieId) => {
    try {
      const updated = await apiService.toggleHiddenMovie(movieId);
      setHiddenMovieIds(updated);
      showNotification('Movie visibility status updated', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to update visibility', 'error');
    }
  };

  const handleToggleRecommend = async (movieId) => {
    try {
      const updated = await apiService.toggleRecommendedMovie(movieId);
      setRecommendedMovieIds(updated);
      showNotification('Movie recommendation status updated', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to update recommendation', 'error');
    }
  };

  // Catalog edit overrides handlers
  const handleEditClick = (movie) => {
    setEditingMovie(movie);
    setTitle(movie.title || '');
    setReleaseDate(movie.release_date || '');
    setGenres(movie.genres || '');
    setPosterUrl(movie.poster_url || '');
    setBackdropUrl(movie.backdrop_url || '');
    setOverview(movie.overview || '');
    setTrgRating(movie.trg_rating !== null && movie.trg_rating !== undefined ? movie.trg_rating : '');
    setTrgReview(movie.trg_review || '');
    setYoutubeReviewUrl(movie.youtube_review_url || '');
    
    const movieIdentifier = movie.tmdb_id || movie.id || movie.local_id;
    const isThisFeatured = featuredMovieId === movieIdentifier;
    setIsFeatured(isThisFeatured);
    setShortVerdict('');
    
    if (isThisFeatured) {
      apiService.getFeaturedMovie().then(featured => {
        if (featured) {
          setShortVerdict(featured.short_verdict || '');
        }
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingMovie(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const tmdbId = editingMovie.tmdb_id || (editingMovie.local_id ? movies.find(m => m.id === editingMovie.local_id || m.local_id === editingMovie.local_id)?.tmdb_id : null);
    
    if (!tmdbId || isNaN(parseInt(tmdbId, 10))) {
      showNotification('Error: The movie must have a valid TMDB ID to save overrides.', 'error');
      return;
    }
    if (!title || title.trim() === '') {
      showNotification('Error: Movie title is required.', 'error');
      return;
    }
    if (trgRating !== '' && (parseFloat(trgRating) < 1 || parseFloat(trgRating) > 10 || isNaN(parseFloat(trgRating)))) {
      showNotification('Error: TRG Score must be a number between 1.0 and 10.0.', 'error');
      return;
    }
    if (isFeatured && (!shortVerdict || shortVerdict.trim() === '')) {
      showNotification('Error: Short verdict is required to feature this movie.', 'error');
      return;
    }

    const id = editingMovie.tmdb_id || editingMovie.id || editingMovie.local_id;
    
    try {
      await apiService.updateMovieMetadata(id, {
        title,
        release_date: releaseDate,
        genres,
        poster_url: posterUrl,
        backdrop_url: backdropUrl,
        overview,
        tmdb_id: tmdbId,
        youtube_review_url: youtubeReviewUrl,
        language: editingMovie.language || 'en'
      });

      const ratingVal = trgRating === '' ? null : parseFloat(trgRating);
      await apiService.saveTrgStats(id, ratingVal, trgReview);

      if (isFeatured) {
        await apiService.setFeaturedMovie(id, shortVerdict || `TRG Rating: ${ratingVal || 'Pending'}`);
      } else if (featuredMovieId === id) {
        await apiService.removeFeaturedMovie();
      }

      // Verify post-save details
      const verifiedDetails = await apiService.getMovieDetails(`ext_${tmdbId}`);
      if (!verifiedDetails) {
        throw new Error(`Could not resolve movie detail for ext_${tmdbId} post-save.`);
      }

      showNotification('Movie metadata overrides saved and verified!', 'success');
      setEditingMovie(null);
      loadAllAdminData();
    } catch (error) {
      showNotification(error.message || 'Failed to update movie', 'error');
    }
  };

  const handleDelete = async (movieIdentifier) => {
    if (!window.confirm('Are you sure you want to delete this movie from the local database?')) return;
    try {
      await apiService.deleteMovie(movieIdentifier);
      const moderatedTmdbMovies = JSON.parse(localStorage.getItem('trg_moderated_tmdb_movies')) || [];
      const updatedModerated = moderatedTmdbMovies.filter(m => m.tmdb_id !== movieIdentifier);
      localStorage.setItem('trg_moderated_tmdb_movies', JSON.stringify(updatedModerated));

      showNotification('Movie removed from catalog', 'success');
      
      if (featuredMovieId === movieIdentifier) {
        setFeaturedMovieId(null);
        await apiService.removeFeaturedMovie();
      }
      if (editingMovie && (editingMovie.id === movieIdentifier || editingMovie.tmdb_id === movieIdentifier)) {
        setEditingMovie(null);
      }
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to delete movie', 'error');
    }
  };

  // TV Curation toggle functions
  const handleToggleTvRecommend = async (showId) => {
    try {
      const cleanId = cleanTvId(showId);
      let list = JSON.parse(localStorage.getItem('trg_tv_recommends')) || [];
      if (list.includes(cleanId)) {
        list = list.filter(id => id !== cleanId);
      } else {
        list.push(cleanId);
      }
      localStorage.setItem('trg_tv_recommends', JSON.stringify(list));
      setTvRecommends(list);
      showNotification('TV show recommendation status updated', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to update recommendation', 'error');
    }
  };

  const handleToggleTvTrending = async (showId) => {
    try {
      const cleanId = cleanTvId(showId);
      let list = JSON.parse(localStorage.getItem('trg_tv_trending')) || [];
      if (list.includes(cleanId)) {
        list = list.filter(id => id !== cleanId);
      } else {
        list.push(cleanId);
      }
      localStorage.setItem('trg_tv_trending', JSON.stringify(list));
      setTvTrending(list);
      showNotification('TV show trending status updated', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to update trending status', 'error');
    }
  };

  const handleToggleTvNowPlaying = async (showId) => {
    try {
      const cleanId = cleanTvId(showId);
      let list = JSON.parse(localStorage.getItem('trg_tv_now_playing')) || [];
      if (list.includes(cleanId)) {
        list = list.filter(id => id !== cleanId);
      } else {
        list.push(cleanId);
      }
      localStorage.setItem('trg_tv_now_playing', JSON.stringify(list));
      setTvNowPlaying(list);
      showNotification('TV show currently airing status updated', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to update currently airing status', 'error');
    }
  };

  const handleEditTvClick = (show) => {
    setEditingTvShow(show);
    setTvTitle(show.title || show.name || '');
    setTvReleaseDate(show.first_air_date || show.release_date || '');
    setTvGenres(show.genres || '');
    setTvPosterUrl(show.poster_url || '');
    setTvBackdropUrl(show.backdrop_url || '');
    setTvOverview(show.overview || '');
    setTvTrgRating(show.trg_rating !== null && show.trg_rating !== undefined ? show.trg_rating : '');
    setTvTrgReview(show.trg_review || '');
    setTvYoutubeReviewUrl(show.youtube_review_url || '');
    
    const showIdentifier = show.tmdb_id || show.id;
    const isThisFeatured = featuredTvShowId === showIdentifier;
    setIsTvFeatured(isThisFeatured);
    setTvShortVerdict('');
    
    if (isThisFeatured) {
      apiService.getFeaturedTvShow().then(featured => {
        if (featured) {
          setTvShortVerdict(featured.short_verdict || '');
        }
      });
    }
  };

  const handleCancelTvEdit = () => {
    setEditingTvShow(null);
  };

  const handleSaveTv = async (e) => {
    e.preventDefault();
    const tmdbId = editingTvShow.tmdb_id || editingTvShow.id;
    
    if (!tmdbId || isNaN(parseInt(tmdbId, 10))) {
      showNotification('Error: The TV show must have a valid TMDB ID to save overrides.', 'error');
      return;
    }
    if (!tvTitle || tvTitle.trim() === '') {
      showNotification('Error: TV show title is required.', 'error');
      return;
    }
    if (tvTrgRating !== '' && (parseFloat(tvTrgRating) < 1 || parseFloat(tvTrgRating) > 10 || isNaN(parseFloat(tvTrgRating)))) {
      showNotification('Error: TRG Score must be a number between 1.0 and 10.0.', 'error');
      return;
    }
    if (isTvFeatured && (!tvShortVerdict || tvShortVerdict.trim() === '')) {
      showNotification('Error: Short verdict is required to feature this TV show.', 'error');
      return;
    }

    const id = editingTvShow.tmdb_id || editingTvShow.id;
    
    try {
      await apiService.updateTvMetadata(id, {
        title: tvTitle,
        first_air_date: tvReleaseDate,
        genres: tvGenres,
        poster_url: tvPosterUrl,
        backdrop_url: tvBackdropUrl,
        overview: tvOverview,
        tmdb_id: tmdbId,
        youtube_review_url: tvYoutubeReviewUrl,
        language: editingTvShow.language || 'en'
      });

      const ratingVal = tvTrgRating === '' ? null : parseFloat(tvTrgRating);
      await apiService.saveTrgTvStats(id, ratingVal, tvTrgReview);

      if (isTvFeatured) {
        await apiService.setFeaturedTvShow(id, tvShortVerdict || `TRG Rating: ${ratingVal || 'Pending'}`);
      } else if (featuredTvShowId === id) {
        await apiService.removeFeaturedTvShow();
      }

      showNotification('TV show overrides saved successfully!', 'success');
      setEditingTvShow(null);
      loadAllAdminData();
    } catch (error) {
      showNotification(error.message || 'Failed to update TV show', 'error');
    }
  };

  const handleDeleteTv = async (showIdentifier) => {
    if (!window.confirm('Are you sure you want to delete this TV show from the local database?')) return;
    try {
      await apiService.deleteTvShow(showIdentifier);
      
      if (featuredTvShowId === showIdentifier) {
        setFeaturedTvShowId(null);
        await apiService.removeFeaturedTvShow();
      }
      if (editingTvShow && (editingTvShow.id === showIdentifier || editingTvShow.tmdb_id === showIdentifier)) {
        setEditingTvShow(null);
      }
      
      showNotification('TV show removed from local database', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to delete TV show', 'error');
    }
  };

  const handleManageReviewRequest = async (action, mediaType, tmdbId) => {
    try {
      await apiService.manageReviewRequests(action, mediaType, tmdbId);
      showNotification(`Review request successfully updated (${action})`, 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to update review request status', 'error');
    }
  };

  // Section Config Handlers
  const handleSectionToggle = (sectionId, enabled) => {
    const updated = sections.map(s => s.id === sectionId ? { ...s, enabled } : s);
    setSections(updated);
  };

  const handleSectionOrderChange = (sectionId, order) => {
    const updated = sections.map(s => s.id === sectionId ? { ...s, order: parseInt(order) || 0 } : s);
    setSections(updated);
  };

  const handleSectionPinsChange = (sectionId, pinsString) => {
    const pins = pinsString.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const updated = sections.map(s => s.id === sectionId ? { ...s, pins } : s);
    setSections(updated);
  };

  const handleRemoveMovieFromSection = (sectionId, movie) => {
    const movieId = cleanMovieId(movie.tmdb_id || movie.id);
    if (!movieId) return;
    
    const updated = sections.map(s => {
      if (s.id !== sectionId) return s;
      
      // If it is currently pinned, remove it from pins
      let pins = s.pins || [];
      if (pins.includes(movieId)) {
        pins = pins.filter(id => cleanMovieId(id) !== movieId);
      }
      
      // Add to exclusions
      let exclusions = s.exclusions || [];
      if (!exclusions.includes(movieId)) {
        exclusions = [...exclusions, movieId];
      }
      
      return { ...s, pins, exclusions };
    });
    setSections(updated);
  };

  const handleRestoreMovieToSection = (sectionId, movie) => {
    const movieId = cleanMovieId(movie.tmdb_id || movie.id);
    if (!movieId) return;
    
    const updated = sections.map(s => {
      if (s.id !== sectionId) return s;
      
      let exclusions = s.exclusions || [];
      exclusions = exclusions.filter(id => cleanMovieId(id) !== movieId);
      
      return { ...s, exclusions };
    });
    setSections(updated);
  };

  const handlePinMovieToSection = async (sectionId, tmdbIdStr) => {
    if (!tmdbIdStr || !tmdbIdStr.trim()) {
      showNotification("Please enter a TMDB ID", "error");
      return;
    }
    const tmdbId = parseInt(tmdbIdStr.trim(), 10);
    if (isNaN(tmdbId)) {
      showNotification("Invalid TMDB ID", "error");
      return;
    }
    
    try {
      await apiService.getMovieDetails(`ext_${tmdbId}`);
    } catch (err) {
      showNotification("Movie details could not be verified on TMDB", "error");
      return;
    }
    
    const updated = sections.map(s => {
      if (s.id !== sectionId) return s;
      
      let pins = s.pins || [];
      if (!pins.includes(tmdbId)) {
        pins = [...pins, tmdbId];
      }
      
      // Remove from exclusions if it was excluded
      let exclusions = s.exclusions || [];
      exclusions = exclusions.filter(id => cleanMovieId(id) !== tmdbId);
      
      return { ...s, pins, exclusions };
    });
    
    setSections(updated);
    setPinInputs(prev => ({ ...prev, [sectionId]: '' }));
    showNotification("Movie added/pinned to section!", "success");
  };

  const handleSaveSections = async () => {
    try {
      const sorted = [...sections].sort((a, b) => a.order - b.order);
      await apiService.saveHomepageSections(sorted);
      showNotification('Homepage section configurations updated!', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to save section layout', 'error');
    }
  };

  // TV Section Config Handlers
  const handleTvSectionToggle = (sectionId, enabled) => {
    const updated = tvSections.map(s => s.id === sectionId ? { ...s, enabled } : s);
    setTvSections(updated);
  };

  const handleTvSectionOrderChange = (sectionId, order) => {
    const updated = tvSections.map(s => s.id === sectionId ? { ...s, order: parseInt(order) || 0 } : s);
    setTvSections(updated);
  };

  const handleTvSectionPinsChange = (sectionId, pinsString) => {
    const pins = pinsString.split(',').map(p => cleanTvId(p.trim())).filter(Boolean);
    const updated = tvSections.map(s => s.id === sectionId ? { ...s, pins } : s);
    setTvSections(updated);
  };

  const handleRemoveTvFromSection = (sectionId, show) => {
    const cleanId = cleanTvId(show.tmdb_id || show.id);
    if (!cleanId) return;
    const updated = tvSections.map(s => {
      if (s.id !== sectionId) return s;
      const pins = (s.pins || []).filter(p => cleanTvId(p) !== cleanId);
      const exclusions = [...(s.exclusions || [])];
      if (!exclusions.map(cleanTvId).includes(cleanId)) {
        exclusions.push(cleanId);
      }
      return { ...s, pins, exclusions };
    });
    setTvSections(updated);
  };

  const handleRestoreTvToSection = (sectionId, show) => {
    const cleanId = cleanTvId(show.tmdb_id || show.id);
    if (!cleanId) return;
    const updated = tvSections.map(s => {
      if (s.id !== sectionId) return s;
      const exclusions = (s.exclusions || []).filter(e => cleanTvId(e) !== cleanId);
      return { ...s, exclusions };
    });
    setTvSections(updated);
  };

  const handlePinTvToSection = async (sectionId, tmdbIdStr) => {
    const cleanId = cleanTvId(tmdbIdStr);
    if (!cleanId) {
      showNotification("Please enter a valid TV Show TMDB ID", "error");
      return;
    }
    const updated = tvSections.map(s => {
      if (s.id !== sectionId) return s;
      const pins = [...(s.pins || [])];
      if (!pins.map(cleanTvId).includes(cleanId)) {
        pins.push(cleanId);
      }
      const exclusions = (s.exclusions || []).filter(e => cleanTvId(e) !== cleanId);
      return { ...s, pins, exclusions };
    });
    setTvSections(updated);
    setPinTvInputs(prev => ({ ...prev, [sectionId]: '' }));
    showNotification("TV Show added/pinned to section!", "success");
  };

  const handleSaveTvSections = async () => {
    try {
      const sorted = [...tvSections].sort((a, b) => a.order - b.order);
      await apiService.saveTvHomepageSections(sorted);
      showNotification('TV Homepage section configurations updated!', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to save TV section layout', 'error');
    }
  };

  const getActiveTvSectionShows = (secId) => {
    const baseShows = tvSectionShowsMap[secId] || [];
    const secConfig = tvSections.find(s => s.id === secId) || {};
    const pins = secConfig.pins || [];
    const exclusions = secConfig.exclusions || [];
    const exclSet = new Set(exclusions.map(id => cleanTvId(id)));

    // Exclude
    let filtered = baseShows.filter(s => !exclSet.has(cleanTvId(s.tmdb_id || s.id)));

    // Prepend pins
    if (pins.length > 0) {
      const pinShows = pins.map(pinId => {
        const cleanPinId = cleanTvId(pinId);
        let found = filtered.find(s => cleanTvId(s.tmdb_id || s.id) === cleanPinId);
        if (found) return found;
        found = tvShows.find(s => cleanTvId(s.tmdb_id || s.id) === cleanPinId);
        if (found) return found;
        return null;
      }).filter(Boolean);

      const pinnedSet = new Set(pinShows.map(s => cleanTvId(s.tmdb_id || s.id)));
      filtered = [...pinShows, ...filtered.filter(s => !pinnedSet.has(cleanTvId(s.tmdb_id || s.id)))];
    }
    return filtered;
  };

  const getExcludedTvSectionShows = (secId) => {
    const baseShows = tvSectionShowsMap[secId] || [];
    const secConfig = tvSections.find(s => s.id === secId) || {};
    const exclusions = secConfig.exclusions || [];
    const exclSet = new Set(exclusions.map(id => cleanTvId(id)));
    
    // Find all database shows or standard shows that match exclusions
    const excludedShows = [];
    const seen = new Set();
    
    baseShows.forEach(s => {
      const id = cleanTvId(s.tmdb_id || s.id);
      if (exclSet.has(id) && !seen.has(id)) {
        seen.add(id);
        excludedShows.push(s);
      }
    });

    tvShows.forEach(s => {
      const id = cleanTvId(s.tmdb_id || s.id);
      if (exclSet.has(id) && !seen.has(id)) {
        seen.add(id);
        excludedShows.push(s);
      }
    });

    return excludedShows;
  };

  // Announcement CRUD Handlers
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await apiService.saveAnnouncement(annForm);
      showNotification(annForm.id ? 'Announcement updated' : 'Announcement created', 'success');
      setAnnForm({ id: '', title: '', priority: 'Normal', expiryDate: '', pinned: true, popupMode: false, bannerMode: true });
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to save announcement', 'error');
    }
  };

  const handleEditAnnouncement = (ann) => {
    setAnnForm(ann);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await apiService.deleteAnnouncement(id);
      showNotification('Announcement deleted', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to delete announcement', 'error');
    }
  };

  // Movie Battles CRUD Handlers
  const handleSaveBattle = async (e) => {
    e.preventDefault();
    if (!battleForm.movie1Id || !battleForm.movie2Id) {
      showNotification('Error: Please select two valid movies using suggestions', 'error');
      return;
    }
    try {
      const battleObj = {
        id: battleForm.id || '',
        movie1: {
          tmdb_id: parseInt(battleForm.movie1Id),
          title: battleForm.movie1Title,
          poster_url: battleForm.movie1Poster
        },
        movie2: {
          tmdb_id: parseInt(battleForm.movie2Id),
          title: battleForm.movie2Title,
          poster_url: battleForm.movie2Poster
        },
        startDate: battleForm.startDate,
        endDate: battleForm.endDate,
        votes1: battleForm.id ? (battles.find(b => b.id === battleForm.id)?.votes1 || []) : [],
        votes2: battleForm.id ? (battles.find(b => b.id === battleForm.id)?.votes2 || []) : []
      };

      await apiService.saveMovieBattle(battleObj);
      showNotification(battleForm.id ? 'Movie battle updated' : 'Movie battle created', 'success');
      setBattleForm({ id: '', movie1Id: '', movie1Title: '', movie1Poster: '', movie2Id: '', movie2Title: '', movie2Poster: '', startDate: '', endDate: '' });
      setBatSearchQuery1('');
      setBatSearchQuery2('');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to save movie battle', 'error');
    }
  };

  const handleEditBattle = (b) => {
    setBattleForm({
      id: b.id,
      movie1Id: b.movie1.tmdb_id,
      movie1Title: b.movie1.title,
      movie1Poster: b.movie1.poster_url,
      movie2Id: b.movie2.tmdb_id,
      movie2Title: b.movie2.title,
      movie2Poster: b.movie2.poster_url,
      startDate: b.startDate || '',
      endDate: b.endDate || ''
    });
    setBatSearchQuery1(b.movie1.title);
    setBatSearchQuery2(b.movie2.title);
  };

  const handleDeleteBattle = async (id) => {
    if (!window.confirm('Delete this battle?')) return;
    try {
      await apiService.deleteMovieBattle(id);
      showNotification('Battle removed', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to delete battle', 'error');
    }
  };

  // Curated Collections Handlers
  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!colForm.name || !colForm.movieIdsCsv) {
      showNotification('Error: Collection name and movie IDs are required', 'error');
      return;
    }
    const movieIds = colForm.movieIdsCsv.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    try {
      const collectionObj = {
        id: colForm.id || colForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: colForm.name,
        description: colForm.description,
        backdrop: colForm.backdrop || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600',
        movieIds
      };
      await apiService.saveCollection(collectionObj);
      showNotification(colForm.id ? 'Collection updated' : 'Collection created', 'success');
      setColForm({ id: '', name: '', description: '', backdrop: '', movieIdsCsv: '' });
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to save collection', 'error');
    }
  };

  const handleEditCollection = (col) => {
    setColForm({
      id: col.id,
      name: col.name,
      description: col.description || '',
      backdrop: col.backdrop || '',
      movieIdsCsv: col.movieIds ? col.movieIds.join(', ') : ''
    });
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await apiService.deleteCollection(id);
      showNotification('Collection removed', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to delete collection', 'error');
    }
  };

  // Top 10 Ranking updates
  const handleTop10Change = (index, field, value) => {
    const updated = [...top10];
    if (field === 'tmdb_id') {
      updated[index].tmdb_id = parseInt(value) || 0;
      // Fetch title dynamically if matched locally
      const localMatch = movies.find(m => m.tmdb_id === parseInt(value));
      if (localMatch) {
        updated[index].title = localMatch.title;
      }
    } else if (field === 'rating') {
      updated[index].rating = parseFloat(value) || 0;
    } else if (field === 'verdict') {
      updated[index].verdict = value;
    } else if (field === 'title') {
      updated[index].title = value;
    }
    setTop10(updated);
  };

  const handleSaveTop10 = async () => {
    try {
      await apiService.saveTop10Rankings(top10);
      showNotification('TRG Top 10 rankings saved successfully!', 'success');
      loadAllAdminData();
    } catch (e) {
      showNotification('Failed to save rankings', 'error');
    }
  };

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.genres && (Array.isArray(m.genres) ? m.genres.join(', ') : m.genres).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTvShows = tvShows.filter(s =>
    (s.title || s.name || '').toLowerCase().includes(tvSearchQuery.toLowerCase()) ||
    (s.genres && (Array.isArray(s.genres) ? s.genres.join(', ') : s.genres).toLowerCase().includes(tvSearchQuery.toLowerCase()))
  );

  // Helper to get active and excluded movies for a section
  const getActiveSectionMovies = (secId) => {
    const baseMovies = sectionMoviesMap[secId] || [];
    const secConfig = sections.find(s => s.id === secId) || {};
    const pins = secConfig.pins || [];
    const exclusions = secConfig.exclusions || [];
    
    const exclSet = new Set(exclusions.map(id => cleanMovieId(id)));
    let filtered = baseMovies.filter(m => !exclSet.has(cleanMovieId(m.tmdb_id || m.id)));
    
    // Resolve pins
    const pinnedList = pins.map(pinId => {
      const cleanPinId = cleanMovieId(pinId);
      let found = baseMovies.find(m => cleanMovieId(m.tmdb_id || m.id) === cleanPinId);
      if (found) return found;
      found = movies.find(m => cleanMovieId(m.tmdb_id || m.id) === cleanPinId);
      if (found) return found;
      return { tmdb_id: cleanPinId, title: `Pinned Movie (ID: ${cleanPinId})`, poster_url: null };
    });
    
    const pinnedSet = new Set(pinnedList.map(m => cleanMovieId(m.tmdb_id || m.id)));
    return [...pinnedList, ...filtered.filter(m => !pinnedSet.has(cleanMovieId(m.tmdb_id || m.id)))];
  };

  const getExcludedSectionMovies = (secId) => {
    const baseMovies = sectionMoviesMap[secId] || [];
    const secConfig = sections.find(s => s.id === secId) || {};
    const exclusions = secConfig.exclusions || [];
    if (exclusions.length === 0) return [];
    
    return exclusions.map(exclId => {
      const cleanExclId = cleanMovieId(exclId);
      let found = baseMovies.find(m => cleanMovieId(m.tmdb_id || m.id) === cleanExclId);
      if (found) return found;
      found = movies.find(m => cleanMovieId(m.tmdb_id || m.id) === cleanExclId);
      if (found) return found;
      return { tmdb_id: cleanExclId, title: `Excluded Movie (ID: ${cleanExclId})`, poster_url: null };
    });
  };

  // Authentication Protection Shield View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center px-4 py-24 select-none">
        <div className="glass-card border border-white/5 bg-gradient-to-b from-white/[0.03] to-white/[0.005] rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/5 blur-3xl pointer-events-none rounded-full"></div>
          
          <div className="mx-auto h-14 w-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center shadow-lg">
            <ShieldAlert className="h-7 w-7" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black font-serif tracking-wide text-white">Moderator Authorization</h1>
            <p className="text-xs text-gray-500">Access to this panel is restricted to system reviewers. Credentials required.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
              <input
                type="text"
                required
                placeholder="Moderator Username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none transition-colors"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Key</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500/50 outline-none transition-colors"
              />
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3.5 py-2 rounded-xl text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 text-sm cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Unlock Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080c] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {message && (
        <div className={`fixed top-24 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl backdrop-blur-md border shadow-2xl transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
        }`}>
          <Check className="h-5 w-5" />
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="inline-flex items-center space-x-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                <span>Premium Admin Panel</span>
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent mt-1">
              THE REVIEW GUY ECOSYSTEM
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogoutClick}
              className="flex items-center space-x-2 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 font-bold px-4 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
          {[
            { id: 'analytics', label: 'Analytics Dashboard', icon: <BarChart2 className="h-4 w-4" /> },
            { id: 'movies', label: 'Movie Catalog', icon: <Film className="h-4 w-4" /> },
            { id: 'tvShows', label: 'TV Catalog', icon: <Tv className="h-4 w-4" /> },
            { id: 'sections', label: 'Homepage Sections', icon: <LayoutGrid className="h-4 w-4" /> },
            { id: 'tvSections', label: 'TV Homepage Manager', icon: <LayoutGrid className="h-4 w-4" /> },
            { id: 'announcements', label: 'Announcements', icon: <Bell className="h-4 w-4" /> },
            { id: 'top10', label: 'TRG Top 10', icon: <Trophy className="h-4 w-4" /> },
            { id: 'battles', label: 'Movie Battles', icon: <Swords className="h-4 w-4" /> },
            { id: 'collections', label: 'Collections', icon: <FolderHeart className="h-4 w-4" /> },
            { id: 'reviewRequests', label: 'Review Requests', icon: <Vote className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            <p className="text-sm text-gray-400">Syncing with local storage database...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. TAB: ANALYTICS DASHBOARD */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-8 animate-fadeIn">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Total Movies", value: analytics.totalMovies, sub: "Local Catalog Database", icon: <Film className="h-5 w-5 text-amber-400" />, color: "from-amber-500/10 to-amber-950/20 border-amber-500/15" },
                    { title: "Total User Ratings", value: analytics.totalRatings, sub: "Community Feedbacks", icon: <Star className="h-5 w-5 text-sky-400 fill-sky-400/20" />, color: "from-sky-500/10 to-sky-950/20 border-sky-500/15" },
                    { title: "Written Reviews", value: analytics.totalReviews, sub: "Community Critiques", icon: <Bell className="h-5 w-5 text-purple-400" />, color: "from-purple-500/10 to-purple-950/20 border-purple-500/15" },
                    { title: "Total Views", value: analytics.totalWatchCount, sub: "Accumulated Watch Count", icon: <Eye className="h-5 w-5 text-emerald-400" />, color: "from-emerald-500/10 to-emerald-950/20 border-emerald-500/15" },
                  ].map((card, idx) => (
                    <div key={idx} className={`glass-card bg-gradient-to-br ${card.color} border rounded-3xl p-6 text-left relative overflow-hidden group`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{card.title}</span>
                          <h2 className="text-3xl font-black text-white mt-1.5 tracking-tight font-mono">{card.value}</h2>
                        </div>
                        <div className="p-2 bg-white/5 border border-white/10 rounded-xl group-hover:scale-110 transition-transform">
                          {card.icon}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-4">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Sub Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Metrics Breakdown */}
                  <div className="md:col-span-2 space-y-6">
                    
                    {/* SVG Analytics Chart */}
                    <div className="glass-card border border-white/5 rounded-3xl p-6 text-left">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6">Community Rating Ranges</h3>
                      <div className="h-48 w-full flex items-end justify-between px-4 pb-2 border-b border-white/5">
                        {/* Custom SVG bars showing distribution of ratings */}
                        {(() => {
                          const dist = [0, 0, 0, 0];
                          movies.forEach(m => {
                            const r = m.community_rating || 0;
                            if (r >= 8) dist[3]++;
                            else if (r >= 6) dist[2]++;
                            else if (r >= 4) dist[1]++;
                            else dist[0]++;
                          });
                          const maxVal = Math.max(...dist, 1);
                          const ranges = ["1-4 Score", "5-6 Score", "7-8 Score", "9-10 Score"];
                          const colors = ["bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];
                          return dist.map((count, i) => {
                            const pct = (count / maxVal) * 100;
                            return (
                              <div key={i} className="flex flex-col items-center space-y-2 flex-grow">
                                <div className="text-[10px] font-mono text-gray-400">{count} films</div>
                                <div className="w-12 sm:w-16 rounded-t-lg relative group transition-all duration-300" style={{ height: `${Math.max(pct, 8)}%` }}>
                                  <div className={`absolute inset-0 rounded-t-lg opacity-70 group-hover:opacity-100 transition-opacity ${colors[i]}`} />
                                </div>
                                <div className="text-[10px] font-semibold text-gray-500">{ranges[i]}</div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Curated Highlights list */}
                    <div className="glass-card border border-white/5 rounded-3xl p-6 text-left space-y-4">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Premium Performance Indicators</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: "Most Rated Movie", movie: analytics.mostRatedMovie, action: "total_ratings", suffix: "ratings" },
                          { label: "Highest TRG Rated Movie", movie: analytics.highestTrgRatedMovie, action: "trg_rating", suffix: "/ 10" },
                          { label: "Most Watched Movie", movie: analytics.mostWatchedMovie, action: "watch_count", suffix: "views" },
                          { label: "Most Recommended Movie", movie: analytics.mostRecommendedMovie, action: "recommendation_percentage", suffix: "% approval" },
                        ].map((stat, i) => (
                          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center space-x-3">
                            {stat.movie ? (
                              <>
                                <img src={stat.movie.poster_url} className="w-10 h-14 object-cover rounded-lg border border-white/10 flex-shrink-0" alt="" />
                                <div className="min-w-0 flex-grow">
                                  <span className="text-[10px] text-gray-400 block font-semibold">{stat.label}</span>
                                  <span className="text-xs font-bold text-white block truncate mt-0.5">{stat.movie.title}</span>
                                  <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                                    {stat.movie[stat.action]} {stat.suffix}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-gray-500">No data compiled</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Weekly Features & Battles */}
                  <div className="space-y-6">
                    {/* Featured Movie of the Week display */}
                    <div className="glass-card border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.05] to-black rounded-3xl p-6 text-left space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center space-x-1.5">
                        <Award className="h-4 w-4" />
                        <span>Movie of the Week Spotlight</span>
                      </h3>
                      {analytics.movieOfTheWeek ? (
                        <div className="space-y-3">
                          <img src={ensureBackdropUrl(analytics.movieOfTheWeek.backdrop_url)} className="w-full h-28 object-cover rounded-2xl border border-white/10" alt="" />
                          <div>
                            <h4 className="font-bold text-white text-base">{analytics.movieOfTheWeek.title}</h4>
                            <p className="text-xs text-gray-400 italic mt-1 font-serif">"{analytics.movieOfTheWeek.short_verdict || 'A masterfully curated movie.'}"</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No movie currently pinned in spotlight.</p>
                      )}
                    </div>

                    {/* Movie Battle Spotlight */}
                    <div className="glass-card border border-white/5 rounded-3xl p-6 text-left space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400 flex items-center space-x-1.5">
                        <Swords className="h-4 w-4" />
                        <span>Active Community Battle</span>
                      </h3>
                      {analytics.activeMovieBattle ? (
                        <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                            <span>{analytics.activeMovieBattle.movie1.title}</span>
                            <span className="text-rose-400 font-mono uppercase">VS</span>
                            <span>{analytics.activeMovieBattle.movie2.title}</span>
                          </div>
                          
                          {/* Progress display */}
                          {(() => {
                            const v1 = analytics.activeMovieBattle.votes1.length;
                            const v2 = analytics.activeMovieBattle.votes2.length;
                            const tot = v1 + v2;
                            const p1 = tot > 0 ? Math.round((v1 / tot) * 100) : 50;
                            const p2 = tot > 0 ? 100 - p1 : 50;
                            return (
                              <div className="space-y-1.5">
                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                  <div className="h-full bg-amber-500" style={{ width: `${p1}%` }} />
                                  <div className="h-full bg-sky-500" style={{ width: `${p2}%` }} />
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                                  <span>{p1}% ({v1} votes)</span>
                                  <span>{tot} total votes</span>
                                  <span>{p2}% ({v2} votes)</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No community battles currently active.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TAB: MOVIE CATALOG */}
            {activeTab === 'movies' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                
                {/* Catalog Listing table */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-amber-500/50 transition-colors">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search movie catalog or type query to pull new TMDB titles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-gray-500"
                    />
                  </div>

                  {/* Render Table */}
                  <div className="glass-card border border-white/5 rounded-3xl overflow-hidden text-left">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                            <th className="py-4 px-6">Movie Details</th>
                            <th className="py-4 px-6 text-center">Home Filters</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {filteredMovies.map((movie) => {
                            const id = movie.tmdb_id || movie.id || movie.local_id;
                            const isHidden = hiddenMovieIds.includes(cleanMovieId(id));
                            const isRecommended = recommendedMovieIds.includes(cleanMovieId(id));
                            return (
                              <tr key={id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="py-4 px-6 flex items-center space-x-4">
                                  <img
                                    src={ensurePosterUrl(movie.poster_url)}
                                    alt=""
                                    className="w-10 h-14 object-cover rounded-lg border border-white/10 group-hover:border-amber-500/30 transition-colors flex-shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-gray-200 truncate group-hover:text-white">{movie.title}</h4>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                      {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'} • {movie.genres ? (Array.isArray(movie.genres) ? movie.genres[0] : movie.genres.split(',')[0]) : 'Drama'}
                                    </p>
                                  </div>
                                </td>
                                
                                <td className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                    <button
                                      onClick={() => handleToggleRecommend(id)}
                                      className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                        isRecommended 
                                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                          : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                                      }`}
                                      title="Mark as TRG Recommends"
                                    >
                                      <Star className="h-3 w-3 fill-current" />
                                      <span>Recommend</span>
                                    </button>

                                    <button
                                      onClick={() => handleToggleHidden(id)}
                                      className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                        isHidden 
                                          ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' 
                                          : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                                      }`}
                                      title="Hide from Homepage Carousel rails"
                                    >
                                      <EyeOff className="h-3 w-3" />
                                      <span>{isHidden ? 'Hidden' : 'Hide'}</span>
                                    </button>
                                  </div>
                                </td>

                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => handleEditClick(movie)}
                                      className="p-2 bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 rounded-xl transition-all border border-white/5 cursor-pointer"
                                      title="Edit Overrides"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(id)}
                                      className="p-2 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-xl transition-all border border-white/5 cursor-pointer"
                                      title="Delete Movie"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TMDB Results table */}
                  {searchQuery && tmdbResults.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/5 text-left">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span>TMDB Matches to Moderate ({tmdbResults.length})</span>
                      </h3>
                      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden bg-amber-500/[0.01]">
                        <table className="w-full text-left border-collapse">
                          <tbody className="divide-y divide-white/5 text-sm">
                            {tmdbResults.map(m => (
                              <tr key={m.tmdb_id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="py-4 px-6 flex items-center space-x-4">
                                  <img src={ensurePosterUrl(m.poster_url)} className="w-10 h-14 object-cover rounded-lg border border-white/10" alt="" />
                                  <div>
                                    <h4 className="font-bold text-gray-200">{m.title}</h4>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{m.release_date}</p>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button
                                    onClick={() => handleEditClick(m)}
                                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black rounded-lg border border-amber-500/20 transition-all font-semibold text-xs cursor-pointer"
                                  >
                                    Moderate
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit override Panel */}
                <div className="lg:col-span-1">
                  {!editingMovie ? (
                    <div className="glass-card border border-white/5 rounded-3xl p-8 text-center text-gray-500 space-y-4">
                      <Edit3 className="h-10 w-10 mx-auto text-gray-700 stroke-1" />
                      <div>
                        <h3 className="font-bold text-gray-300">Override Panel</h3>
                        <p className="text-xs text-gray-500 mt-1">Select a movie from the catalog table to override title, poster URLs, set TRG scores and write reviews.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card border border-amber-500/20 bg-gradient-to-b from-white/[0.03] to-white/[0.01] rounded-3xl p-6 space-y-6 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center space-x-3">
                          <img src={ensurePosterUrl(editingMovie.poster_url)} className="w-8 h-12 object-cover rounded border border-white/10" alt="" />
                          <div className="min-w-0 text-left">
                            <h3 className="font-bold text-white text-sm truncate max-w-[150px]">{editingMovie.title}</h3>
                            <p className="text-[11px] text-gray-500">Edit Override Details</p>
                          </div>
                        </div>
                        <button onClick={handleCancelEdit} className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSave} className="space-y-4 text-left">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">Movie Title</label>
                          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400">Release Date</label>
                            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400">Genres</label>
                            <input type="text" placeholder="Action, Sci-Fi..." value={genres} onChange={(e) => setGenres(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">Poster Image URL</label>
                          <input type="text" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">Backdrop Image URL</label>
                          <input type="text" value={backdropUrl} onChange={(e) => setBackdropUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">Overview</label>
                          <textarea rows="3" value={overview} onChange={(e) => setOverview(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none resize-none" />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">YouTube Review URL</label>
                          <input type="text" placeholder="https://youtube.com/watch?v=..." value={youtubeReviewUrl} onChange={(e) => setYoutubeReviewUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                        </div>

                        <div className="border-t border-white/5 my-4"></div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-amber-400">TRG Score (1.0 - 10.0)</label>
                          <input type="number" step="0.1" min="1" max="10" placeholder="e.g. 9.5" value={trgRating} onChange={(e) => setTrgRating(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-amber-500/50 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-amber-400">TRG Written Verdict Review</label>
                          <textarea rows="3" placeholder="Write full moderator review..." value={trgReview} onChange={(e) => setTrgReview(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none resize-none" />
                        </div>

                        <div className="border-t border-white/5 my-4"></div>

                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 bg-white/5 rounded text-amber-500 focus:ring-amber-500" />
                            <label htmlFor="isFeatured" className="text-xs font-bold text-gray-200 flex items-center space-x-1 cursor-pointer">
                              <Award className="h-3.5 w-3.5 text-amber-400" />
                              <span>Feature as "Movie of the Week"</span>
                            </label>
                          </div>
                          {isFeatured && (
                            <div className="space-y-1 animate-fadeIn">
                              <label className="text-[10px] font-semibold text-amber-400">Spotlight Short Verdict</label>
                              <input type="text" required={isFeatured} placeholder="Short verdict sentence..." value={shortVerdict} onChange={(e) => setShortVerdict(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                            </div>
                          )}
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold py-3 rounded-xl transition-all shadow-lg text-sm cursor-pointer">
                          Save Overrides
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. TAB: HOMEPAGE SECTIONS CONFIGURATION */}
            {activeTab === 'sections' && (
              <div className="glass-card border border-white/5 rounded-3xl p-6 text-left max-w-4xl mx-auto space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold text-white">Homepage Layout Configurator</h3>
                  <p className="text-xs text-gray-500 mt-1">Enable or disable homepage section carousels, rearrange display hierarchies, and pin custom orders.</p>
                </div>

                <div className="space-y-4">
                  {sections.map((sec, idx) => {
                    const canManageSection = ['upcoming', 'trending', 'nowPlaying', 'topRated', 'mostWatched', 'trgPicks'].includes(sec.id);
                    return (
                      <div key={sec.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                        {/* Section Header Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3 min-w-[200px]">
                            <input
                              type="checkbox"
                              id={`toggle-${sec.id}`}
                              checked={sec.enabled}
                              onChange={(e) => handleSectionToggle(sec.id, e.target.checked)}
                              className="h-4 w-4 bg-white/5 rounded text-amber-500 focus:ring-amber-500"
                            />
                            <label htmlFor={`toggle-${sec.id}`} className="text-sm font-bold text-gray-200 cursor-pointer">
                              {sec.title}
                            </label>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-gray-500 font-semibold uppercase">Order Rank</span>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={sec.order}
                                onChange={(e) => handleSectionOrderChange(sec.id, e.target.value)}
                                className="w-16 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-center text-xs text-white outline-none"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-gray-500 font-semibold uppercase">Pins (TMDB IDs CSV)</span>
                              <input
                                type="text"
                                placeholder="e.g. 157336, 155"
                                value={sec.pins ? sec.pins.join(', ') : ''}
                                onChange={(e) => handleSectionPinsChange(sec.id, e.target.value)}
                                className="w-48 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                              />
                            </div>

                            {canManageSection && (
                              <button
                                type="button"
                                onClick={() => setExpandedSection(expandedSection === sec.id ? null : sec.id)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all cursor-pointer"
                              >
                                <span>Manage Movies</span>
                                {expandedSection === sec.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Collapsible Movie Exclusions/Pins Panel */}
                        {expandedSection === sec.id && canManageSection && (
                          <div className="mt-2 border-t border-white/5 pt-4 space-y-4 animate-fadeIn">
                            {/* Pin Movie Form */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 max-w-sm relative flex items-center">
                                <span className="absolute left-3.5 text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Pin Movie ID:</span>
                                <input
                                  type="text"
                                  placeholder="e.g. 157336"
                                  value={pinInputs[sec.id] || ''}
                                  onChange={(e) => setPinInputs(prev => ({ ...prev, [sec.id]: e.target.value }))}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-24 pr-4 py-2 text-xs text-white outline-none focus:border-amber-500/30"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handlePinMovieToSection(sec.id, pinInputs[sec.id] || '')}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Pin/Add</span>
                              </button>
                            </div>

                            {/* Movie lists side by side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Active movies list */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>Active Section Movies ({getActiveSectionMovies(sec.id).length})</span>
                                </h4>
                                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                                  {getActiveSectionMovies(sec.id).map(movie => {
                                    const isPinned = (sec.pins || []).includes(cleanMovieId(movie.tmdb_id || movie.id));
                                    return (
                                      <div key={movie.tmdb_id || movie.id || Math.random()} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex items-center space-x-2.5 overflow-hidden">
                                          <img
                                            src={ensurePosterUrl(movie.poster_url)}
                                            alt={movie.title}
                                            className="w-7 h-10 object-cover rounded-md flex-shrink-0"
                                          />
                                          <div className="text-left overflow-hidden">
                                            <p className="text-xs font-bold text-gray-200 truncate max-w-[180px] sm:max-w-[240px]">{movie.title}</p>
                                            <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                                              <span>ID: {movie.tmdb_id || movie.id}</span>
                                              {isPinned && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.2 rounded text-[8px] font-black uppercase">Pinned</span>}
                                            </div>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveMovieFromSection(sec.id, movie)}
                                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                                          title="Remove movie"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                  {getActiveSectionMovies(sec.id).length === 0 && (
                                    <p className="text-xs text-gray-600 italic py-2">No active movies in this section.</p>
                                  )}
                                </div>
                              </div>

                              {/* Excluded movies list */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                                  <EyeOff className="h-3.5 w-3.5 text-rose-400" />
                                  <span>Excluded Movies ({getExcludedSectionMovies(sec.id).length})</span>
                                </h4>
                                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                                  {getExcludedSectionMovies(sec.id).map(movie => (
                                    <div key={movie.tmdb_id || movie.id || Math.random()} className="flex items-center justify-between p-2 rounded-xl bg-rose-500/[0.01] border border-rose-500/5 hover:border-rose-500/10 transition-all">
                                      <div className="flex items-center space-x-2.5 overflow-hidden">
                                        <img
                                          src={ensurePosterUrl(movie.poster_url)}
                                          alt={movie.title}
                                          className="w-7 h-10 object-cover rounded-md flex-shrink-0 opacity-40"
                                        />
                                        <div className="text-left overflow-hidden opacity-50">
                                          <p className="text-xs font-bold text-gray-400 truncate max-w-[180px] sm:max-w-[240px]">{movie.title}</p>
                                          <span className="text-[10px] text-gray-600 block">ID: {movie.tmdb_id || movie.id}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRestoreMovieToSection(sec.id, movie)}
                                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                                        title="Restore movie"
                                      >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                  {getExcludedSectionMovies(sec.id).length === 0 && (
                                    <p className="text-xs text-gray-600 italic py-2">No excluded movies in this section.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveSections}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg text-xs cursor-pointer"
                >
                  Save Section Layout
                </button>
              </div>
            )}

            {/* 3.5. TAB: TV HOMEPAGE SECTIONS CONFIGURATION */}
            {activeTab === 'tvSections' && (
              <div className="glass-card border border-white/5 rounded-3xl p-6 text-left max-w-4xl mx-auto space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold text-white">TV Homepage Layout Configurator</h3>
                  <p className="text-xs text-gray-500 mt-1">Enable or disable TV homepage section carousels, rearrange display hierarchies, and pin custom orders.</p>
                </div>

                <div className="space-y-4">
                  {tvSections.map((sec, idx) => {
                    const canManageSection = ['trending', 'popular', 'topRated', 'airingToday', 'onTheAir', 'trgPicks'].includes(sec.id);
                    return (
                      <div key={sec.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                        {/* Section Header Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3 min-w-[200px]">
                            <input
                              type="checkbox"
                              id={`tv-toggle-${sec.id}`}
                              checked={sec.enabled}
                              onChange={(e) => handleTvSectionToggle(sec.id, e.target.checked)}
                              className="h-4 w-4 bg-white/5 rounded text-amber-500 focus:ring-amber-500"
                            />
                            <label htmlFor={`tv-toggle-${sec.id}`} className="text-sm font-bold text-gray-200 cursor-pointer">
                              {sec.title}
                            </label>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-gray-500 font-semibold uppercase">Order Rank</span>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                value={sec.order}
                                onChange={(e) => handleTvSectionOrderChange(sec.id, e.target.value)}
                                className="w-16 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-center text-xs text-white outline-none"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-gray-500 font-semibold uppercase">Pins (TMDB IDs CSV)</span>
                              <input
                                type="text"
                                placeholder="e.g. 1396, 66732"
                                value={sec.pins ? sec.pins.join(', ') : ''}
                                onChange={(e) => handleTvSectionPinsChange(sec.id, e.target.value)}
                                className="w-48 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                              />
                            </div>

                            {canManageSection && (
                              <button
                                type="button"
                                onClick={() => setExpandedTvSection(expandedTvSection === sec.id ? null : sec.id)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 transition-all cursor-pointer"
                              >
                                <span>Manage TV Shows</span>
                                {expandedTvSection === sec.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Collapsible TV Exclusions/Pins Panel */}
                        {expandedTvSection === sec.id && canManageSection && (
                          <div className="mt-2 border-t border-white/5 pt-4 space-y-4 animate-fadeIn">
                            {/* Pin TV Show Form */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 max-w-sm relative flex items-center">
                                <span className="absolute left-3.5 text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Pin TV Show ID:</span>
                                <input
                                  type="text"
                                  placeholder="e.g. 1396"
                                  value={pinTvInputs[sec.id] || ''}
                                  onChange={(e) => setPinTvInputs(prev => ({ ...prev, [sec.id]: e.target.value }))}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-28 pr-4 py-2 text-xs text-white outline-none focus:border-amber-500/30"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handlePinTvToSection(sec.id, pinTvInputs[sec.id] || '')}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Pin/Add</span>
                              </button>
                            </div>

                            {/* TV lists side by side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Active TV shows list */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>Active Section TV Shows ({getActiveTvSectionShows(sec.id).length})</span>
                                </h4>
                                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                                  {getActiveTvSectionShows(sec.id).map(show => {
                                    const isPinned = (sec.pins || []).includes(cleanTvId(show.tmdb_id || show.id));
                                    return (
                                      <div key={show.tmdb_id || show.id || Math.random()} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex items-center space-x-2.5 overflow-hidden">
                                          <img
                                            src={ensurePosterUrl(show.poster_url)}
                                            alt={show.title}
                                            className="w-7 h-10 object-cover rounded-md flex-shrink-0"
                                          />
                                          <div className="text-left overflow-hidden">
                                            <p className="text-xs font-bold text-gray-200 truncate max-w-[180px] sm:max-w-[240px]">{show.title || show.name}</p>
                                            <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                                              <span>ID: {show.tmdb_id || show.id}</span>
                                              {isPinned && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.2 rounded text-[8px] font-black uppercase">Pinned</span>}
                                            </div>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveTvFromSection(sec.id, show)}
                                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                                          title="Remove TV show"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                  {getActiveTvSectionShows(sec.id).length === 0 && (
                                    <p className="text-xs text-gray-600 italic py-2">No active TV shows in this section.</p>
                                  )}
                                </div>
                              </div>

                              {/* Excluded TV shows list */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                                  <EyeOff className="h-3.5 w-3.5 text-rose-400" />
                                  <span>Excluded TV Shows ({getExcludedTvSectionShows(sec.id).length})</span>
                                </h4>
                                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                                  {getExcludedTvSectionShows(sec.id).map(show => (
                                    <div key={show.tmdb_id || show.id || Math.random()} className="flex items-center justify-between p-2 rounded-xl bg-rose-500/[0.01] border border-rose-500/5 hover:border-rose-500/10 transition-all">
                                      <div className="flex items-center space-x-2.5 overflow-hidden">
                                        <img
                                          src={ensurePosterUrl(show.poster_url)}
                                          alt={show.title}
                                          className="w-7 h-10 object-cover rounded-md flex-shrink-0 opacity-40"
                                        />
                                        <div className="text-left overflow-hidden opacity-50">
                                          <p className="text-xs font-bold text-gray-400 truncate max-w-[180px] sm:max-w-[240px]">{show.title || show.name}</p>
                                          <span className="text-[10px] text-gray-600 block">ID: {show.tmdb_id || show.id}</span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRestoreTvToSection(sec.id, show)}
                                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                                        title="Restore TV show"
                                      >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                  {getExcludedTvSectionShows(sec.id).length === 0 && (
                                    <p className="text-xs text-gray-600 italic py-2">No excluded TV shows in this section.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveTvSections}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg text-xs cursor-pointer"
                >
                  Save TV Section Layout
                </button>
              </div>
            )}

            {/* 4. TAB: ANNOUNCEMENT SYSTEM */}
            {activeTab === 'announcements' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fadeIn">
                {/* Form to create/edit announcements */}
                <div className="lg:col-span-1 glass-card border border-white/5 rounded-3xl p-6 space-y-6 h-fit">
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                    {annForm.id ? 'Edit Announcement' : 'Create Announcement'}
                  </h3>
                  
                  <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400">Announcement Headline Text</label>
                      <textarea
                        rows="3"
                        required
                        placeholder="🚨 TRG Movie Battle #1 is live..."
                        value={annForm.title}
                        onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Priority Level</label>
                        <select
                          value={annForm.priority}
                          onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:border-amber-500/50 outline-none"
                        >
                          <option value="Normal">Normal (Slate)</option>
                          <option value="Important">Important (Amber)</option>
                          <option value="Critical">Critical (Red)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Expiry Date</label>
                        <input
                          type="date"
                          value={annForm.expiryDate}
                          onChange={(e) => setAnnForm({ ...annForm, expiryDate: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500/50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-3 text-xs">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="ann-pin"
                          checked={annForm.pinned}
                          onChange={(e) => setAnnForm({ ...annForm, pinned: e.target.checked })}
                          className="h-4 w-4 bg-white/5 rounded text-amber-500"
                        />
                        <label htmlFor="ann-pin" className="text-gray-300 font-semibold cursor-pointer">Pin to Homepage Feed</label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="ann-banner"
                          checked={annForm.bannerMode}
                          onChange={(e) => setAnnForm({ ...annForm, bannerMode: e.target.checked })}
                          className="h-4 w-4 bg-white/5 rounded text-amber-500"
                        />
                        <label htmlFor="ann-banner" className="text-gray-300 font-semibold cursor-pointer">Homepage Top Slider Banner</label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="ann-popup"
                          checked={annForm.popupMode}
                          onChange={(e) => setAnnForm({ ...annForm, popupMode: e.target.checked })}
                          className="h-4 w-4 bg-white/5 rounded text-amber-500"
                        />
                        <label htmlFor="ann-popup" className="text-gray-300 font-semibold cursor-pointer">Homepage Modal Overlay Popup</label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-grow bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                      >
                        {annForm.id ? 'Update Announcement' : 'Publish Announcement'}
                      </button>
                      {annForm.id && (
                        <button
                          type="button"
                          onClick={() => setAnnForm({ id: '', title: '', priority: 'Normal', expiryDate: '', pinned: true, popupMode: false, bannerMode: true })}
                          className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List of active announcements */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                    <Bell className="h-4 w-4" />
                    <span>System Announcements ({announcements.length})</span>
                  </h3>

                  {announcements.length === 0 ? (
                    <div className="glass-card border border-white/5 rounded-3xl p-12 text-center text-gray-500">
                      <p>No active announcements posted.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((ann) => {
                        const colors = {
                          Critical: "border-rose-500/20 bg-rose-500/[0.02] text-rose-400",
                          Important: "border-amber-500/20 bg-amber-500/[0.02] text-amber-400",
                          Normal: "border-slate-800 bg-slate-900/[0.02] text-slate-400"
                        };
                        return (
                          <div key={ann.id} className={`glass-card border rounded-2xl p-4 flex justify-between items-start gap-4 ${colors[ann.priority] || colors.Normal}`}>
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                  ann.priority === 'Critical' ? 'bg-rose-500/10 border-rose-500/30' :
                                  ann.priority === 'Important' ? 'bg-amber-500/10 border-amber-500/30' :
                                  'bg-white/5 border-white/10 text-gray-400'
                                }`}>
                                  {ann.priority}
                                </span>
                                {ann.expiryDate && (
                                  <span className="text-[10px] text-gray-500 font-mono flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Expires {ann.expiryDate}</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-gray-200 leading-snug">{ann.title}</p>
                              <div className="flex gap-3 text-[10px] text-gray-500 font-mono">
                                <span>Pinned: {ann.pinned ? 'Yes' : 'No'}</span>
                                <span>Banner: {ann.bannerMode ? 'Yes' : 'No'}</span>
                                <span>Popup: {ann.popupMode ? 'Yes' : 'No'}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              <button
                                onClick={() => handleEditAnnouncement(ann)}
                                className="p-1.5 bg-white/5 hover:bg-amber-500/20 rounded-lg text-gray-400 hover:text-amber-400 border border-white/5 cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAnnouncement(ann.id)}
                                className="p-1.5 bg-white/5 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400 border border-white/5 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. TAB: TRG TOP 10 RANKINGS */}
            {activeTab === 'top10' && (
              <div className="glass-card border border-white/5 rounded-3xl p-6 text-left max-w-4xl mx-auto space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold text-white">TRG Top 10 Movies Of All Time</h3>
                  <p className="text-xs text-gray-500 mt-1">Configure rankings, overrides, and verdicts for the custom TRG top 10 movies. Rank order is separate from community ratings.</p>
                </div>

                <div className="space-y-4">
                  {top10.map((ranking, idx) => (
                    <div key={ranking.rank} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-1 flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-sm">{ranking.rank}</span>
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase">TMDB ID</span>
                        <input
                          type="number"
                          value={ranking.tmdb_id}
                          onChange={(e) => handleTop10Change(idx, 'tmdb_id', e.target.value)}
                          placeholder="e.g. 157336"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                        />
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase">Custom Title / Fallback</span>
                        <input
                          type="text"
                          value={ranking.title}
                          onChange={(e) => handleTop10Change(idx, 'title', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                        />
                      </div>

                      <div className="md:col-span-1 space-y-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase">TRG Rating</span>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="10"
                          value={ranking.rating}
                          onChange={(e) => handleTop10Change(idx, 'rating', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-center text-xs text-white outline-none"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase">Quick Verdict Text Hook</span>
                        <input
                          type="text"
                          placeholder="Why is this ranked here?"
                          value={ranking.verdict}
                          onChange={(e) => handleTop10Change(idx, 'verdict', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveTop10}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg text-xs cursor-pointer"
                >
                  Save Top 10 Rankings
                </button>
              </div>
            )}

            {/* 6. TAB: MOVIE BATTLES SYSTEM */}
            {activeTab === 'battles' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fadeIn">
                {/* Create/Edit Battle Form */}
                <div className="lg:col-span-1 glass-card border border-white/5 rounded-3xl p-6 space-y-6 h-fit">
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                    {battleForm.id ? 'Edit Movie Battle' : 'Create Movie Battle'}
                  </h3>

                  <form onSubmit={handleSaveBattle} className="space-y-4">
                    
                    {/* Movie 1 Selector with suggestions */}
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-semibold text-amber-400 block">Movie 1 (Left Option)</label>
                      <input
                        type="text"
                        required
                        placeholder="Search movie title for option 1..."
                        value={batSearchQuery1}
                        onChange={(e) => {
                          setBatSearchQuery1(e.target.value);
                          setBattleForm({ ...battleForm, movie1Title: e.target.value });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                      {batSuggestions1.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-30 bg-gray-950 border border-white/15 rounded-xl mt-1 overflow-hidden shadow-2xl">
                          {batSuggestions1.map(m => (
                            <div
                              key={m.tmdb_id}
                              onClick={() => {
                                setBattleForm({ 
                                  ...battleForm, 
                                  movie1Id: m.tmdb_id.toString(), 
                                  movie1Title: m.title, 
                                  movie1Poster: m.poster_url 
                                });
                                setBatSearchQuery1(m.title);
                                setBatSuggestions1([]);
                              }}
                              className="px-4 py-2 hover:bg-white/5 text-xs text-gray-200 cursor-pointer border-b border-white/5 flex items-center space-x-2"
                            >
                              <img src={m.poster_url} className="w-6 h-9 object-cover rounded" alt="" />
                              <span>{m.title} ({m.release_date ? m.release_date.split('-')[0] : 'N/A'})</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {battleForm.movie1Id && (
                        <span className="text-[10px] text-emerald-400 font-mono block mt-1">✓ Selected TMDB ID: {battleForm.movie1Id}</span>
                      )}
                    </div>

                    {/* Movie 2 Selector with suggestions */}
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-semibold text-sky-400 block">Movie 2 (Right Option)</label>
                      <input
                        type="text"
                        required
                        placeholder="Search movie title for option 2..."
                        value={batSearchQuery2}
                        onChange={(e) => {
                          setBatSearchQuery2(e.target.value);
                          setBattleForm({ ...battleForm, movie2Title: e.target.value });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                      {batSuggestions2.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-30 bg-gray-950 border border-white/15 rounded-xl mt-1 overflow-hidden shadow-2xl">
                          {batSuggestions2.map(m => (
                            <div
                              key={m.tmdb_id}
                              onClick={() => {
                                setBattleForm({ 
                                  ...battleForm, 
                                  movie2Id: m.tmdb_id.toString(), 
                                  movie2Title: m.title, 
                                  movie2Poster: m.poster_url 
                                });
                                setBatSearchQuery2(m.title);
                                setBatSuggestions2([]);
                              }}
                              className="px-4 py-2 hover:bg-white/5 text-xs text-gray-200 cursor-pointer border-b border-white/5 flex items-center space-x-2"
                            >
                              <img src={m.poster_url} className="w-6 h-9 object-cover rounded" alt="" />
                              <span>{m.title} ({m.release_date ? m.release_date.split('-')[0] : 'N/A'})</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {battleForm.movie2Id && (
                        <span className="text-[10px] text-emerald-400 font-mono block mt-1">✓ Selected TMDB ID: {battleForm.movie2Id}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 font-sans">Start Date</label>
                        <input
                          type="date"
                          required
                          value={battleForm.startDate}
                          onChange={(e) => setBattleForm({ ...battleForm, startDate: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 font-sans">End Date</label>
                        <input
                          type="date"
                          required
                          value={battleForm.endDate}
                          onChange={(e) => setBattleForm({ ...battleForm, endDate: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-grow bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                      >
                        {battleForm.id ? 'Update Battle' : 'Create Battle'}
                      </button>
                      {battleForm.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setBattleForm({ id: '', movie1Id: '', movie1Title: '', movie1Poster: '', movie2Id: '', movie2Title: '', movie2Poster: '', startDate: '', endDate: '' });
                            setBatSearchQuery1('');
                            setBatSearchQuery2('');
                          }}
                          className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Battles catalog table */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                    <Swords className="h-4 w-4" />
                    <span>Movie Battles ({battles.length})</span>
                  </h3>

                  {battles.length === 0 ? (
                    <div className="glass-card border border-white/5 rounded-3xl p-12 text-center text-gray-500">
                      <p>No community movie battles created yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {battles.map((b) => {
                        const tot = (b.votes1 || []).length + (b.votes2 || []).length;
                        const p1 = tot > 0 ? Math.round((b.votes1.length / tot) * 100) : 50;
                        const p2 = tot > 0 ? 100 - p1 : 50;
                        return (
                          <div key={b.id} className="glass-card border border-white/5 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                            
                            {/* Images and Titles */}
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center -space-x-4">
                                <img src={b.movie1.poster_url} className="w-10 h-14 object-cover rounded-lg border border-gray-950 z-10 shadow-lg" alt="" />
                                <img src={b.movie2.poster_url} className="w-10 h-14 object-cover rounded-lg border border-gray-950 shadow-lg" alt="" />
                              </div>
                              <div className="text-left space-y-1">
                                <h4 className="font-bold text-gray-200 text-sm">
                                  {b.movie1.title} <span className="text-rose-400 text-xs">VS</span> {b.movie2.title}
                                </h4>
                                <p className="text-[10px] text-gray-500 font-mono">
                                  Timeline: {b.startDate} to {b.endDate}
                                </p>
                              </div>
                            </div>

                            {/* Votes percentage display */}
                            <div className="flex-grow max-w-xs space-y-1.5">
                              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                <div className="h-full bg-amber-500" style={{ width: `${p1}%` }} />
                                <div className="h-full bg-sky-500" style={{ width: `${p2}%` }} />
                              </div>
                              <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                                <span className="text-amber-400">{p1}% ({b.votes1.length})</span>
                                <span>{tot} votes</span>
                                <span className="text-sky-400">{p2}% ({b.votes2.length})</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleEditBattle(b)}
                                className="p-2 bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 rounded-xl transition-all border border-white/5 cursor-pointer"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBattle(b.id)}
                                className="p-2 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-xl transition-all border border-white/5 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. TAB: CURATED COLLECTIONS */}
            {activeTab === 'collections' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-fadeIn">
                {/* Create/Edit Form */}
                <div className="lg:col-span-1 glass-card border border-white/5 rounded-3xl p-6 space-y-6 h-fit">
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                    {colForm.id ? 'Edit Collection' : 'Create Collection'}
                  </h3>

                  <form onSubmit={handleSaveCollection} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400">Collection Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Christopher Nolan Collection"
                        value={colForm.name}
                        onChange={(e) => setColForm({ ...colForm, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-amber-500/50 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400">Description</label>
                      <textarea
                        rows="3"
                        placeholder="Write a brief overview of what this collection groups..."
                        value={colForm.description}
                        onChange={(e) => setColForm({ ...colForm, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400">Cover Backdrop URL</label>
                      <input
                        type="text"
                        placeholder="https://image.tmdb.org/..."
                        value={colForm.backdrop}
                        onChange={(e) => setColForm({ ...colForm, backdrop: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400">Movie IDs (Comma-separated TMDB IDs)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 157336, 27205, 155"
                        value={colForm.movieIdsCsv}
                        onChange={(e) => setColForm({ ...colForm, movieIdsCsv: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-grow bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                      >
                        {colForm.id ? 'Update Collection' : 'Publish Collection'}
                      </button>
                      {colForm.id && (
                        <button
                          type="button"
                          onClick={() => setColForm({ id: '', name: '', description: '', backdrop: '', movieIdsCsv: '' })}
                          className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Curated list */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                    <FolderHeart className="h-4 w-4" />
                    <span>Curated Movie Collections ({collections.length})</span>
                  </h3>

                  {collections.length === 0 ? (
                    <div className="glass-card border border-white/5 rounded-3xl p-12 text-center text-gray-500">
                      <p>No custom collections created yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {collections.map((col) => (
                        <div key={col.id} className="glass-card border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between">
                          <img src={col.backdrop} className="w-full h-32 object-cover border-b border-white/5" alt="" />
                          <div className="p-4 space-y-2 flex-grow text-left">
                            <h4 className="font-bold text-white text-sm">{col.name}</h4>
                            <p className="text-xs text-gray-500 leading-snug line-clamp-2">{col.description}</p>
                            <span className="text-[10px] text-amber-400 font-bold block font-mono">
                              ({col.movieIds ? col.movieIds.length : 0} movies assigned)
                            </span>
                          </div>
                          <div className="p-4 border-t border-white/5 bg-white/[0.01] flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditCollection(col)}
                              className="px-2.5 py-1.5 bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 rounded-lg border border-white/5 text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Edit Details
                            </button>
                            <button
                              onClick={() => handleDeleteCollection(col.id)}
                              className="px-2.5 py-1.5 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-lg border border-white/5 text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TV SHOWS CATALOG TAB */}
            {activeTab === 'tvShows' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn text-left">
                
                {/* Catalog Listing table */}
                <div className="lg:col-span-2 space-y-4 text-left">
                  <div className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-amber-500/50 transition-colors">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search TV show catalog or type query to pull new TMDB series..."
                      value={tvSearchQuery}
                      onChange={(e) => setTvSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-gray-500"
                    />
                  </div>

                  {/* Render Table */}
                  <div className="glass-card border border-white/5 rounded-3xl overflow-hidden text-left">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                            <th className="py-4 px-6">TV Show Details</th>
                            <th className="py-4 px-6 text-center">Homepage Curation Rails</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {filteredTvShows.map((show) => {
                            const id = show.tmdb_id || show.id;
                            const isRecommended = tvRecommends.includes(cleanTvId(id));
                            const isTrending = tvTrending.includes(cleanTvId(id));
                            const isNowPlaying = tvNowPlaying.includes(cleanTvId(id));
                            return (
                              <tr key={id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="py-4 px-6 flex items-center space-x-4">
                                  <img
                                    src={ensurePosterUrl(show.poster_url)}
                                    alt=""
                                    className="w-10 h-14 object-cover rounded-lg border border-white/10 group-hover:border-amber-500/30 transition-colors flex-shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-gray-200 truncate group-hover:text-white">{show.title || show.name}</h4>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                      {show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A'} • {show.genres ? (Array.isArray(show.genres) ? show.genres[0] : show.genres.split(',')[0]) : 'Drama'}
                                    </p>
                                  </div>
                                </td>
                                
                                <td className="py-4 px-6 text-center">
                                  <div className="flex flex-wrap items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleToggleTvRecommend(id)}
                                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                        isRecommended 
                                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                          : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                                      }`}
                                      title="Mark as TRG Recommends"
                                    >
                                      <Star className="h-3 w-3 fill-current" />
                                      <span>Recommend</span>
                                    </button>

                                    <button
                                      onClick={() => handleToggleTvTrending(id)}
                                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                        isTrending 
                                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                                          : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                                      }`}
                                      title="Mark as Trending Now"
                                    >
                                      <Sparkles className="h-3 w-3" />
                                      <span>Trending</span>
                                    </button>

                                    <button
                                      onClick={() => handleToggleTvNowPlaying(id)}
                                      className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                        isNowPlaying 
                                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                                          : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                                      }`}
                                      title="Mark as Currently Airing"
                                    >
                                      <Calendar className="h-3 w-3" />
                                      <span>Airing</span>
                                    </button>
                                  </div>
                                </td>

                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => handleEditTvClick(show)}
                                      className="p-2 bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 rounded-xl transition-all border border-white/5 cursor-pointer"
                                      title="Edit Overrides"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTv(id)}
                                      className="p-2 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-xl transition-all border border-white/5 cursor-pointer"
                                      title="Delete TV Show"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TMDB Results table for TV */}
                  {tvSearchQuery && tvTmdbResults.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/5 text-left">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5 text-left">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span>TMDB TV Matches to Moderate ({tvTmdbResults.length})</span>
                      </h3>
                      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden bg-amber-500/[0.01] text-left">
                        <table className="w-full text-left border-collapse">
                          <tbody className="divide-y divide-white/5 text-sm">
                            {tvTmdbResults.map(s => (
                              <tr key={s.tmdb_id || s.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="py-4 px-6 flex items-center space-x-4">
                                  <img src={ensurePosterUrl(s.poster_url)} className="w-10 h-14 object-cover rounded-lg border border-white/10" alt="" />
                                  <div className="text-left">
                                    <h4 className="font-bold text-gray-200">{s.title || s.name}</h4>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{s.first_air_date || s.release_date}</p>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button
                                    onClick={() => handleEditTvClick(s)}
                                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black rounded-lg border border-amber-500/20 transition-all font-semibold text-xs cursor-pointer"
                                  >
                                    Moderate
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit override Panel */}
                <div className="lg:col-span-1 text-left">
                  {!editingTvShow ? (
                    <div className="glass-card border border-white/5 rounded-3xl p-8 text-center text-gray-500 space-y-4">
                      <Tv className="h-10 w-10 mx-auto text-gray-700 stroke-1" />
                      <div>
                        <h3 className="font-bold text-gray-300">TV Override Panel</h3>
                        <p className="text-xs text-gray-500 mt-1">Select a TV show from the catalog table to override details, set TRG scores and write reviews.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card border border-amber-500/20 bg-gradient-to-b from-white/[0.03] to-white/[0.01] rounded-3xl p-6 space-y-6 relative overflow-hidden text-left">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center space-x-3">
                          <img src={ensurePosterUrl(editingTvShow.poster_url)} className="w-8 h-12 object-cover rounded border border-white/10" alt="" />
                          <div className="min-w-0 text-left">
                            <h3 className="font-bold text-white text-sm truncate max-w-[150px]">{editingTvShow.title || editingTvShow.name}</h3>
                            <p className="text-[11px] text-gray-500">Edit Override Details</p>
                          </div>
                        </div>
                        <button onClick={handleCancelTvEdit} className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveTv} className="space-y-4 text-left">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">TV Show Title</label>
                          <input type="text" required value={tvTitle} onChange={(e) => setTvTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400">First Air Date</label>
                            <input type="date" value={tvReleaseDate} onChange={(e) => setTvReleaseDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400">Genres</label>
                            <input type="text" placeholder="Drama, Action..." value={tvGenres} onChange={(e) => setTvGenres(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">Poster Image URL</label>
                          <input type="text" value={tvPosterUrl} onChange={(e) => setTvPosterUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">Backdrop Image URL</label>
                          <input type="text" value={tvBackdropUrl} onChange={(e) => setTvBackdropUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">Overview</label>
                          <textarea rows="3" value={tvOverview} onChange={(e) => setTvOverview(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none resize-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">YouTube Review URL</label>
                          <input type="text" placeholder="https://youtube.com/watch?v=..." value={tvYoutubeReviewUrl} onChange={(e) => setTvYoutubeReviewUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                        </div>

                        <div className="border-t border-white/5 my-4"></div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-amber-400">TRG Score (1.0 - 10.0)</label>
                          <input type="number" step="0.1" min="1" max="10" placeholder="e.g. 9.5" value={tvTrgRating} onChange={(e) => setTvTrgRating(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-amber-500/50 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-amber-400">TRG Written Verdict Review</label>
                          <textarea rows="3" value={tvTrgReview} onChange={(e) => setTvTrgReview(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500/50 outline-none resize-none" />
                        </div>

                        <div className="border-t border-white/5 my-4"></div>

                        {/* Featured Showcase override */}
                        <div className="space-y-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-300">Spotlight Feature (Show of the Week)</label>
                            <input type="checkbox" checked={isTvFeatured} onChange={(e) => setIsTvFeatured(e.target.checked)} className="rounded bg-black border-white/10 text-amber-500 focus:ring-0 cursor-pointer" />
                          </div>
                          {isTvFeatured && (
                            <div className="space-y-1 text-left">
                              <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Short Verdict banner description</label>
                              <input type="text" placeholder="e.g. A masterful sci-fi epic..." value={tvShortVerdict} onChange={(e) => setTvShortVerdict(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500/50 outline-none" />
                            </div>
                          )}
                        </div>

                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3 rounded-xl transition-all shadow-lg text-sm cursor-pointer">
                          Save Overrides
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* REVIEW REQUESTS TAB */}
            {activeTab === 'reviewRequests' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left animate-fadeIn">
                
                {/* 1. Movies requests */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center space-x-1.5">
                    <Film className="h-4 w-4" />
                    <span>Requested Movie Reviews</span>
                  </h3>
                  
                  <div className="glass-card border border-white/5 rounded-3xl overflow-hidden bg-white/[0.005]">
                    {reviewRequests.movies && reviewRequests.movies.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                            <th className="py-4 px-6">Movie Title</th>
                            <th className="py-4 px-6 text-center">Votes</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {reviewRequests.movies.map((req) => (
                            <tr key={req.tmdb_id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="py-4 px-6 font-bold text-gray-200">
                                {req.title} <span className="text-[10px] text-gray-500 font-normal">(ID: {req.tmdb_id})</span>
                              </td>
                              <td className="py-4 px-6 text-center font-mono font-bold text-amber-400">
                                {req.requests}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleManageReviewRequest('completed', 'movie', req.tmdb_id)}
                                    className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-lg border border-emerald-500/20 text-[10px] font-bold transition-all cursor-pointer"
                                    title="Mark review request as completed"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => handleManageReviewRequest('remove', 'movie', req.tmdb_id)}
                                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg border border-rose-500/20 text-[10px] font-bold transition-all cursor-pointer"
                                    title="Clear review request"
                                  >
                                    Reset
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <p>No movie review requests submitted.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. TV requests */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 font-mono flex items-center space-x-1.5">
                    <Tv className="h-4 w-4" />
                    <span>Requested TV Show Reviews</span>
                  </h3>
                  
                  <div className="glass-card border border-white/5 rounded-3xl overflow-hidden bg-white/[0.005]">
                    {reviewRequests.tv && reviewRequests.tv.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                            <th className="py-4 px-6">TV Show Title</th>
                            <th className="py-4 px-6 text-center">Votes</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {reviewRequests.tv.map((req) => (
                            <tr key={req.tmdb_id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="py-4 px-6 font-bold text-gray-200">
                                {req.title} <span className="text-[10px] text-gray-500 font-normal">(ID: {req.tmdb_id})</span>
                              </td>
                              <td className="py-4 px-6 text-center font-mono font-bold text-sky-400">
                                {req.requests}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleManageReviewRequest('completed', 'tv', req.tmdb_id)}
                                    className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-lg border border-emerald-500/20 text-[10px] font-bold transition-all cursor-pointer"
                                    title="Mark review request as completed"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() => handleManageReviewRequest('remove', 'tv', req.tmdb_id)}
                                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg border border-rose-500/20 text-[10px] font-bold transition-all cursor-pointer"
                                    title="Clear review request"
                                  >
                                    Reset
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <p>No TV show review requests submitted.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
