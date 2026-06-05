import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Fallback search mocks
const SEARCH_FALLBACKS = [
  {
    "tmdb_id": 550,
    "title": "Fight Club",
    "overview": "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
    "poster_url": "https://image.tmdb.org/t/p/w500/pB8BM763kCFOCt7KCfTOfKzs7rR.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/hZup2Q3QkPP95iJ3Y74vYvGcPOK.jpg",
    "release_date": "1999-10-15",
    "genres": "Drama, Thriller",
    "language": "en"
  },
  {
    "tmdb_id": 680,
    "title": "Pulp Fiction",
    "overview": "A burger-loving hitman, his philosophical partner, a drug-addled gangster's moll, and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
    "poster_url": "https://image.tmdb.org/t/p/w500/d5i251k3CU9tIIH5G2X5VQQ16Gl.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/sua7uB1358mP066kqjuLIeD6V29.jpg",
    "release_date": "1994-09-10",
    "genres": "Thriller, Crime",
    "language": "en"
  },
  {
    "tmdb_id": 24428,
    "title": "The Avengers",
    "overview": "When an unexpected enemy emerges that threatens global safety and security, Nick Fury, Director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster. Spanning the globe, a daring recruitment effort begins...",
    "poster_url": "https://image.tmdb.org/t/p/w500/RYMX2wc7H62540y9ECuRIf2BGK.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/9BBGo6yvjX2guNja4r47a441eN2.jpg",
    "release_date": "2012-04-25",
    "genres": "Science Fiction, Action, Adventure",
    "language": "en"
  },
  {
    "tmdb_id": 603,
    "title": "The Matrix",
    "overview": "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
    "poster_url": "https://image.tmdb.org/t/p/w500/f89U3wzqrjFmZ9SgZ59qq25Pj5r.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/o56H25ntm1sH223OI8H2h48O4EG.jpg",
    "release_date": "1999-03-30",
    "genres": "Action, Science Fiction",
    "language": "en"
  }
];

const formatMovie = (m) => {
  const genres_list = [];
  if (m.genres) {
    m.genres.forEach(g => genres_list.push(g.name));
  } else if (m.genre_ids) {
    const genre_map = {
      28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
      80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
      14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
      9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
      10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
    };
    m.genre_ids.forEach(gid => {
      if (genre_map[gid]) genres_list.push(genre_map[gid]);
    });
  }

  const poster_path = m.poster_path;
  const backdrop_path = m.backdrop_path;

  return {
    tmdb_id: m.id,
    title: m.title || m.name,
    overview: m.overview,
    poster_url: poster_path ? `${IMAGE_BASE_URL}${poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
    backdrop_url: backdrop_path ? `${BACKDROP_BASE_URL}${backdrop_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600",
    release_date: m.release_date || m.first_air_date,
    genres: genres_list.join(', ') || 'Drama',
    language: m.original_language || 'en',
    community_rating: 0.0,
    recommendation_percentage: 0,
    watch_count: 0,
    local_id: null
  };
};

export const tmdbClient = {
  searchMovies: async (query) => {
    if (!TMDB_API_KEY) {
      // Return custom searches matching search query in local fallback
      const q = query.toLowerCase();
      return SEARCH_FALLBACKS.filter(m => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q));
    }
    
    try {
      const response = await axios.get(`${BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          query: query
        }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatMovie);
      }
    } catch (e) {
      console.error('TMDB Search API Error:', e);
    }
    return [];
  },

  getMovieDetails: async (tmdbId) => {
    if (!TMDB_API_KEY) {
      return SEARCH_FALLBACKS.find(m => m.tmdb_id === parseInt(tmdbId)) || null;
    }

    try {
      const response = await axios.get(`${BASE_URL}/movie/${tmdbId}`, {
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: 'credits'
        }
      });
      if (response.data) {
        const formatted = formatMovie(response.data);
        const credits = response.data.credits || {};
        const cast = credits.cast ? credits.cast.slice(0, 4).map(c => c.name).join(', ') : 'Unknown';
        const directors = credits.crew ? credits.crew.filter(c => c.job === 'Director').map(c => c.name) : [];
        
        return {
          ...formatted,
          runtime: response.data.runtime || 120,
          director: directors[0] || 'Unknown',
          cast: cast
        };
      }
    } catch (e) {
      console.error('TMDB Details API Error:', e);
    }
    return null;
  },

  getTrending: async () => {
    if (!TMDB_API_KEY) {
      return SEARCH_FALLBACKS;
    }
    try {
      const response = await axios.get(`${BASE_URL}/trending/movie/week`, {
        params: { api_key: TMDB_API_KEY }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatMovie);
      }
    } catch (e) {
      console.error('TMDB Trending API Error:', e);
    }
    return SEARCH_FALLBACKS;
  },

  getUpcoming: async () => {
    if (!TMDB_API_KEY) {
      return SEARCH_FALLBACKS.slice(0, 3);
    }
    try {
      const response = await axios.get(`${BASE_URL}/movie/upcoming`, {
        params: { api_key: TMDB_API_KEY }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatMovie);
      }
    } catch (e) {
      console.error('TMDB Upcoming API Error:', e);
    }
    return SEARCH_FALLBACKS.slice(0, 3);
  },

  getNowPlaying: async () => {
    if (!TMDB_API_KEY) {
      return SEARCH_FALLBACKS.slice(1, 4);
    }
    try {
      const response = await axios.get(`${BASE_URL}/movie/now_playing`, {
        params: { api_key: TMDB_API_KEY }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatMovie);
      }
    } catch (e) {
      console.error('TMDB Now Playing API Error:', e);
    }
    return SEARCH_FALLBACKS.slice(1, 4);
  }
};
