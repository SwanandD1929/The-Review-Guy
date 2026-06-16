import axios from 'axios';
import { tmdbClient } from './tmdb';

// 1. Browser Fingerprint Generator
export const getFingerprint = () => {
  let fp = localStorage.getItem('trg_fingerprint');
  if (!fp) {
    // Generate a unique client token
    fp = 'fp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('trg_fingerprint', fp);
  }
  return fp;
};

export const ensurePosterUrl = (poster) => {
  if (!poster) return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500";
  const str = String(poster).trim();
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }
  if (str.startsWith('//')) {
    return `https:${str}`;
  }
  if (str.startsWith('/')) {
    return `https://image.tmdb.org/t/p/w500${str}`;
  }
  return `https://image.tmdb.org/t/p/w500/${str}`;
};

export const ensureBackdropUrl = (backdrop) => {
  if (!backdrop) return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600";
  const str = String(backdrop).trim();
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }
  if (str.startsWith('//')) {
    return `https:${str}`;
  }
  if (str.startsWith('/')) {
    return `https://image.tmdb.org/t/p/original${str}`;
  }
  return `https://image.tmdb.org/t/p/original/${str}`;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const fingerprint = getFingerprint();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Seed data for client-side local fallback
const FALLBACK_SEED = [
  {
    "id": 1,
    "tmdb_id": 157336,
    "title": "Interstellar",
    "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    "poster_url": "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/2ssWTSVklAEc98frZUQhgtGHx7s.jpg",
    "release_date": "2014-11-05",
    "genres": "Adventure, Drama, Science Fiction",
    "language": "en",
    "tmdb_rating": 8.4,
    "runtime": 169,
    "director": "Christopher Nolan",
    "cast": "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine"
  },
  {
    "id": 2,
    "tmdb_id": 27205,
    "title": "Inception",
    "overview": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    "poster_url": "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    "release_date": "2010-07-15",
    "genres": "Action, Science Fiction, Adventure",
    "language": "en",
    "tmdb_rating": 8.3,
    "runtime": 148,
    "director": "Christopher Nolan",
    "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Elliot Page"
  },
  {
    "id": 3,
    "tmdb_id": 155,
    "title": "The Dark Knight",
    "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
    "release_date": "2008-07-16",
    "genres": "Drama, Action, Crime, Thriller",
    "language": "en",
    "tmdb_rating": 8.5,
    "runtime": 152,
    "director": "Christopher Nolan",
    "cast": "Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine"
  },
  {
    "id": 4,
    "tmdb_id": 438631,
    "title": "Dune",
    "overview": "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people. As malevolent forces explode into conflict over the planet's exclusive supply of the most precious resource in existence-a commodity capable of unlocking humanity's greatest potential-only those who can conquer their fear will survive.",
    "poster_url": "https://image.tmdb.org/t/p/w500/gDzOcq0pfeCeqMBwKIJlSmQpjkZ.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/zRKQW58MBEY078AxkHxEJzUskCl.jpg",
    "release_date": "2021-09-15",
    "genres": "Science Fiction, Adventure",
    "language": "en",
    "tmdb_rating": 7.8,
    "runtime": 155,
    "director": "Denis Villeneuve",
    "cast": "Timothée Chalamet, Rebecca Ferguson, Oscar Isaac, Josh Brolin"
  },
  {
    "id": 5,
    "tmdb_id": 579974,
    "title": "RRR",
    "overview": "A fictional history of two legendary revolutionaries' journey away from home before they began fighting for their country in the 1920s.",
    "poster_url": "https://image.tmdb.org/t/p/w500/u0XUBNQWlOvrh0Gd97ARGpIkL0.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/i0Y0wP8H6SRgjr6QmuwbtQbS24D.jpg",
    "release_date": "2022-03-24",
    "genres": "Action, Drama",
    "language": "te",
    "tmdb_rating": 7.8,
    "runtime": 187,
    "director": "S. S. Rajamouli",
    "cast": "N. T. Rama Rao Jr., Ram Charan, Ajay Devgn, Alia Bhatt"
  }
];

// Helper to initialize and retrieve Local Storage database for fallback mode
// Helper to initialize and retrieve Local Storage database for fallback mode
const DEFAULT_TOP_10 = [
  { rank: 1, tmdb_id: 157336, title: "Interstellar", rating: 9.8, verdict: "The greatest sci-fi film ever created. A masterpiece of physics, emotion, and music." },
  { rank: 2, tmdb_id: 11324, title: "Shutter Island", rating: 9.6, verdict: "An atmospheric masterpiece with one of the greatest plot twists in cinema history." },
  { rank: 3, tmdb_id: 1124, title: "The Prestige", rating: 9.5, verdict: "Nolan's finest magic trick. A brilliant exploration of obsession and rivalry." },
  { rank: 4, tmdb_id: 872585, title: "Oppenheimer", rating: 9.4, verdict: "A breathtaking historical thriller with a defining performance by Cillian Murphy." },
  { rank: 5, tmdb_id: 27205, title: "Inception", rating: 9.3, verdict: "A mind-bending heist film that redefines original sci-fi storytelling." },
  { rank: 6, tmdb_id: 278, title: "The Shawshank Redemption", rating: 9.2, verdict: "A timeless story of hope, friendship, and resilience." },
  { rank: 7, tmdb_id: 550, title: "Fight Club", rating: 9.1, verdict: "A chaotic, brilliant critique of modern culture. Absolutely iconic." },
  { rank: 8, tmdb_id: 264660, title: "Ex Machina", rating: 9.0, verdict: "An intense, cerebral sci-fi chamber piece on AI consciousness." },
  { rank: 9, tmdb_id: 146233, title: "Prisoners", rating: 8.9, verdict: "Denis Villeneuve's chilling, relentless thriller about morality and desperation." },
  { rank: 10, tmdb_id: 76341, title: "Mad Max: Fury Road", rating: 8.8, verdict: "A visual masterclass in action filmmaking and practical stunts." }
];

const TV_FALLBACK_SEED = [
  {
    "id": 1,
    "tmdb_id": 1396,
    "title": "Breaking Bad",
    "overview": "Walter White, a New Mexico chemistry teacher, learns he has stage III cancer and has been given a prognosis of two years to live. He decides he has nothing to lose. He turns to a life of crime, partnering with Jesse Pinkman to manufacture and sell methamphetamine.",
    "poster_url": "https://image.tmdb.org/t/p/w500/ztkUQv63MzC36o76t7613z5i71c.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/9faGsLEj6Z32vUj61hJyKTAxJ19.jpg",
    "release_date": "2008-01-20",
    "genres": "Drama, Crime",
    "language": "en"
  },
  {
    "id": 2,
    "tmdb_id": 66732,
    "title": "Stranger Things",
    "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    "poster_url": "https://image.tmdb.org/t/p/w500/49WkfeN0mGRLYClR6uH0J07vBGt.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/56v2Kj2qL524rmgU6WgZJy8i7Zq.jpg",
    "release_date": "2016-07-15",
    "genres": "Sci-Fi & Fantasy, Mystery, Drama",
    "language": "en"
  },
  {
    "id": 3,
    "tmdb_id": 1399,
    "title": "Game of Thrones",
    "overview": "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
    "poster_url": "https://image.tmdb.org/t/p/w500/1XS1JmqxZCC6hE5H0jG3jGggnLJ.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/z55QXt0144h2b45e998e1m8a2ec.jpg",
    "release_date": "2011-04-17",
    "genres": "Sci-Fi & Fantasy, Drama, Action & Adventure",
    "language": "en"
  },
  {
    "id": 4,
    "tmdb_id": 19885,
    "title": "Sherlock",
    "overview": "A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.",
    "poster_url": "https://image.tmdb.org/t/p/w500/f9zGxLHkJ13347S76A56M367JbA.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/o8wQcR2b0K98H6SgU9aQj24M7fB.jpg",
    "release_date": "2010-07-25",
    "genres": "Drama, Crime, Mystery",
    "language": "en"
  }
];

