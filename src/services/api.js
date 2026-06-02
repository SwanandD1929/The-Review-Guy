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

const API_BASE_URL = 'http://localhost:5000';
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
    "poster_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E7vNIvXT8StmQj2J5A.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/xJHok2Ja57jF97nU74v21tG6eGu.jpg",
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
    "poster_url": "https://image.tmdb.org/t/p/w500/o01vCoZSZgGBbb3622egR2QJyvL.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/s3TBr7xHhua6d1IL6qn9qyLM2iY.jpg",
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
    "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tWGBbeZu6SndzScJj648tK1t.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/nMKdUUepdz876F9vj6Pz9t4kC61.jpg",
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
    "poster_url": "https://image.tmdb.org/t/p/w500/d5N0Gego0mwtjBD5V27tIcln36t.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/lz7UB1Qv8ncsG27XlRoxlW249vO.jpg",
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
    "poster_url": "https://image.tmdb.org/t/p/w500/uE796BhRlFLgD3t3g6rn2G6X7rn.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/2wPtwgZ470Srkz1q7mHwXhA0G0p.jpg",
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
const getLocalStorageDb = () => {
  let movies = JSON.parse(localStorage.getItem('trg_movies'));
  let ratings = JSON.parse(localStorage.getItem('trg_ratings'));
  let reviews = JSON.parse(localStorage.getItem('trg_reviews'));
  let watched = JSON.parse(localStorage.getItem('trg_watched'));
  let watchLater = JSON.parse(localStorage.getItem('trg_watch_later'));

  if (!movies) {
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

  return { movies, ratings, reviews, watched, watchLater };
};

const saveLocalStorageDb = (db) => {
  localStorage.setItem('trg_movies', JSON.stringify(db.movies));
  localStorage.setItem('trg_ratings', JSON.stringify(db.ratings));
  localStorage.setItem('trg_reviews', JSON.stringify(db.reviews));
  localStorage.setItem('trg_watched', JSON.stringify(db.watched));
  localStorage.setItem('trg_watch_later', JSON.stringify(db.watchLater));
};

const getFallbackStats = (movieId, fingerprint, db) => {
  const ratings = db.ratings.filter(r => r.movie_id === movieId);
  const total = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const avg = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0.0;
  
  const highRatings = ratings.filter(r => r.rating >= 7).length;
  const recPct = total > 0 ? Math.round((highRatings / total) * 100) : 0;
  
  const watches = db.watched.filter(w => w.movie_id === movieId).length;
  const reviewCount = db.reviews.filter(r => r.movie_id === movieId).length;
  
  const userRating = ratings.find(r => r.fingerprint === fingerprint)?.rating || null;
  const isWatched = db.watched.some(w => w.movie_id === movieId && w.fingerprint === fingerprint);
  const isWatchLater = db.watchLater.some(wl => wl.movie_id === movieId && wl.fingerprint === fingerprint);

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

// Fallback Services mimicking backend
const localFallback = {
  getTrending: () => {
    const db = getLocalStorageDb();
    return db.movies.map(m => ({
      ...m,
      ...getFallbackStats(m.id, fingerprint, db),
      local_id: m.id
    }));
  },
  getUpcoming: () => {
    const db = getLocalStorageDb();
    return db.movies.slice(0, 4).map(m => ({
      ...m,
      ...getFallbackStats(m.id, fingerprint, db),
      local_id: m.id
    }));
  },
  getNowPlaying: () => {
    const db = getLocalStorageDb();
    return db.movies.slice(2, 5).map(m => ({
      ...m,
      ...getFallbackStats(m.id, fingerprint, db),
      local_id: m.id
    }));
  },
  getTopRated: () => {
    const db = getLocalStorageDb();
    return db.movies.map(m => ({
      ...m,
      ...getFallbackStats(m.id, fingerprint, db),
      local_id: m.id
    })).sort((a, b) => b.community_rating - a.community_rating);
  },
  getMostWatched: () => {
    const db = getLocalStorageDb();
    return db.movies.map(m => ({
      ...m,
      ...getFallbackStats(m.id, fingerprint, db),
      local_id: m.id
    })).sort((a, b) => b.watch_count - a.watch_count);
  },
  search: async (q) => {
    const db = getLocalStorageDb();
    const query = q.toLowerCase();
    const local = db.movies
      .filter(m => m.title.toLowerCase().includes(query) || m.genres.toLowerCase().includes(query))
      .map(m => ({
        ...m,
        ...getFallbackStats(m.id, fingerprint, db),
        local_id: m.id
      }));
    let tmdb = [];
    try {
      const tmdbMatches = await tmdbClient.searchMovies(q);
      const localTmdbIds = new Set(local.map(m => m.tmdb_id).filter(id => id));
      tmdb = tmdbMatches.filter(m => !localTmdbIds.has(m.tmdb_id));
    } catch (err) {
      console.error("Local fallback search TMDB error:", err);
    }
    return { local, tmdb };
  },
  getMovie: (id) => {
    const db = getLocalStorageDb();
    const m = db.movies.find(mov => mov.id === parseInt(id));
    if (!m) return null;
    const stats = getFallbackStats(m.id, fingerprint, db);
    const reviews = db.reviews.filter(r => r.movie_id === m.id).map(r => {
      const userR = db.ratings.find(rat => rat.movie_id === m.id && rat.fingerprint === r.fingerprint);
      return {
        id: r.id,
        fingerprint: r.fingerprint,
        review_text: r.review_text,
        created_at: r.created_at,
        rating: userR ? userR.rating : null
      };
    });
    return { ...m, ...stats, reviews };
  },
  importMovie: (movieData) => {
    const db = getLocalStorageDb();
    // check if tmdb_id exists
    let existing = db.movies.find(m => m.tmdb_id === movieData.tmdb_id);
    if (existing) return existing;

    const newM = {
      id: db.movies.length + 1,
      ...movieData,
      local_id: db.movies.length + 1
    };
    db.movies.push(newM);
    saveLocalStorageDb(db);
    return newM;
  },
  addMovie: (movieData) => {
    const db = getLocalStorageDb();
    let existing = db.movies.find(m => m.title.toLowerCase() === movieData.title.toLowerCase() && m.release_date === movieData.release_date);
    if (existing) return { exists: True, movie: existing };

    const newM = {
      id: db.movies.length + 1,
      ...movieData,
      poster_url: movieData.poster_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
      backdrop_url: movieData.backdrop_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600",
      local_id: db.movies.length + 1
    };
    db.movies.push(newM);
    saveLocalStorageDb(db);
    return { exists: false, movie: newM };
  },
  rate: (movieId, ratingVal) => {
    const db = getLocalStorageDb();
    const id = parseInt(movieId);
    let existing = db.ratings.find(r => r.movie_id === id && r.fingerprint === fingerprint);
    if (existing) {
      existing.rating = ratingVal;
    } else {
      db.ratings.push({ movie_id: id, fingerprint, rating: ratingVal });
    }
    saveLocalStorageDb(db);
    return { success: true };
  },
  review: (movieId, reviewText) => {
    const db = getLocalStorageDb();
    const id = parseInt(movieId);
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
    const id = parseInt(movieId);
    const index = db.watched.findIndex(w => w.movie_id === id && w.fingerprint === fingerprint);
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
    const id = parseInt(movieId);
    const index = db.watchLater.findIndex(wl => wl.movie_id === id && wl.fingerprint === fingerprint);
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
      const m = db.movies.find(mov => mov.id === item.movie_id);
      return {
        ...m,
        ...getFallbackStats(m.id, fingerprint, db),
        local_id: m.id
      };
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
  }
};