const getLocalStorageDb = () => {
  let movies = JSON.parse(localStorage.getItem('trg_movies'));
  let ratings = JSON.parse(localStorage.getItem('trg_ratings'));
  let reviews = JSON.parse(localStorage.getItem('trg_reviews'));
  let watched = JSON.parse(localStorage.getItem('trg_watched'));
  let watchLater = JSON.parse(localStorage.getItem('trg_watch_later'));
  
  let tvShows = JSON.parse(localStorage.getItem('trg_tv_shows'));
  let tvRatings = JSON.parse(localStorage.getItem('trg_tv_ratings'));
  let tvReviews = JSON.parse(localStorage.getItem('trg_tv_reviews'));
  let tvWatched = JSON.parse(localStorage.getItem('trg_tv_watched'));
  let tvWatchLater = JSON.parse(localStorage.getItem('trg_tv_watch_later'));
  let reviewRequests = JSON.parse(localStorage.getItem('trg_review_requests'));
  
  let announcements = JSON.parse(localStorage.getItem('trg_announcements'));
  let homepageSections = JSON.parse(localStorage.getItem('trg_homepage_sections'));
  let tvHomepageSections = JSON.parse(localStorage.getItem('trg_tv_homepage_sections'));
  let top10 = JSON.parse(localStorage.getItem('trg_top10'));
  let movieBattles = JSON.parse(localStorage.getItem('trg_movie_battles'));
  let movieCollections = JSON.parse(localStorage.getItem('trg_movie_collections'));
  let hiddenMovies = JSON.parse(localStorage.getItem('trg_hidden_movies'));
  let recommends = JSON.parse(localStorage.getItem('trg_recommends'));

  if (!movies || movies.length === 0) {
    movies = FALLBACK_SEED;
    localStorage.setItem('trg_movies', JSON.stringify(movies));
  }
  if (!ratings) {
    ratings = [];
    localStorage.setItem('trg_ratings', JSON.stringify(ratings));
  }
  if (!reviews) {
    reviews = [];
    localStorage.setItem('trg_reviews', JSON.stringify(reviews));
  }
  if (!watched) {
    watched = [];
    localStorage.setItem('trg_watched', JSON.stringify(watched));
  }
  if (!watchLater) {
    watchLater = [];
    localStorage.setItem('trg_watch_later', JSON.stringify(watchLater));
  }
  
  if (!tvShows || tvShows.length === 0) {
    tvShows = TV_FALLBACK_SEED;
    localStorage.setItem('trg_tv_shows', JSON.stringify(tvShows));
  }
  if (!tvRatings) {
    tvRatings = [];
    localStorage.setItem('trg_tv_ratings', JSON.stringify(tvRatings));
  }
  if (!tvReviews) {
    tvReviews = [];
    localStorage.setItem('trg_tv_reviews', JSON.stringify(tvReviews));
  }
  if (!tvWatched) {
    tvWatched = [];
    localStorage.setItem('trg_tv_watched', JSON.stringify(tvWatched));
  }
  if (!tvWatchLater) {
    tvWatchLater = [];
    localStorage.setItem('trg_tv_watch_later', JSON.stringify(tvWatchLater));
  }
  if (!reviewRequests) {
    reviewRequests = [];
    localStorage.setItem('trg_review_requests', JSON.stringify(reviewRequests));
  }
  
  if (!homepageSections) {
    homepageSections = [
      { id: "announcements", title: "Announcements", enabled: true, order: 0, pins: [], exclusions: [] },
      { id: "upcoming", title: "Upcoming Movies In India", enabled: true, order: 1, pins: [], exclusions: [] },
      { id: "trending", title: "Trending Now", enabled: true, order: 2, pins: [], exclusions: [] },
      { id: "nowPlaying", title: "Now Playing In Theaters", enabled: true, order: 3, pins: [], exclusions: [] },
      { id: "topRated", title: "Top Rated By Community", enabled: true, order: 4, pins: [], exclusions: [] },
      { id: "mostWatched", title: "Most Watched Movies", enabled: true, order: 5, pins: [], exclusions: [] },
      { id: "trgPicks", title: "The Review Guy Recommends", enabled: true, order: 6, pins: [], exclusions: [] },
      { id: "movieBattles", title: "Movie Battles", enabled: true, order: 7, pins: [], exclusions: [] }
    ];
    localStorage.setItem('trg_homepage_sections', JSON.stringify(homepageSections));
  }

  if (!tvHomepageSections) {
    tvHomepageSections = [
      { id: "announcements", title: "Announcements", enabled: true, order: 0, pins: [], exclusions: [] },
      { id: "trending", title: "Trending Now", enabled: true, order: 1, pins: [], exclusions: [] },
      { id: "popular", title: "Popular TV Shows", enabled: true, order: 2, pins: [], exclusions: [] },
      { id: "topRated", title: "Top Rated By Community", enabled: true, order: 3, pins: [], exclusions: [] },
      { id: "airingToday", title: "Airing Today", enabled: true, order: 4, pins: [], exclusions: [] },
      { id: "onTheAir", title: "Currently Airing", enabled: true, order: 5, pins: [], exclusions: [] },
      { id: "trgPicks", title: "The Review Guy Recommends", enabled: true, order: 6, pins: [], exclusions: [] }
    ];
    localStorage.setItem('trg_tv_homepage_sections', JSON.stringify(tvHomepageSections));
  }
  if (!top10) {
    top10 = DEFAULT_TOP_10;
    localStorage.setItem('trg_top10', JSON.stringify(top10));
  }
  if (!recommends) {
    recommends = [157336, 155, 27205];
    localStorage.setItem('trg_recommends', JSON.stringify(recommends));
  }
  if (!movieBattles) {
    movieBattles = [
      {
        id: "battle1",
        movie1: { tmdb_id: 157336, title: "Interstellar", poster_url: "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg" },
        movie2: { tmdb_id: 27205, title: "Inception", poster_url: "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg" },
        startDate: "2026-06-01",
        endDate: "2026-12-31",
        votes1: ["seed1", "seed2"],
        votes2: ["seed3"]
      }
    ];
    localStorage.setItem('trg_movie_battles', JSON.stringify(movieBattles));
  }
  if (!movieCollections) {
    movieCollections = [
      {
        id: "nolan",
        name: "Christopher Nolan Collection",
        description: "A curation of Christopher Nolan's mind-bending, epic cinematic masterpieces.",
        backdrop: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        movieIds: [157336, 27205, 155, 1124, 872585]
      },
      {
        id: "scifi",
        name: "Best Sci-Fi Collection",
        description: "Explore humanity's greatest space adventures, artificial intelligence, and dystopian futures.",
        backdrop: "https://image.tmdb.org/t/p/original/2ssWTSVklAEc98frZUQhgtGHx7s.jpg",
        movieIds: [157336, 27205, 438631, 264660]
      }
    ];
    localStorage.setItem('trg_movie_collections', JSON.stringify(movieCollections));
  }
  if (!hiddenMovies) {
    hiddenMovies = [];
    localStorage.setItem('trg_hidden_movies', JSON.stringify(hiddenMovies));
  }
  if (!announcements) {
    announcements = [
      {
        id: "ann1",
        title: "🚨 TRG Movie Battle #1 is now live! Interstellar VS Inception.",
        priority: "Critical",
        pinned: true,
        expiryDate: "2026-12-31",
        popupMode: true,
        bannerMode: true
      },
      {
        id: "ann2",
        title: "🏆 TRG Awards 2026 voting begins this Friday. Mark your calendars!",
        priority: "Important",
        pinned: true,
        expiryDate: "2026-12-31",
        popupMode: false,
        bannerMode: true
      }
    ];
    localStorage.setItem('trg_announcements', JSON.stringify(announcements));
  }

  return { 
    movies, ratings, reviews, watched, watchLater,
    tvShows, tvRatings, tvReviews, tvWatched, tvWatchLater, reviewRequests,
    announcements, homepageSections, tvHomepageSections, top10, movieBattles, 
    movieCollections, hiddenMovies, recommends
  };
};

const saveLocalStorageDb = (db) => {
  localStorage.setItem('trg_movies', JSON.stringify(db.movies));
  localStorage.setItem('trg_ratings', JSON.stringify(db.ratings));
  localStorage.setItem('trg_reviews', JSON.stringify(db.reviews));
  localStorage.setItem('trg_watched', JSON.stringify(db.watched));
  localStorage.setItem('trg_watch_later', JSON.stringify(db.watchLater));
  
  localStorage.setItem('trg_tv_shows', JSON.stringify(db.tvShows));
  localStorage.setItem('trg_tv_ratings', JSON.stringify(db.tvRatings));
  localStorage.setItem('trg_tv_reviews', JSON.stringify(db.tvReviews));
  localStorage.setItem('trg_tv_watched', JSON.stringify(db.tvWatched));
  localStorage.setItem('trg_tv_watch_later', JSON.stringify(db.tvWatchLater));
  localStorage.setItem('trg_review_requests', JSON.stringify(db.reviewRequests));
  
  localStorage.setItem('trg_announcements', JSON.stringify(db.announcements));
  localStorage.setItem('trg_homepage_sections', JSON.stringify(db.homepageSections));
  localStorage.setItem('trg_tv_homepage_sections', JSON.stringify(db.tvHomepageSections));
  localStorage.setItem('trg_top10', JSON.stringify(db.top10));
  localStorage.setItem('trg_movie_battles', JSON.stringify(db.movieBattles));
  localStorage.setItem('trg_movie_collections', JSON.stringify(db.movieCollections));
  localStorage.setItem('trg_hidden_movies', JSON.stringify(db.hiddenMovies));
  localStorage.setItem('trg_recommends', JSON.stringify(db.recommends));
};

export const cleanMovieId = (id) => {
  if (id === null || id === undefined) return null;
  const strId = String(id).trim();
  if (strId.startsWith('ext_')) {
    const parsed = parseInt(strId.replace('ext_', ''), 10);
    return isNaN(parsed) ? null : parsed;
  }
  const parsed = parseInt(strId, 10);
  return isNaN(parsed) ? null : parsed;
};

const getFallbackStats = (movie, fingerprint, db) => {
  if (!movie) return {
    community_rating: 0.0,
    total_ratings: 0,
    recommendation_percentage: 0,
    watch_count: 0,
    review_count: 0,
    user_rating: null,
    is_watched: false,
    is_watch_later: false
  };

  const localId = cleanMovieId(movie.id);
  const tmdbId = cleanMovieId(movie.tmdb_id);

  const ratings = db.ratings.filter(r => {
    const rMovieId = cleanMovieId(r.movie_id);
    return (localId && rMovieId === localId) || (tmdbId && rMovieId === tmdbId);
  });
  const total = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const avg = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0.0;
  
  const highRatings = ratings.filter(r => r.rating >= 7).length;
  const recPct = total > 0 ? Math.round((highRatings / total) * 100) : 0;
  
  const watches = db.watched.filter(w => {
    const wMovieId = cleanMovieId(w.movie_id);
    return (localId && wMovieId === localId) || (tmdbId && wMovieId === tmdbId);
  }).length;
  
  const reviewCount = db.reviews.filter(r => {
    const rMovieId = cleanMovieId(r.movie_id);
    return (localId && rMovieId === localId) || (tmdbId && rMovieId === tmdbId);
  }).length;
  
  const userRating = ratings.find(r => r.fingerprint === fingerprint)?.rating || null;
  
  const isWatched = db.watched.some(w => {
    const wMovieId = cleanMovieId(w.movie_id);
    return ((localId && wMovieId === localId) || (tmdbId && wMovieId === tmdbId)) && w.fingerprint === fingerprint;
  });
  
  const isWatchLater = db.watchLater.some(wl => {
    const wlMovieId = cleanMovieId(wl.movie_id);
    return ((localId && wlMovieId === localId) || (tmdbId && wlMovieId === tmdbId)) && wl.fingerprint === fingerprint;
  });

  return {
    community_rating: avg,
    total_ratings: total,
    recommendation_percentage: recPct,
    watch_count: watches,
    review_count: reviewCount,
    user_rating: userRating,
    is_watched: isWatched,
    is_watch_later: isWatchLater
  };
};

export const overlayModeratorStats = (movie, db) => {
  if (!movie) return null;
  const movieTmdbId = cleanMovieId(movie.tmdb_id);
  const movieId = cleanMovieId(movie.id);
  const metaKey = movieTmdbId || movieId;
  
  const trgRatings = JSON.parse(localStorage.getItem('trg_admin_ratings')) || {};
  const trgReviews = JSON.parse(localStorage.getItem('trg_admin_reviews')) || {};
  const trgMeta = JSON.parse(localStorage.getItem('trg_moderator_metadata')) || {};
  
  const trgRating = (metaKey && trgRatings[metaKey] !== undefined) ? trgRatings[metaKey] : null;
  const trgReview = (metaKey && trgReviews[metaKey]) ? trgReviews[metaKey] : null;
  const customMeta = (metaKey && trgMeta[metaKey]) ? trgMeta[metaKey] : {};
  
  // Calculate community stats
  let stats = {};
  if (db) {
    const localMovie = db.movies.find(lm => (movieTmdbId && cleanMovieId(lm.tmdb_id) === movieTmdbId) || (movieId && cleanMovieId(lm.id) === movieId));
    const mergedMovie = {
      id: localMovie ? cleanMovieId(localMovie.id) : movieId,
      tmdb_id: movieTmdbId || (localMovie ? cleanMovieId(localMovie.tmdb_id) : null)
    };
    stats = getFallbackStats(mergedMovie, fingerprint, db);
  } else {
    stats = {
      community_rating: 0.0,
      total_ratings: 0,
      recommendation_percentage: 0,
      watch_count: 0,
      review_count: 0,
      user_rating: null,
      is_watched: false,
      is_watch_later: false
    };
  }
  
  const localMovieObj = db ? db.movies.find(lm => (movieTmdbId && cleanMovieId(lm.tmdb_id) === movieTmdbId) || (movieId && cleanMovieId(lm.id) === movieId)) : null;

  return {
    ...movie,
    ...stats,
    id: movieTmdbId ? `ext_${movieTmdbId}` : (movieId ? String(movieId) : movie.id),
    title: customMeta.title !== undefined ? customMeta.title : movie.title,
    release_date: customMeta.release_date !== undefined ? customMeta.release_date : movie.release_date,
    genres: customMeta.genres !== undefined ? customMeta.genres : movie.genres,
    poster_url: ensurePosterUrl(customMeta.poster_url !== undefined ? customMeta.poster_url : movie.poster_url),
    backdrop_url: ensureBackdropUrl(customMeta.backdrop_url !== undefined ? customMeta.backdrop_url : movie.backdrop_url),
    overview: customMeta.overview !== undefined ? customMeta.overview : movie.overview,
    language: customMeta.language !== undefined ? customMeta.language : movie.language,
    trg_rating: trgRating,
    trg_review: trgReview,
    youtube_review_url: customMeta.youtube_review_url !== undefined ? customMeta.youtube_review_url : movie.youtube_review_url,
    local_id: localMovieObj ? cleanMovieId(localMovieObj.id) : null
  };
};

export const cleanTvId = (id) => {
  if (id === null || id === undefined) return null;
  const strId = String(id).trim();
  if (strId.startsWith('ext_')) {
    const parsed = parseInt(strId.replace('ext_', ''), 10);
    return isNaN(parsed) ? null : parsed;
  }
  const parsed = parseInt(strId, 10);
  return isNaN(parsed) ? null : parsed;
};

const getTvFallbackStats = (show, fingerprint, db) => {
  if (!show) return {
    community_rating: 0.0,
    total_ratings: 0,
    recommendation_percentage: 0,
    watch_count: 0,
    review_count: 0,
    user_rating: null,
    is_watched: false,
    is_watch_later: false
  };

  const localId = cleanTvId(show.id);
  const tmdbId = cleanTvId(show.tmdb_id);

  const ratings = db.tvRatings.filter(r => {
    const rShowId = cleanTvId(r.tv_show_id);
    return (localId && rShowId === localId) || (tmdbId && rShowId === tmdbId);
  });
  const total = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const avg = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0.0;
  
  const highRatings = ratings.filter(r => r.rating >= 7).length;
  const recPct = total > 0 ? Math.round((highRatings / total) * 100) : 0;
  
  const watches = db.tvWatched.filter(w => {
    const wShowId = cleanTvId(w.tv_show_id);
    return (localId && wShowId === localId) || (tmdbId && wShowId === tmdbId);
  }).length;
  
  const reviewCount = db.tvReviews.filter(r => {
    const rShowId = cleanTvId(r.tv_show_id);
    return (localId && rShowId === localId) || (tmdbId && rShowId === tmdbId);
  }).length;
  
  const userRating = ratings.find(r => r.fingerprint === fingerprint)?.rating || null;
  
  const isWatched = db.tvWatched.some(w => {
    const wShowId = cleanTvId(w.tv_show_id);
    return ((localId && wShowId === localId) || (tmdbId && wShowId === tmdbId)) && w.fingerprint === fingerprint;
  });
  
  const isWatchLater = db.tvWatchLater.some(wl => {
    const wlShowId = cleanTvId(wl.tv_show_id);
    return ((localId && wlShowId === localId) || (tmdbId && wlShowId === tmdbId)) && wl.fingerprint === fingerprint;
  });

  return {
    community_rating: avg,
    total_ratings: total,
    recommendation_percentage: recPct,
    watch_count: watches,
    review_count: reviewCount,
    user_rating: userRating,
    is_watched: isWatched,
    is_watch_later: isWatchLater
  };
};

export const overlayTvModeratorStats = (show, db) => {
  if (!show) return null;
  const showTmdbId = cleanTvId(show.tmdb_id);
  const showId = cleanTvId(show.id);
  const metaKey = showTmdbId || showId;
  
  const trgRatings = JSON.parse(localStorage.getItem('trg_tv_admin_ratings')) || {};
  const trgReviews = JSON.parse(localStorage.getItem('trg_tv_admin_reviews')) || {};
  const trgMeta = JSON.parse(localStorage.getItem('trg_tv_moderator_metadata')) || {};
  
  const trgRating = (metaKey && trgRatings[metaKey] !== undefined) ? trgRatings[metaKey] : null;
  const trgReview = (metaKey && trgReviews[metaKey]) ? trgReviews[metaKey] : null;
  const customMeta = (metaKey && trgMeta[metaKey]) ? trgMeta[metaKey] : {};
  
  let stats = {};
  if (db) {
    const localShow = db.tvShows.find(ls => (showTmdbId && cleanTvId(ls.tmdb_id) === showTmdbId) || (showId && cleanTvId(ls.id) === showId));
    const mergedShow = {
      id: localShow ? cleanTvId(localShow.id) : showId,
      tmdb_id: showTmdbId || (localShow ? cleanTvId(localShow.tmdb_id) : null)
    };
    stats = getTvFallbackStats(mergedShow, fingerprint, db);
  } else {
    stats = {
      community_rating: 0.0,
      total_ratings: 0,
      recommendation_percentage: 0,
      watch_count: 0,
      review_count: 0,
      user_rating: null,
      is_watched: false,
      is_watch_later: false
    };
  }
  
  const localShowObj = db ? db.tvShows.find(ls => (showTmdbId && cleanTvId(ls.tmdb_id) === showTmdbId) || (showId && cleanTvId(ls.id) === showId)) : null;

  return {
    ...show,
    ...stats,
    id: showTmdbId ? `ext_${showTmdbId}` : (showId ? String(showId) : show.id),
    title: customMeta.title !== undefined ? customMeta.title : (show.title || show.name),
    release_date: customMeta.release_date !== undefined ? customMeta.release_date : (show.release_date || show.first_air_date),
    genres: customMeta.genres !== undefined ? customMeta.genres : show.genres,
    poster_url: ensurePosterUrl(customMeta.poster_url !== undefined ? customMeta.poster_url : show.poster_url),
    backdrop_url: ensureBackdropUrl(customMeta.backdrop_url !== undefined ? customMeta.backdrop_url : show.backdrop_url),
    overview: customMeta.overview !== undefined ? customMeta.overview : show.overview,
    language: customMeta.language !== undefined ? customMeta.language : show.language,
    trg_rating: trgRating,
    trg_review: trgReview,
    youtube_review_url: customMeta.youtube_review_url !== undefined ? customMeta.youtube_review_url : show.youtube_review_url,
    local_id: localShowObj ? cleanTvId(localShowObj.id) : null
  };
};

const localTvFallback = {
  getTrending: async () => {
    try {
      const tmdbShows = await tmdbClient.getTvTrending();
      const db = getLocalStorageDb();
      return tmdbShows.map(s => overlayTvModeratorStats(s, db));
    } catch (e) {
      console.error("localTvFallback.getTrending error:", e);
      return [];
    }
  },
  getPopular: async () => {
    try {
      const tmdbShows = await tmdbClient.getTvPopular();
      const db = getLocalStorageDb();
      return tmdbShows.map(s => overlayTvModeratorStats(s, db));
    } catch (e) {
      console.error("localTvFallback.getPopular error:", e);
      return [];
    }
  },
  getTopRated: async () => {
    try {
      const tmdbShows = await tmdbClient.getTvTopRated();
      const db = getLocalStorageDb();
      return tmdbShows.map(s => overlayTvModeratorStats(s, db));
    } catch (e) {
      console.error("localTvFallback.getTopRated error:", e);
      return [];
    }
  },
  getAiringToday: async () => {
    try {
      const tmdbShows = await tmdbClient.getTvAiringToday();
      const db = getLocalStorageDb();
      return tmdbShows.map(s => overlayTvModeratorStats(s, db));
    } catch (e) {
      console.error("localTvFallback.getAiringToday error:", e);
      return [];
    }
  },
  getOnTheAir: async () => {
    try {
      const tmdbShows = await tmdbClient.getTvOnTheAir();
      const db = getLocalStorageDb();
      return tmdbShows.map(s => overlayTvModeratorStats(s, db));
    } catch (e) {
      console.error("localTvFallback.getOnTheAir error:", e);
      return [];
    }
  },
  discover: async (genreId) => {
    try {
      const tmdbShows = await tmdbClient.discoverTvShows(genreId);
      const db = getLocalStorageDb();
      return tmdbShows.map(s => overlayTvModeratorStats(s, db));
    } catch (e) {
      console.error("localTvFallback.discover error:", e);
      return [];
    }
  },
  search: async (q) => {
    const db = getLocalStorageDb();
    const query = q.toLowerCase();
    const local = db.tvShows
      .filter(s => s.title.toLowerCase().includes(query) || (s.genres && (Array.isArray(s.genres) ? s.genres.join(", ") : s.genres).toLowerCase().includes(query)))
      .map(s => overlayTvModeratorStats(s, db));
    let tmdb = [];
    try {
      const tmdbShows = await tmdbClient.searchTvShows(q);
      const localTmdbIds = new Set(local.map(s => cleanTvId(s.tmdb_id)).filter(id => id));
      tmdb = tmdbShows
        .filter(s => !localTmdbIds.has(cleanTvId(s.tmdb_id)))
        .map(s => overlayTvModeratorStats(s, db));
    } catch (err) {
      console.error("Local fallback TV search TMDB error:", err);
    }
    return { local, tmdb };
  },
  getShow: async (id) => {
    const db = getLocalStorageDb();
    let s = null;
    let tmdbId = cleanTvId(id);
    
    const strId = String(id);
    if (!strId.startsWith('ext_')) {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId)) {
        const localMatch = db.tvShows.find(show => cleanTvId(show.id) === parsedId);
        if (localMatch && localMatch.tmdb_id) {
          tmdbId = cleanTvId(localMatch.tmdb_id);
        }
      }
    }

    if (tmdbId) {
      const moderatedTmdbShows = JSON.parse(localStorage.getItem('trg_moderated_tmdb_tv_shows')) || [];
      const moderatedMatch = moderatedTmdbShows.find(show => cleanTvId(show.tmdb_id) === tmdbId);
      if (moderatedMatch) {
        s = { ...moderatedMatch };
      }
      
      if (!s) {
        const localMatch = db.tvShows.find(show => cleanTvId(show.tmdb_id) === tmdbId);
        if (localMatch) {
          s = { ...localMatch };
        }
      }
      
      if (!s) {
        try {
          const tmDetails = await tmdbClient.getTvDetails(tmdbId);
          if (tmDetails) {
            s = { ...tmDetails };
          }
        } catch (e) {
          console.error("Failed to fetch TMDB TV details for fallback in getShow:", e);
        }
      }
    }
    
    if (!s) {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId)) {
        const localMatch = db.tvShows.find(show => cleanTvId(show.id) === parsedId);
        if (localMatch) {
          s = { ...localMatch };
        }
      }
    }
    
    if (!s) return null;

    const activeShowId = cleanTvId(s.id);
    const activeTmdbId = cleanTvId(s.tmdb_id);
    const reviewsList = db.tvReviews.filter(r => {
      const rShowId = cleanTvId(r.tv_show_id);
      return (activeShowId && rShowId === activeShowId) || (activeTmdbId && rShowId === activeTmdbId);
    });
    
    const reviewsData = reviewsList.map(r => {
      const revRating = db.tvRatings.find(rat => {
        const ratShowId = cleanTvId(rat.tv_show_id);
        return ((activeShowId && ratShowId === activeShowId) || (activeTmdbId && ratShowId === activeTmdbId)) &&
          rat.fingerprint === r.fingerprint;
      });
      return {
        id: r.id,
        fingerprint: r.fingerprint,
        review_text: r.review_text,
        created_at: r.created_at,
        rating: revRating ? revRating.rating : null
      };
    });
    
    reviewsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const showWithReviews = {
      ...s,
      reviews: reviewsData
    };
    
    return overlayTvModeratorStats(showWithReviews, db);
  },
  rate: (showId, ratingVal) => {
    const db = getLocalStorageDb();
    const id = cleanTvId(showId);
    let existing = db.tvRatings.find(r => cleanTvId(r.tv_show_id) === id && r.fingerprint === fingerprint);
    if (existing) {
      existing.rating = ratingVal;
    } else {
      db.tvRatings.push({ tv_show_id: id, fingerprint, rating: ratingVal });
    }
    const watchedIndex = db.tvWatched.findIndex(w => cleanTvId(w.tv_show_id) === id && w.fingerprint === fingerprint);
    if (watchedIndex === -1) {
      db.tvWatched.push({ tv_show_id: id, fingerprint });
    }
    saveLocalStorageDb(db);
    return { success: true };
  },
  review: (showId, reviewText) => {
    const db = getLocalStorageDb();
    const id = cleanTvId(showId);
    const newRev = {
      id: db.tvReviews.length + 1,
      tv_show_id: id,
      fingerprint,
      review_text: reviewText,
      created_at: new Date().toISOString()
    };
    db.tvReviews.push(newRev);
    saveLocalStorageDb(db);
    return { success: true, review: newRev };
  },
  toggleWatched: (showId) => {
    const db = getLocalStorageDb();
    const id = cleanTvId(showId);
    const index = db.tvWatched.findIndex(w => cleanTvId(w.tv_show_id) === id && w.fingerprint === fingerprint);
    let is_watched = false;
    if (index > -1) {
      db.tvWatched.splice(index, 1);
    } else {
      db.tvWatched.push({ tv_show_id: id, fingerprint });
      is_watched = true;
    }
    saveLocalStorageDb(db);
    return { success: true, is_watched };
  },
  toggleWatchLater: (showId) => {
    const db = getLocalStorageDb();
    const id = cleanTvId(showId);
    const index = db.tvWatchLater.findIndex(wl => cleanTvId(wl.tv_show_id) === id && wl.fingerprint === fingerprint);
    let is_watch_later = false;
    if (index > -1) {
      db.tvWatchLater.splice(index, 1);
    } else {
      db.tvWatchLater.push({ tv_show_id: id, fingerprint });
      is_watch_later = true;
    }
    saveLocalStorageDb(db);
    return { success: true, is_watch_later };
  },
  getWatchLater: () => {
    const db = getLocalStorageDb();
    const wl = db.tvWatchLater.filter(item => item.fingerprint === fingerprint);
    return wl.map(item => {
      const cleanItemId = cleanTvId(item.tv_show_id);
      let s = db.tvShows.find(show => cleanTvId(show.id) === cleanItemId || cleanTvId(show.tmdb_id) === cleanItemId);
      if (!s) {
        s = { id: cleanItemId, title: "Bookmarked Show", poster_url: "" };
      }
      return overlayTvModeratorStats(s, db);
    });
  },
  saveTrgStats: (showId, rating, reviewText) => {
    const trgRatings = JSON.parse(localStorage.getItem('trg_tv_admin_ratings')) || {};
    const trgReviews = JSON.parse(localStorage.getItem('trg_tv_admin_reviews')) || {};
    const id = cleanTvId(showId);
    
    if (rating !== undefined) {
      if (rating === "" || rating === null) {
        delete trgRatings[id];
      } else {
        trgRatings[id] = parseFloat(rating);
      }
    }
    
    if (reviewText !== undefined) {
      if (reviewText === "" || reviewText === null) {
        delete trgReviews[id];
      } else {
        trgReviews[id] = reviewText;
      }
    }
    
    localStorage.setItem('trg_tv_admin_ratings', JSON.stringify(trgRatings));
    localStorage.setItem('trg_tv_admin_reviews', JSON.stringify(trgReviews));
    return { success: true };
  },
  updateTvMetadata: (showId, data) => {
    const id = cleanTvId(showId);
    const trgMeta = JSON.parse(localStorage.getItem('trg_tv_moderator_metadata')) || {};
    
    trgMeta[id] = trgMeta[id] || {};
    
    if (data.title !== undefined) trgMeta[id].title = data.title;
    if (data.release_date !== undefined) trgMeta[id].release_date = data.release_date;
    if (data.genres !== undefined) {
      const g = data.genres;
      trgMeta[id].genres = Array.isArray(g) ? g.join(", ") : g;
    }
    if (data.poster_url !== undefined) trgMeta[id].poster_url = data.poster_url;
    if (data.backdrop_url !== undefined) trgMeta[id].backdrop_url = data.backdrop_url;
    if (data.overview !== undefined) trgMeta[id].overview = data.overview;
    if (data.language !== undefined) trgMeta[id].language = data.language;
    if (data.youtube_review_url !== undefined) trgMeta[id].youtube_review_url = data.youtube_review_url;
    
    localStorage.setItem('trg_tv_moderator_metadata', JSON.stringify(trgMeta));
    
    const cleanTmdbId = cleanTvId(data.tmdb_id);
    if (cleanTmdbId) {
      const moderatedTmdbShows = JSON.parse(localStorage.getItem('trg_moderated_tmdb_tv_shows')) || [];
      const existingIdx = moderatedTmdbShows.findIndex(s => cleanTvId(s.tmdb_id) === cleanTmdbId);
      
      const showObj = {
        tmdb_id: cleanTmdbId,
        title: data.title || trgMeta[id].title || 'Unknown',
        release_date: data.release_date || trgMeta[id].release_date || '',
        genres: trgMeta[id].genres || (Array.isArray(data.genres) ? data.genres.join(", ") : data.genres) || 'Drama',
        poster_url: ensurePosterUrl(data.poster_url || trgMeta[id].poster_url),
        backdrop_url: ensureBackdropUrl(data.backdrop_url || trgMeta[id].backdrop_url),
        overview: data.overview || trgMeta[id].overview || '',
        language: data.language || trgMeta[id].language || 'en',
        youtube_review_url: data.youtube_review_url || trgMeta[id].youtube_review_url
      };
      
      if (existingIdx > -1) {
        moderatedTmdbShows[existingIdx] = {
          ...moderatedTmdbShows[existingIdx],
          ...showObj
        };
      } else {
        moderatedTmdbShows.push(showObj);
      }
      localStorage.setItem('trg_moderated_tmdb_tv_shows', JSON.stringify(moderatedTmdbShows));
    }
    return overlayTvModeratorStats({ id: showId, tmdb_id: cleanTmdbId }, getLocalStorageDb());
  },
  getAllTvShows: () => {
    const db = getLocalStorageDb();
    const moderatedTmdbShows = JSON.parse(localStorage.getItem('trg_moderated_tmdb_tv_shows')) || [];
    
    const localShows = db.tvShows.map(s => overlayTvModeratorStats(s, db));
    const moderatedTmdb = moderatedTmdbShows.map(s => overlayTvModeratorStats(s, db));
    
    const merged = [...localShows];
    const localTmdbIds = new Set(localShows.map(s => cleanTvId(s.tmdb_id)).filter(id => id));
    
    moderatedTmdb.forEach(s => {
      const sTmdbId = cleanTvId(s.tmdb_id);
      if (sTmdbId && !localTmdbIds.has(sTmdbId)) {
        merged.push(s);
      }
    });
    
    return merged;
  },
  deleteTvShow: (showId) => {
    const db = getLocalStorageDb();
    const id = cleanTvId(showId);
    db.tvShows = db.tvShows.filter(s => cleanTvId(s.id) !== id && cleanTvId(s.tmdb_id) !== id);
    db.tvRatings = db.tvRatings.filter(r => cleanTvId(r.tv_show_id) !== id);
    db.tvReviews = db.tvReviews.filter(r => cleanTvId(r.tv_show_id) !== id);
    db.tvWatched = db.tvWatched.filter(w => cleanTvId(w.tv_show_id) !== id);
    db.tvWatchLater = db.tvWatchLater.filter(wl => cleanTvId(wl.tv_show_id) !== id);
    saveLocalStorageDb(db);
    
    const moderatedTvShows = JSON.parse(localStorage.getItem('trg_moderated_tmdb_tv_shows')) || [];
    const updatedTv = moderatedTvShows.filter(s => cleanTvId(s.tmdb_id) !== id);
    localStorage.setItem('trg_moderated_tmdb_tv_shows', JSON.stringify(updatedTv));
    return { success: true };
  },
  
  addReviewRequest: (media_type, tmdb_id, title) => {
    const db = getLocalStorageDb();
    if (!db.reviewRequests) db.reviewRequests = [];
    
    const cleanId = cleanTvId(tmdb_id);
    const existing = db.reviewRequests.find(r => r.media_type === media_type && cleanTvId(r.tmdb_id) === cleanId && r.fingerprint === fingerprint);
    if (existing) {
      return { success: false, error: 'Already requested' };
    }
    
    const newReq = {
      id: db.reviewRequests.length + 1,
      media_type,
      tmdb_id: cleanId,
      title,
      fingerprint,
      status: 'pending'
    };
    db.reviewRequests.push(newReq);
    saveLocalStorageDb(db);
    
    const count = db.reviewRequests.filter(r => r.media_type === media_type && cleanTvId(r.tmdb_id) === cleanId && r.status === 'pending').length;
    return { success: true, count };
  },
  getReviewRequestCount: (media_type, tmdb_id) => {
    const db = getLocalStorageDb();
    if (!db.reviewRequests) db.reviewRequests = [];
    
    const cleanId = cleanTvId(tmdb_id);
    const count = db.reviewRequests.filter(r => r.media_type === media_type && cleanTvId(r.tmdb_id) === cleanId && r.status === 'pending').length;
    const has_requested = db.reviewRequests.some(r => r.media_type === media_type && cleanTvId(r.tmdb_id) === cleanId && r.fingerprint === fingerprint);
    return { count, has_requested };
  },
  getReviewRequestsStats: () => {
    const db = getLocalStorageDb();
    if (!db.reviewRequests) db.reviewRequests = [];
    
    const groupRequests = (type) => {
      const counts = {};
      db.reviewRequests.forEach(r => {
        if (r.media_type === type && r.status === 'pending') {
          const key = `${r.tmdb_id}_${r.title}`;
          if (!counts[key]) {
            counts[key] = { tmdb_id: r.tmdb_id, title: r.title, requests: 0 };
          }
          counts[key].requests += 1;
        }
      });
      return Object.values(counts).sort((a, b) => b.requests - a.requests);
    };
    
    return {
      movies: groupRequests('movie'),
      tv: groupRequests('tv')
    };
  },
  manageReviewRequests: (action, media_type, tmdb_id) => {
    const db = getLocalStorageDb();
    if (!db.reviewRequests) db.reviewRequests = [];
    
    const cleanId = cleanTvId(tmdb_id);
    if (action === 'reset' || action === 'remove') {
      db.reviewRequests = db.reviewRequests.filter(r => !(r.media_type === media_type && cleanTvId(r.tmdb_id) === cleanId));
    } else if (action === 'completed') {
      db.reviewRequests.forEach(r => {
        if (r.media_type === media_type && cleanTvId(r.tmdb_id) === cleanId) {
          r.status = 'completed';
        }
      });
    }
    saveLocalStorageDb(db);
    return { success: true };
  },
  getSeasonDetails: async (id, seasonNumber) => {
    let tmdbId = cleanTvId(id);
    if (!tmdbId) {
      const db = getLocalStorageDb();
      const show = db.tvShows.find(s => String(s.id) === String(id));
      if (show) tmdbId = cleanTvId(show.tmdb_id);
    }
    
    if (tmdbId) {
      try {
        if (tmdbClient.getTvSeasonDetails) {
          const details = await tmdbClient.getTvSeasonDetails(tmdbId, seasonNumber);
          if (details) return details;
        }
      } catch (err) {
        console.error("Local fallback getSeasonDetails TMDB error:", err);
      }
    }
    
    // Fallback mock episodes if TMDB is offline or key missing
    const episodes = [];
    for (let i = 1; i <= 10; i++) {
      episodes.push({
        episode_number: i,
        name: `Episode ${i}`,
        air_date: `2026-01-${i < 10 ? '0' + i : i}`,
        overview: `This is a placeholder overview for season ${seasonNumber} episode ${i}. In this episode, dramatic events unfold.`,
        still_url: null
      });
    }
    return {
      season_number: seasonNumber,
      name: `Season ${seasonNumber}`,
      overview: `Mock overview for Season ${seasonNumber}`,
      episodes
    };
  }
};

// Fallback Services mimicking backend
const localFallback = {
  getTrending: async () => {
    try {
      const tmdbMovies = await tmdbClient.getTrending();
      const db = getLocalStorageDb();
      return tmdbMovies.map(m => overlayModeratorStats(m, db));
    } catch (e) {
      console.error("localFallback.getTrending error:", e);
      return [];
    }
  },
  getUpcoming: async () => {
    try {
      const tmdbMovies = await tmdbClient.getUpcoming();
      const db = getLocalStorageDb();
      return tmdbMovies.map(m => overlayModeratorStats(m, db));
    } catch (e) {
      console.error("localFallback.getUpcoming error:", e);
      return [];
    }
  },
  getNowPlaying: async () => {
    try {
      const tmdbMovies = await tmdbClient.getNowPlaying();
      const db = getLocalStorageDb();
      return tmdbMovies.map(m => overlayModeratorStats(m, db));
    } catch (e) {
      console.error("localFallback.getNowPlaying error:", e);
      return [];
    }
  },
  getTopRated: async () => {
    const db = getLocalStorageDb();
    return db.movies
      .map(m => overlayModeratorStats(m, db))
      .sort((a, b) => b.community_rating - a.community_rating);
  },
  getMostWatched: async () => {
    const db = getLocalStorageDb();
    return db.movies
      .map(m => overlayModeratorStats(m, db))
      .sort((a, b) => b.watch_count - a.watch_count);
  },
  search: async (q) => {
    const db = getLocalStorageDb();
    const query = q.toLowerCase();
    const local = db.movies
      .filter(m => m.title.toLowerCase().includes(query) || (m.genres && (Array.isArray(m.genres) ? m.genres.join(", ") : m.genres).toLowerCase().includes(query)))
      .map(m => overlayModeratorStats(m, db));
    let tmdb = [];
    try {
      const tmdbMatches = await tmdbClient.searchMovies(q);
      const localTmdbIds = new Set(local.map(m => cleanMovieId(m.tmdb_id)).filter(id => id));
      tmdb = tmdbMatches
        .filter(m => !localTmdbIds.has(cleanMovieId(m.tmdb_id)))
        .map(m => overlayModeratorStats(m, db));
    } catch (err) {
      console.error("Local fallback search TMDB error:", err);
    }
    return { local, tmdb };
  },
  getMovie: async (id) => {
    const db = getLocalStorageDb();
    let m = null;
    let tmdbId = cleanMovieId(id);
    
    // Check if the id string had 'ext_' prefix or if it's just a raw number
    const strId = String(id);
    if (!strId.startsWith('ext_')) {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId)) {
        const localMatch = db.movies.find(mov => cleanMovieId(mov.id) === parsedId);
        if (localMatch && localMatch.tmdb_id) {
          tmdbId = cleanMovieId(localMatch.tmdb_id);
        }
      }
    }

    // Now, resolve by tmdbId first if we have one
    if (tmdbId) {
      // 1. Check moderated TMDB catalog
      const moderatedTmdbMovies = JSON.parse(localStorage.getItem('trg_moderated_tmdb_movies')) || [];
      const moderatedMatch = moderatedTmdbMovies.find(mov => cleanMovieId(mov.tmdb_id) === tmdbId);
      if (moderatedMatch) {
        m = { ...moderatedMatch };
      }
      
      // 2. Check local database movies
      if (!m) {
        const localMatch = db.movies.find(mov => cleanMovieId(mov.tmdb_id) === tmdbId);
        if (localMatch) {
          m = { ...localMatch };
        }
      }
      
      // 3. Fallback to TMDB API details
      if (!m) {
        try {
          const tmDetails = await tmdbClient.getMovieDetails(tmdbId);
          if (tmDetails) {
            m = { ...tmDetails };
          }
        } catch (e) {
          console.error("Failed to fetch TMDB details for fallback in getMovie:", e);
        }
      }
    }
    
    // If we couldn't resolve by tmdbId, check local database by integer local id
    if (!m) {
      const parsedId = parseInt(id, 10);
      if (!isNaN(parsedId)) {
        const localMatch = db.movies.find(mov => cleanMovieId(mov.id) === parsedId);
        if (localMatch) {
          m = { ...localMatch };
        }
      }
    }
    
    if (!m) return null;

    // Attach community reviews matching either this local ID or TMDB ID
    const activeMovieId = cleanMovieId(m.id);
    const activeTmdbId = cleanMovieId(m.tmdb_id);
    const reviewsList = db.reviews.filter(r => {
      const rMovieId = cleanMovieId(r.movie_id);
      return (activeMovieId && rMovieId === activeMovieId) || (activeTmdbId && rMovieId === activeTmdbId);
    });
    
    const reviewsData = reviewsList.map(r => {
      // Find rating from the same reviewer fingerprint
      const revRating = db.ratings.find(rat => {
        const ratMovieId = cleanMovieId(rat.movie_id);
        return ((activeMovieId && ratMovieId === activeMovieId) || (activeTmdbId && ratMovieId === activeTmdbId)) &&
          rat.fingerprint === r.fingerprint;
      });
      return {
        id: r.id,
        fingerprint: r.fingerprint,
        review_text: r.review_text,
        created_at: r.created_at,
        rating: revRating ? revRating.rating : null
      };
    });
    
    // Sort reviews by created_at desc
    reviewsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const movieWithReviews = {
      ...m,
      reviews: reviewsData
    };
    
    return overlayModeratorStats(movieWithReviews, db);
  },
  importMovie: (movieData) => {
    const db = getLocalStorageDb();
    let existing = db.movies.find(m => cleanMovieId(m.tmdb_id) === cleanMovieId(movieData.tmdb_id));
    if (existing) return overlayModeratorStats(existing, db);

    const newM = {
      id: db.movies.length + 1,
      ...movieData,
      local_id: db.movies.length + 1
    };
    db.movies.push(newM);
    saveLocalStorageDb(db);
    return overlayModeratorStats(newM, db);
  },
  addMovie: (movieData) => {
    const db = getLocalStorageDb();
    let existing = db.movies.find(m => m.title.toLowerCase() === movieData.title.toLowerCase() && m.release_date === movieData.release_date);
    if (existing) return { exists: true, movie: overlayModeratorStats(existing, db) };

    const newM = {
      id: db.movies.length + 1,
      ...movieData,
      poster_url: ensurePosterUrl(movieData.poster_url),
      backdrop_url: ensureBackdropUrl(movieData.backdrop_url),
      local_id: db.movies.length + 1
    };
    db.movies.push(newM);
    saveLocalStorageDb(db);
    return { exists: false, movie: overlayModeratorStats(newM, db) };
  },
  rate: (movieId, ratingVal) => {
    const db = getLocalStorageDb();
    const id = cleanMovieId(movieId);
    let existing = db.ratings.find(r => cleanMovieId(r.movie_id) === id && r.fingerprint === fingerprint);
    if (existing) {
      existing.rating = ratingVal;
    } else {
      db.ratings.push({ movie_id: id, fingerprint, rating: ratingVal });
    }
    const watchedIndex = db.watched.findIndex(w => cleanMovieId(w.movie_id) === id && w.fingerprint === fingerprint);
    if (watchedIndex === -1) {
      db.watched.push({ movie_id: id, fingerprint });
    }
    saveLocalStorageDb(db);
    return { success: true };
  },
  review: (movieId, reviewText) => {
    const db = getLocalStorageDb();
    const id = cleanMovieId(movieId);
    const newRev = {
      id: db.reviews.length + 1,
      movie_id: id,
      fingerprint,
      review_text: reviewText,
      created_at: new Date().toISOString()
    };
    db.reviews.push(newRev);
    saveLocalStorageDb(db);
    return { success: true, review: newRev };
  },
  toggleWatched: (movieId) => {
    const db = getLocalStorageDb();
    const id = cleanMovieId(movieId);
    const index = db.watched.findIndex(w => cleanMovieId(w.movie_id) === id && w.fingerprint === fingerprint);
    let is_watched = false;
    if (index > -1) {
      db.watched.splice(index, 1);
    } else {
      db.watched.push({ movie_id: id, fingerprint });
      is_watched = true;
    }
    saveLocalStorageDb(db);
    return { success: true, is_watched };
  },
  toggleWatchLater: (movieId) => {
    const db = getLocalStorageDb();
    const id = cleanMovieId(movieId);
    const index = db.watchLater.findIndex(wl => cleanMovieId(wl.movie_id) === id && wl.fingerprint === fingerprint);
    let is_watch_later = false;
    if (index > -1) {
      db.watchLater.splice(index, 1);
    } else {
      db.watchLater.push({ movie_id: id, fingerprint });
      is_watch_later = true;
    }
    saveLocalStorageDb(db);
    return { success: true, is_watch_later };
  },
  getWatchLater: () => {
    const db = getLocalStorageDb();
    const wl = db.watchLater.filter(item => item.fingerprint === fingerprint);
    return wl.map(item => {
      const cleanItemId = cleanMovieId(item.movie_id);
      let m = db.movies.find(mov => cleanMovieId(mov.id) === cleanItemId || cleanMovieId(mov.tmdb_id) === cleanItemId);
      if (!m) {
        m = { id: cleanItemId, title: "Bookmarked Film", poster_url: "" };
      }
      return overlayModeratorStats(m, db);
    });
  },
  getStats: () => {
    const db = getLocalStorageDb();
    return {
      watch_later_count: db.watchLater.filter(item => item.fingerprint === fingerprint).length,
      watched_count: db.watched.filter(item => item.fingerprint === fingerprint).length,
      reviews_count: db.reviews.filter(item => item.fingerprint === fingerprint).length,
      ratings_count: db.ratings.filter(item => item.fingerprint === fingerprint).length
    };
  },
  getFeaturedMovie: () => {
    const featuredStr = localStorage.getItem('trg_featured_movie');
    if (!featuredStr) return null;
    const featured = JSON.parse(featuredStr);
    const db = getLocalStorageDb();
    
    const cleanId = cleanMovieId(featured.movie_id);
    let baseMovie = db.movies.find(m => cleanMovieId(m.tmdb_id) === cleanId || cleanMovieId(m.id) === cleanId);
    if (!baseMovie && cleanId) {
      const trgMeta = JSON.parse(localStorage.getItem('trg_moderator_metadata')) || {};
      const customMeta = trgMeta[cleanId];
      if (customMeta) {
        baseMovie = {
          tmdb_id: cleanId,
          ...customMeta
        };
      }
    }
    
    if (!baseMovie) return null;
    const overlaid = overlayModeratorStats(baseMovie, db);
    return {
      ...overlaid,
      short_verdict: featured.short_verdict
    };
  },
  setFeaturedMovie: (movieId, shortVerdict) => {
    if (!movieId) {
      localStorage.removeItem('trg_featured_movie');
      return null;
    }
    const cleanId = cleanMovieId(movieId);
    const featured = { movie_id: cleanId, short_verdict: shortVerdict };
    localStorage.setItem('trg_featured_movie', JSON.stringify(featured));
    return { ...featured, active: true };
  },
  removeFeaturedMovie: () => {
    localStorage.removeItem('trg_featured_movie');
    return { success: true };
  },
  saveTrgStats: (movieId, rating, reviewText) => {
    const trgRatings = JSON.parse(localStorage.getItem('trg_admin_ratings')) || {};
    const trgReviews = JSON.parse(localStorage.getItem('trg_admin_reviews')) || {};
    const id = cleanMovieId(movieId);
    
    if (rating !== undefined) {
      if (rating === "" || rating === null) {
        delete trgRatings[id];
      } else {
        trgRatings[id] = parseFloat(rating);
      }
    }
    
    if (reviewText !== undefined) {
      if (reviewText === "" || reviewText === null) {
        delete trgReviews[id];
      } else {
        trgReviews[id] = reviewText;
      }
    }
    
    localStorage.setItem('trg_admin_ratings', JSON.stringify(trgRatings));
    localStorage.setItem('trg_admin_reviews', JSON.stringify(trgReviews));
    return { success: true };
  },
  deleteMovie: (movieId) => {
    const db = getLocalStorageDb();
    const id = cleanMovieId(movieId);
    db.movies = db.movies.filter(m => cleanMovieId(m.id) !== id && cleanMovieId(m.tmdb_id) !== id);
    db.ratings = db.ratings.filter(r => cleanMovieId(r.movie_id) !== id);
    db.reviews = db.reviews.filter(r => cleanMovieId(r.movie_id) !== id);
    db.watched = db.watched.filter(w => cleanMovieId(w.movie_id) !== id);
    db.watchLater = db.watchLater.filter(wl => cleanMovieId(wl.movie_id) !== id);
    saveLocalStorageDb(db);
    return { success: true };
  },
  updateMovieMetadata: (movieId, data) => {
    const id = cleanMovieId(movieId);
    const trgMeta = JSON.parse(localStorage.getItem('trg_moderator_metadata')) || {};
    
    trgMeta[id] = trgMeta[id] || {};
    
    if (data.title !== undefined) trgMeta[id].title = data.title;
    if (data.release_date !== undefined) trgMeta[id].release_date = data.release_date;
    if (data.genres !== undefined) {
      const g = data.genres;
      trgMeta[id].genres = Array.isArray(g) ? g.join(", ") : g;
    }
    if (data.poster_url !== undefined) trgMeta[id].poster_url = data.poster_url;
    if (data.backdrop_url !== undefined) trgMeta[id].backdrop_url = data.backdrop_url;
    if (data.overview !== undefined) trgMeta[id].overview = data.overview;
    if (data.language !== undefined) trgMeta[id].language = data.language;
    
    localStorage.setItem('trg_moderator_metadata', JSON.stringify(trgMeta));
    
    const cleanTmdbId = cleanMovieId(data.tmdb_id);
    if (cleanTmdbId) {
      const moderatedTmdbMovies = JSON.parse(localStorage.getItem('trg_moderated_tmdb_movies')) || [];
      const existingIdx = moderatedTmdbMovies.findIndex(m => cleanMovieId(m.tmdb_id) === cleanTmdbId);
      
      const movieObj = {
        tmdb_id: cleanTmdbId,
        title: data.title || trgMeta[id].title || 'Unknown',
        release_date: data.release_date || trgMeta[id].release_date || '',
        genres: trgMeta[id].genres || (Array.isArray(data.genres) ? data.genres.join(", ") : data.genres) || 'Drama',
        poster_url: ensurePosterUrl(data.poster_url || trgMeta[id].poster_url),
        backdrop_url: ensureBackdropUrl(data.backdrop_url || trgMeta[id].backdrop_url),
        overview: data.overview || trgMeta[id].overview || '',
        language: data.language || trgMeta[id].language || 'en'
      };
      
      if (existingIdx > -1) {
        moderatedTmdbMovies[existingIdx] = {
          ...moderatedTmdbMovies[existingIdx],
          ...movieObj
        };
      } else {
        moderatedTmdbMovies.push(movieObj);
      }
      localStorage.setItem('trg_moderated_tmdb_movies', JSON.stringify(moderatedTmdbMovies));
    }
    
    const db = getLocalStorageDb();
    const localMovie = db.movies.find(mov => cleanMovieId(mov.tmdb_id) === id || cleanMovieId(mov.id) === id);
    if (localMovie) {
      return overlayModeratorStats(localMovie, db);
    }
    
    return {
      tmdb_id: id,
      ...trgMeta[id]
    };
  },
  getAllMovies: () => {
    const db = getLocalStorageDb();
    const moderatedTmdbMovies = JSON.parse(localStorage.getItem('trg_moderated_tmdb_movies')) || [];
    
    const localMovies = db.movies.map(m => overlayModeratorStats(m, db));
    const moderatedTmdb = moderatedTmdbMovies.map(m => overlayModeratorStats(m, db));
    
    const merged = [...localMovies];
    const localTmdbIds = new Set(localMovies.map(m => cleanMovieId(m.tmdb_id)).filter(id => id));
    
    moderatedTmdb.forEach(m => {
      const mTmdbId = cleanMovieId(m.tmdb_id);
      if (mTmdbId && !localTmdbIds.has(mTmdbId)) {
        merged.push(m);
      }
    });
    
    return merged;
  }
};

// API calls mapping with dynamic fallback
export const apiService = {
  getTrending: async () => {
    try {
      const response = await api.get(`/api/movies/trending?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      console.warn('Flask server offline, falling back to LocalStorage DB.');
      return localFallback.getTrending();
    }
  },
  getUpcoming: async () => {
    try {
      const response = await api.get(`/api/movies/upcoming?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localFallback.getUpcoming();
    }
  },
  getNowPlaying: async () => {
    try {
      const response = await api.get(`/api/movies/now-playing?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localFallback.getNowPlaying();
    }
  },
  getTopRated: async () => {
    try {
      const response = await api.get(`/api/movies/top-rated?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localFallback.getTopRated();
    }
  },
  getMostWatched: async () => {
    try {
      const response = await api.get(`/api/movies/most-watched?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localFallback.getMostWatched();
    }
  },
  searchMovies: async (query) => {
    try {
      const response = await api.get(`/api/movies/search?q=${encodeURIComponent(query)}&fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localFallback.search(query);
    }
  },
  getMovieDetails: async (id) => {
    try {
      const response = await api.get(`/api/movie/${id}?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localFallback.getMovie(id);
    }
  },
  importMovie: async (movieData) => {
    try {
      const response = await api.post('/api/movie/import', { tmdb_id: movieData.tmdb_id });
      return response.data;
    } catch (e) {
      return localFallback.importMovie(movieData);
    }
  },
  addMovie: async (movieData) => {
    try {
      const response = await api.post('/api/movies', movieData);
      return response.data;
    } catch (e) {
      return localFallback.addMovie(movieData);
    }
  },
  rateMovie: async (id, rating) => {
    try {
      const response = await api.post(`/api/movie/${id}/rate`, { rating, fingerprint });
      return response.data;
    } catch (e) {
      return localFallback.rate(id, rating);
    }
  },
  addReview: async (id, reviewText) => {
    try {
      const response = await api.post(`/api/movie/${id}/review`, { review_text: reviewText, fingerprint });
      return response.data;
    } catch (e) {
      return localFallback.review(id, reviewText);
    }
  },
  toggleWatched: async (id) => {
    try {
      const response = await api.post(`/api/movie/${id}/watched`, { fingerprint });
      return response.data;
    } catch (e) {
      return localFallback.toggleWatched(id);
    }
  },
  toggleWatchLater: async (id) => {
    try {
      const response = await api.post(`/api/movie/${id}/watch-later`, { fingerprint });
      return response.data;
    } catch (e) {
      return localFallback.toggleWatchLater(id);
    }
  },
  getUserWatchLater: async () => {
    try {
      const response = await api.get(`/api/user/watch-later?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localFallback.getWatchLater();
    }
  },
  getUserStats: async () => {
    try {
      const response = await api.get(`/api/user/stats?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localFallback.getStats();
    }
  },
  getFeaturedMovie: async () => {
    try {
      const response = await api.get('/api/movie/featured');
      return response.data;
    } catch (e) {
      return localFallback.getFeaturedMovie();
    }
  },
  setFeaturedMovie: async (movieId, shortVerdict) => {
    try {
      const response = await api.post('/api/movie/featured', { movie_id: movieId, short_verdict: shortVerdict });
      return response.data;
    } catch (e) {
      return localFallback.setFeaturedMovie(movieId, shortVerdict);
    }
  },
  removeFeaturedMovie: async () => {
    try {
      const response = await api.delete('/api/movie/featured');
      return response.data;
    } catch (e) {
      return localFallback.removeFeaturedMovie();
    }
  },
  getFeaturedTvShow: async () => {
    const featuredStr = localStorage.getItem('trg_featured_tv_show');
    if (!featuredStr) return null;
    const featured = JSON.parse(featuredStr);
    const db = getLocalStorageDb();
    const cleanId = cleanTvId(featured.tv_show_id);
    let baseShow = db.tvShows.find(s => cleanTvId(s.tmdb_id) === cleanId || cleanTvId(s.id) === cleanId);
    if (!baseShow && cleanId) {
      const trgMeta = JSON.parse(localStorage.getItem('trg_tv_moderator_metadata')) || {};
      const customMeta = trgMeta[cleanId];
      if (customMeta) {
        baseShow = {
          tmdb_id: cleanId,
          ...customMeta
        };
      }
    }
    if (!baseShow) return null;
    const overlaid = overlayTvModeratorStats(baseShow, db);
    return {
      ...overlaid,
      short_verdict: featured.short_verdict
    };
  },
  setFeaturedTvShow: async (showId, shortVerdict) => {
    if (!showId) {
      localStorage.removeItem('trg_featured_tv_show');
      return null;
    }
    const cleanId = cleanTvId(showId);
    const featured = { tv_show_id: cleanId, short_verdict: shortVerdict };
    localStorage.setItem('trg_featured_tv_show', JSON.stringify(featured));
    return { ...featured, active: true };
  },
  removeFeaturedTvShow: async () => {
    localStorage.removeItem('trg_featured_tv_show');
    return { success: true };
  },
  saveTrgStats: async (movieId, rating, reviewText) => {
    try {
      const response = await api.post(`/api/movie/${movieId}/trg`, { rating, review_text: reviewText });
      return response.data;
    } catch (e) {
      return localFallback.saveTrgStats(movieId, rating, reviewText);
    }
  },
  deleteMovie: async (movieId) => {
    try {
      const response = await api.delete(`/api/movie/${movieId}`);
      return response.data;
    } catch (e) {
      return localFallback.deleteMovie(movieId);
    }
  },
  updateMovieMetadata: async (movieId, data) => {
    try {
      const response = await api.put(`/api/movie/${movieId}/metadata`, data);
      return response.data;
    } catch (e) {
      return localFallback.updateMovieMetadata(movieId, data);
    }
  },
  getAllMovies: async () => {
    try {
      const response = await api.get(`/api/movies/top-rated?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localFallback.getAllMovies();
    }
  },
  getMovieTrailer: async (id) => {
    try {
      const response = await api.get(`/api/movie/${id}/trailer`);
      return response.data;
    } catch (e) {
      const db = getLocalStorageDb();
      const movie = db.movies.find(m => String(m.id) === String(id) || String(m.tmdb_id) === String(id));
      if (movie && movie.tmdb_id) {
        const url = await tmdbClient.getTrailerUrl('movie', movie.tmdb_id);
        return { trailer_url: url };
      }
      return { trailer_url: null };
    }
  },
  
  // TV Shows APIs
  getTvTrending: async () => {
    try {
      const response = await api.get(`/api/tv/trending?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.getTrending();
    }
  },
  getTvPopular: async () => {
    try {
      const response = await api.get(`/api/tv/popular?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.getPopular();
    }
  },
  getTvTopRated: async () => {
    try {
      const response = await api.get(`/api/tv/top-rated?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.getTopRated();
    }
  },
  getTvAiringToday: async () => {
    try {
      const response = await api.get(`/api/tv/airing-today?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.getAiringToday();
    }
  },
  getTvOnTheAir: async () => {
    try {
      const response = await api.get(`/api/tv/on-the-air?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.getOnTheAir();
    }
  },
  discoverTvShows: async (genreId) => {
    try {
      const response = await api.get(`/api/tv/discover?genre_id=${genreId || ''}&fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.discover(genreId);
    }
  },
  searchTvShows: async (query) => {
    try {
      const response = await api.get(`/api/tv/search?q=${encodeURIComponent(query)}&fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.search(query);
    }
  },
  getTvShowDetails: async (id) => {
    try {
      const response = await api.get(`/api/tv/${id}?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.getShow(id);
    }
  },
  getTvSeasonDetails: async (id, seasonNumber) => {
    try {
      const response = await api.get(`/api/tv/${id}/season/${seasonNumber}`);
      return response.data;
    } catch (e) {
      return localTvFallback.getSeasonDetails(id, seasonNumber);
    }
  },
  rateTvShow: async (id, rating) => {
    try {
      const response = await api.post(`/api/tv/${id}/rate`, { rating, fingerprint });
      return response.data;
    } catch (e) {
      return localTvFallback.rate(id, rating);
    }
  },
  addTvReview: async (id, reviewText) => {
    try {
      const response = await api.post(`/api/tv/${id}/review`, { review_text: reviewText, fingerprint });
      return response.data;
    } catch (e) {
      return localTvFallback.review(id, reviewText);
    }
  },
  toggleTvWatched: async (id) => {
    try {
      const response = await api.post(`/api/tv/${id}/watched`, { fingerprint });
      return response.data;
    } catch (e) {
      return localTvFallback.toggleTvWatched(id);
    }
  },
  toggleTvWatchLater: async (id) => {
    try {
      const response = await api.post(`/api/tv/${id}/watch-later`, { fingerprint });
      return response.data;
    } catch (e) {
      return localTvFallback.toggleTvWatchLater(id);
    }
  },
  getUserTvWatchLater: async () => {
    try {
      const response = await api.get(`/api/tv/watch-later?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.getWatchLater();
    }
  },
  saveTrgTvStats: async (showId, rating, reviewText) => {
    try {
      const response = await api.post(`/api/tv/${showId}/trg`, { rating, review_text: reviewText });
      return response.data;
    } catch (e) {
      return localTvFallback.saveTrgStats(showId, rating, reviewText);
    }
  },
  updateTvMetadata: async (showId, data) => {
    try {
      const response = await api.put(`/api/tv/${showId}/metadata`, data);
      return response.data;
    } catch (e) {
      return localTvFallback.updateTvMetadata(showId, data);
    }
  },
  getAllTvShows: async () => {
    try {
      const response = await api.get(`/api/tv`);
      return response.data;
    } catch (e) {
      return localTvFallback.getAllTvShows();
    }
  },
  deleteTvShow: async (showId) => {
    try {
      const response = await api.delete(`/api/tv/${showId}`);
      return response.data;
    } catch (e) {
      return localTvFallback.deleteTvShow(showId);
    }
  },
  getTvTrailer: async (id) => {
    let tmdbId = cleanTvId(id);
    if (!tmdbId) {
      const db = getLocalStorageDb();
      const show = db.tvShows.find(s => String(s.id) === String(id));
      if (show) tmdbId = cleanTvId(show.tmdb_id);
    }
    if (tmdbId) {
      const url = await tmdbClient.getTrailerUrl('tv', tmdbId);
      return { trailer_url: url };
    }
    return { trailer_url: null };
  },

  // Review Requests API
  addReviewRequest: async (mediaType, tmdbId, title) => {
    try {
      const response = await api.post(`/api/review-requests`, { media_type: mediaType, tmdb_id: tmdbId, title, fingerprint });
      return response.data;
    } catch (e) {
      return localTvFallback.addReviewRequest(mediaType, tmdbId, title);
    }
  },
  getReviewRequestCount: async (mediaType, tmdbId) => {
    try {
      const response = await api.get(`/api/review-requests/${mediaType}/${tmdbId}?fingerprint=${fingerprint}`);
      return response.data;
    } catch (e) {
      return localTvFallback.getReviewRequestCount(mediaType, tmdbId);
    }
  },
  getReviewRequestsStats: async () => {
    try {
      const response = await api.get(`/api/review-requests/stats`);
      return response.data;
    } catch (e) {
      return localTvFallback.getReviewRequestsStats();
    }
  },
  manageReviewRequests: async (action, mediaType, tmdbId) => {
    try {
      const response = await api.post(`/api/review-requests/manage`, { action, media_type: mediaType, tmdb_id: tmdbId });
      return response.data;
    } catch (e) {
      return localTvFallback.manageReviewRequests(action, mediaType, tmdbId);
    }
  },
  
  // ==========================================
  // PHASE 3 PREMIUM COMMUNITY FEATURES API
  // ==========================================
  
  isModeratorLoggedIn: () => {
    return sessionStorage.getItem('trg_mod_authenticated') === 'true';
  },
  
  loginModerator: async (username, password) => {
    if (username === 'admin' && password === 'trg_secure_pass_2026') {
      sessionStorage.setItem('trg_mod_authenticated', 'true');
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  },
  
  logoutModerator: async () => {
    sessionStorage.removeItem('trg_mod_authenticated');
    return { success: true };
  },
  
  getAnnouncements: async () => {
    const db = getLocalStorageDb();
    const today = new Date().toISOString().split('T')[0];
    return (db.announcements || []).filter(ann => !ann.expiryDate || ann.expiryDate >= today);
  },
  
  saveAnnouncement: async (ann) => {
    const db = getLocalStorageDb();
    if (!db.announcements) db.announcements = [];
    if (ann.id) {
      db.announcements = db.announcements.map(a => a.id === ann.id ? ann : a);
    } else {
      ann.id = Date.now().toString();
      db.announcements.push(ann);
    }
    saveLocalStorageDb(db);
    return ann;
  },
  
  deleteAnnouncement: async (id) => {
    const db = getLocalStorageDb();
    db.announcements = (db.announcements || []).filter(a => a.id !== id);
    saveLocalStorageDb(db);
    return { success: true };
  },
  
  getHomepageSections: async () => {
    const db = getLocalStorageDb();
    if (!db.homepageSections) {
      db.homepageSections = [
        { id: "announcements", title: "Announcements", enabled: true, order: 0, pins: [], exclusions: [] },
        { id: "upcoming", title: "Upcoming Movies In India", enabled: true, order: 1, pins: [], exclusions: [] },
        { id: "trending", title: "Trending Now", enabled: true, order: 2, pins: [], exclusions: [] },
        { id: "nowPlaying", title: "Now Playing In Theaters", enabled: true, order: 3, pins: [], exclusions: [] },
        { id: "topRated", title: "Top Rated By Community", enabled: true, order: 4, pins: [], exclusions: [] },
        { id: "mostWatched", title: "Most Watched Movies", enabled: true, order: 5, pins: [], exclusions: [] },
        { id: "trgPicks", title: "The Review Guy Recommends", enabled: true, order: 6, pins: [], exclusions: [] },
        { id: "movieBattles", title: "Movie Battles", enabled: true, order: 7, pins: [], exclusions: [] }
      ];
      saveLocalStorageDb(db);
    }
    return db.homepageSections.map(s => ({
      ...s,
      pins: s.pins || [],
      exclusions: s.exclusions || []
    })).sort((a, b) => a.order - b.order);
  },
  
  saveHomepageSections: async (sections) => {
    const db = getLocalStorageDb();
    db.homepageSections = sections.map(s => ({
      ...s,
      pins: s.pins || [],
      exclusions: s.exclusions || []
    }));
    saveLocalStorageDb(db);
    return db.homepageSections;
  },

  getTvHomepageSections: async () => {
    const db = getLocalStorageDb();
    if (!db.tvHomepageSections) {
      db.tvHomepageSections = [
        { id: "announcements", title: "Announcements", enabled: true, order: 0, pins: [], exclusions: [] },
        { id: "trending", title: "Trending Now", enabled: true, order: 1, pins: [], exclusions: [] },
        { id: "popular", title: "Popular TV Shows", enabled: true, order: 2, pins: [], exclusions: [] },
        { id: "topRated", title: "Top Rated By Community", enabled: true, order: 3, pins: [], exclusions: [] },
        { id: "airingToday", title: "Airing Today", enabled: true, order: 4, pins: [], exclusions: [] },
        { id: "onTheAir", title: "Currently Airing", enabled: true, order: 5, pins: [], exclusions: [] },
        { id: "trgPicks", title: "The Review Guy Recommends", enabled: true, order: 6, pins: [], exclusions: [] }
      ];
      saveLocalStorageDb(db);
    }
    return db.tvHomepageSections.map(s => ({
      ...s,
      pins: s.pins || [],
      exclusions: s.exclusions || []
    })).sort((a, b) => a.order - b.order);
  },

  saveTvHomepageSections: async (sections) => {
    const db = getLocalStorageDb();
    db.tvHomepageSections = sections.map(s => ({
      ...s,
      pins: s.pins || [],
      exclusions: s.exclusions || []
    }));
    saveLocalStorageDb(db);
    return db.tvHomepageSections;
  },
  
  getTop10Rankings: async () => {
    const db = getLocalStorageDb();
    return (db.top10 || DEFAULT_TOP_10).sort((a, b) => a.rank - b.rank);
  },
  
  saveTop10Rankings: async (rankings) => {
    const db = getLocalStorageDb();
    db.top10 = rankings;
    saveLocalStorageDb(db);
    return rankings;
  },
  
  getMovieBattles: async () => {
    const db = getLocalStorageDb();
    return db.movieBattles || [];
  },
  
  saveMovieBattle: async (battle) => {
    const db = getLocalStorageDb();
    if (!db.movieBattles) db.movieBattles = [];
    if (battle.id) {
      db.movieBattles = db.movieBattles.map(b => b.id === battle.id ? battle : b);
    } else {
      battle.id = Date.now().toString();
      battle.votes1 = [];
      battle.votes2 = [];
      db.movieBattles.push(battle);
    }
    saveLocalStorageDb(db);
    return battle;
  },
  
  deleteMovieBattle: async (id) => {
    const db = getLocalStorageDb();
    db.movieBattles = (db.movieBattles || []).filter(b => b.id !== id);
    saveLocalStorageDb(db);
    return { success: true };
  },
  
  voteMovieBattle: async (battleId, movieIndex) => {
    const db = getLocalStorageDb();
    const battle = db.movieBattles.find(b => b.id === battleId);
    if (!battle) throw new Error('Battle not found');
    
    if (!battle.votes1) battle.votes1 = [];
    if (!battle.votes2) battle.votes2 = [];
    
    if (battle.votes1.includes(fingerprint) || battle.votes2.includes(fingerprint)) {
      return battle;
    }
    
    if (movieIndex === 1) {
      battle.votes1.push(fingerprint);
    } else {
      battle.votes2.push(fingerprint);
    }
    
    db.movieBattles = db.movieBattles.map(b => b.id === battleId ? battle : b);
    saveLocalStorageDb(db);
    return battle;
  },
  
  getCollections: async () => {
    const db = getLocalStorageDb();
    return db.movieCollections || [];
  },
  
  saveCollection: async (col) => {
    const db = getLocalStorageDb();
    if (!db.movieCollections) db.movieCollections = [];
    if (col.id) {
      db.movieCollections = db.movieCollections.map(c => c.id === col.id ? col : c);
    } else {
      col.id = Date.now().toString();
      db.movieCollections.push(col);
    }
    saveLocalStorageDb(db);
    return col;
  },
  
  deleteCollection: async (id) => {
    const db = getLocalStorageDb();
    db.movieCollections = (db.movieCollections || []).filter(c => c.id !== id);
    saveLocalStorageDb(db);
    return { success: true };
  },
  
  getHiddenMovies: async () => {
    const db = getLocalStorageDb();
    return db.hiddenMovies || [];
  },
  
  toggleHiddenMovie: async (movieId) => {
    const db = getLocalStorageDb();
    const id = cleanMovieId(movieId);
    if (!db.hiddenMovies) db.hiddenMovies = [];
    if (db.hiddenMovies.includes(id)) {
      db.hiddenMovies = db.hiddenMovies.filter(x => x !== id);
    } else {
      db.hiddenMovies.push(id);
    }
    saveLocalStorageDb(db);
    return db.hiddenMovies;
  },
  
  getRecommendedMovies: async () => {
    const db = getLocalStorageDb();
    return db.recommends || [];
  },
  
  toggleRecommendedMovie: async (movieId) => {
    const db = getLocalStorageDb();
    const id = cleanMovieId(movieId);
    if (!db.recommends) db.recommends = [];
    if (db.recommends.includes(id)) {
      db.recommends = db.recommends.filter(x => x !== id);
    } else {
      db.recommends.push(id);
    }
    saveLocalStorageDb(db);
    return db.recommends;
  },
  
  getAdminAnalytics: async () => {
    let allMovies = [];
    try {
      allMovies = await apiService.getAllMovies();
    } catch (e) {
      allMovies = localFallback.getAllMovies();
    }
    
    let featuredMovie = null;
    try {
      featuredMovie = await apiService.getFeaturedMovie();
    } catch (e) {}

    const db = getLocalStorageDb();
    const totalMovies = allMovies.length;
    
    let totalRatings = 0;
    let totalWatches = 0;
    let mostRated = null;
    let mostWatched = null;
    let highestTrg = null;
    let mostRecommended = null;

    allMovies.forEach(m => {
      const trgRating = m.trg_rating;
      const totalRatingsCount = m.total_ratings || 0;
      const watchCountVal = m.watch_count || 0;

      totalRatings += totalRatingsCount;
      totalWatches += watchCountVal;

      if (!mostRated || totalRatingsCount > (mostRated.total_ratings || 0)) {
        mostRated = m;
      }
      if (!mostWatched || watchCountVal > (mostWatched.watch_count || 0)) {
        mostWatched = m;
      }
      if (trgRating !== null && trgRating !== undefined) {
        if (!highestTrg || parseFloat(trgRating) > parseFloat(highestTrg.trg_rating)) {
          highestTrg = m;
        }
      }
      if (m.recommendation_percentage !== undefined && totalRatingsCount > 0) {
        if (!mostRecommended || m.recommendation_percentage > mostRecommended.recommendation_percentage) {
          mostRecommended = m;
        }
      }
    });

    let totalReviews = 0;
    try {
      const detailsList = await Promise.all(
        allMovies.map(m => apiService.getMovieDetails(m.tmdb_id ? `ext_${m.tmdb_id}` : m.id))
      );
      detailsList.forEach(d => {
        if (d && d.reviews) {
          totalReviews += d.reviews.length;
        }
      });
    } catch (err) {
      totalReviews = (db.reviews || []).length;
    }

    const today = new Date().toISOString().split('T')[0];
    const activeBattle = (db.movieBattles || []).find(b => {
      return (!b.startDate || b.startDate <= today) && (!b.endDate || b.endDate >= today);
    }) || null;

    const featuredCollection = (db.movieCollections || [])[0] || null;

    return {
      totalMovies,
      totalRatings: totalRatings || (db.ratings || []).length,
      totalReviews,
      totalWatchCount: totalWatches || (db.watched || []).length,
      mostRatedMovie: mostRated,
      highestTrgRatedMovie: highestTrg,
      mostWatchedMovie: mostWatched,
      mostRecommendedMovie: mostRecommended || mostRated,
      activeMovieBattle: activeBattle,
      movieOfTheWeek: featuredMovie,
      featuredCollection
    };
  }
};
