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
      const globalResponse = await axios.get(`${BASE_URL}/trending/movie/week`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      });
      const globalMovies = globalResponse.data?.results?.map(formatMovie) || [];
      
      const inResponse = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          region: 'IN',
          with_original_language: 'hi|te|ta|ml|kn',
          sort_by: 'popularity.desc'
        }
      });
      const inMovies = inResponse.data?.results?.map(formatMovie) || [];
      
      const rawCombined = [...globalMovies.slice(0, 16), ...inMovies.slice(0, 4)];
      const seen = new Set();
      const combined = [];
      for (const m of rawCombined) {
        if (!seen.has(m.tmdb_id)) {
          seen.add(m.tmdb_id);
          combined.push(m);
        }
      }
      if (combined.length > 0) return combined;
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
      const today = new Date().toISOString().split('T')[0];
      
      const usResponse = await axios.get(`${BASE_URL}/movie/upcoming`, {
        params: { api_key: TMDB_API_KEY, region: 'US', language: 'en-US' }
      });
      let usMovies = usResponse.data?.results?.map(formatMovie) || [];
      usMovies = usMovies.filter(m => m.release_date && m.release_date >= today);
      
      const inResponse = await axios.get(`${BASE_URL}/movie/upcoming`, {
        params: { api_key: TMDB_API_KEY, region: 'IN' }
      });
      let inMovies = inResponse.data?.results?.map(formatMovie) || [];
      const indianLangs = ['hi', 'te', 'ta', 'ml', 'kn', 'bn', 'mr', 'pa'];
      inMovies = inMovies.filter(m => m.release_date && m.release_date >= today && indianLangs.includes(m.language));
      
      const rawCombined = [...usMovies.slice(0, 16), ...inMovies.slice(0, 4)];
      const seen = new Set();
      const combined = [];
      for (const m of rawCombined) {
        if (!seen.has(m.tmdb_id)) {
          seen.add(m.tmdb_id);
          combined.push(m);
        }
      }
      if (combined.length > 0) return combined;
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
      const usResponse = await axios.get(`${BASE_URL}/movie/now_playing`, {
        params: { api_key: TMDB_API_KEY, region: 'US', language: 'en-US' }
      });
      const usMovies = usResponse.data?.results?.map(formatMovie) || [];
      
      const inResponse = await axios.get(`${BASE_URL}/movie/now_playing`, {
        params: { api_key: TMDB_API_KEY, region: 'IN' }
      });
      let inMovies = inResponse.data?.results?.map(formatMovie) || [];
      const indianLangs = ['hi', 'te', 'ta', 'ml', 'kn', 'bn', 'mr', 'pa'];
      inMovies = inMovies.filter(m => indianLangs.includes(m.language));
      
      const rawCombined = [...usMovies.slice(0, 16), ...inMovies.slice(0, 4)];
      const seen = new Set();
      const combined = [];
      for (const m of rawCombined) {
        if (!seen.has(m.tmdb_id)) {
          seen.add(m.tmdb_id);
          combined.push(m);
        }
      }
      if (combined.length > 0) return combined;
    } catch (e) {
      console.error('TMDB Now Playing API Error:', e);
    }
    return SEARCH_FALLBACKS.slice(1, 4);
  },

  discoverMovies: async (params = {}) => {
    if (!TMDB_API_KEY) {
      return SEARCH_FALLBACKS;
    }
    try {
      const response = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          ...params
        }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatMovie);
      }
    } catch (e) {
      console.error('TMDB Discover API Error:', e);
    }
    return [];
  },

  getRecommendations: async (tmdbId, genreId) => {
    if (!TMDB_API_KEY) {
      return SEARCH_FALLBACKS;
    }
    try {
      const response = await axios.get(`${BASE_URL}/movie/${tmdbId}/recommendations`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      });
      if (response.data && response.data.results && response.data.results.length > 0) {
        return response.data.results.map(formatMovie);
      }
    } catch (e) {
      console.warn('TMDB Recommendations API Error, falling back to genre discover:', e);
    }
    // Fallback to genre discover
    if (genreId) {
      try {
        const response = await axios.get(`${BASE_URL}/discover/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            with_genres: genreId,
            sort_by: 'popularity.desc',
            'vote_count.gte': 100
          }
        });
        if (response.data && response.data.results) {
          return response.data.results.map(formatMovie).filter(m => m.tmdb_id !== tmdbId);
        }
      } catch (err) {
        console.error('TMDB Genre Fallback Error:', err);
      }
    }
    return SEARCH_FALLBACKS;
  },

  searchTvShows: async (query) => {
    if (!TMDB_API_KEY) {
      const q = query.toLowerCase();
      return TV_FALLBACKS.filter(s => s.title.toLowerCase().includes(q) || s.overview.toLowerCase().includes(q));
    }
    try {
      const response = await axios.get(`${BASE_URL}/search/tv`, {
        params: { api_key: TMDB_API_KEY, query }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatShow);
      }
    } catch (e) {
      console.error('TMDB TV Search Error:', e);
    }
    return [];
  },

  getTvDetails: async (tmdbId) => {
    if (!TMDB_API_KEY) {
      return TV_FALLBACKS.find(s => s.tmdb_id === parseInt(tmdbId)) || null;
    }
    try {
      const response = await axios.get(`${BASE_URL}/tv/${tmdbId}`, {
        params: { api_key: TMDB_API_KEY, append_to_response: 'credits' }
      });
      if (response.data) {
        const formatted = formatShow(response.data);
        const credits = response.data.credits || {};
        const cast = credits.cast ? credits.cast.slice(0, 4).map(c => c.name).join(', ') : 'Unknown';
        const creators = response.data.created_by || [];
        const creatorName = creators.length > 0 ? creators.map(c => c.name).join(', ') : 'Unknown';
        const networks = response.data.networks || [];
        const networkName = networks.length > 0 ? networks.map(n => n.name).join(', ') : 'Unknown';
        const seasons = response.data.seasons || [];
        const seasonsList = seasons.map(s => ({
          season_number: s.season_number,
          name: s.name,
          episode_count: s.episode_count,
          poster_path: s.poster_path
        }));
        return {
          ...formatted,
          number_of_seasons: response.data.number_of_seasons || 1,
          number_of_episodes: response.data.number_of_episodes || 10,
          status: response.data.status || 'Ended',
          creator: creatorName,
          cast: cast,
          last_air_date: response.data.last_air_date,
          network: networkName,
          seasons: seasonsList
        };
      }
    } catch (e) {
      console.error('TMDB TV Details Error:', e);
    }
    return null;
  },

  getTvSeasonDetails: async (tmdbId, seasonNumber) => {
    if (!TMDB_API_KEY) return null;
    try {
      const response = await axios.get(`${BASE_URL}/tv/${tmdbId}/season/${seasonNumber}`, {
        params: { api_key: TMDB_API_KEY }
      });
      if (response.data) {
        const episodes = (response.data.episodes || []).map(ep => {
          const still_path = ep.still_path;
          return {
            episode_number: ep.episode_number,
            name: ep.name,
            air_date: ep.air_date,
            overview: ep.overview,
            still_url: still_path ? `${IMAGE_BASE_URL}${still_path}` : null
          };
        });
        return {
          season_number: response.data.season_number,
          name: response.data.name,
          overview: response.data.overview,
          episodes
        };
      }
    } catch (e) {
      console.error('TMDB Season Details Error:', e);
    }
    return null;
  },

  getTvTrending: async () => {
    if (!TMDB_API_KEY) return TV_FALLBACKS;
    try {
      const globalResponse = await axios.get(`${BASE_URL}/trending/tv/week`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      });
      const globalShows = globalResponse.data?.results?.map(formatShow) || [];
      
      const inResponse = await axios.get(`${BASE_URL}/discover/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          region: 'IN',
          with_original_language: 'hi|te|ta|ml|kn',
          sort_by: 'popularity.desc'
        }
      });
      const inShows = inResponse.data?.results?.map(formatShow) || [];
      
      const rawCombined = [...globalShows.slice(0, 16), ...inShows.slice(0, 4)];
      const seen = new Set();
      const combined = [];
      for (const s of rawCombined) {
        if (!seen.has(s.tmdb_id)) {
          seen.add(s.tmdb_id);
          combined.push(s);
        }
      }
      if (combined.length > 0) return combined;
    } catch (e) {
      console.error('TMDB TV Trending Error:', e);
    }
    return TV_FALLBACKS;
  },

  getTvPopular: async () => {
    if (!TMDB_API_KEY) return TV_FALLBACKS;
    try {
      const response = await axios.get(`${BASE_URL}/tv/popular`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatShow);
      }
    } catch (e) {
      console.error('TMDB TV Popular Error:', e);
    }
    return TV_FALLBACKS;
  },

  getTvTopRated: async () => {
    if (!TMDB_API_KEY) return TV_FALLBACKS;
    try {
      const response = await axios.get(`${BASE_URL}/tv/top_rated`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatShow);
      }
    } catch (e) {
      console.error('TMDB TV Top Rated Error:', e);
    }
    return TV_FALLBACKS;
  },

  getTvAiringToday: async () => {
    if (!TMDB_API_KEY) return TV_FALLBACKS.slice(2);
    try {
      const response = await axios.get(`${BASE_URL}/tv/airing_today`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatShow);
      }
    } catch (e) {
      console.error('TMDB TV Airing Today Error:', e);
    }
    return TV_FALLBACKS.slice(2);
  },

  getTvOnTheAir: async () => {
    if (!TMDB_API_KEY) return TV_FALLBACKS.slice(0, 2);
    try {
      const response = await axios.get(`${BASE_URL}/tv/on_the_air`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatShow);
      }
    } catch (e) {
      console.error('TMDB TV On The Air Error:', e);
    }
    return TV_FALLBACKS.slice(0, 2);
  },

  discoverTvShows: async (genreId) => {
    if (!TMDB_API_KEY) return TV_FALLBACKS;
    try {
      const response = await axios.get(`${BASE_URL}/discover/tv`, {
        params: { api_key: TMDB_API_KEY, with_genres: genreId, sort_by: 'popularity.desc' }
      });
      if (response.data && response.data.results) {
        return response.data.results.map(formatShow);
      }
    } catch (e) {
      console.error('TMDB Discover TV Error:', e);
    }
    return TV_FALLBACKS;
  },

  getTvRecommendations: async (tmdbId, genreId) => {
    if (!TMDB_API_KEY) return TV_FALLBACKS;
    try {
      const response = await axios.get(`${BASE_URL}/tv/${tmdbId}/recommendations`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      });
      if (response.data && response.data.results && response.data.results.length > 0) {
        return response.data.results.map(formatShow);
      }
    } catch (e) {
      console.warn('TMDB TV Recommendations Error, falling back to genre discover:', e);
    }
    if (genreId) {
      try {
        const response = await axios.get(`${BASE_URL}/discover/tv`, {
          params: {
            api_key: TMDB_API_KEY,
            with_genres: genreId,
            sort_by: 'popularity.desc',
            'vote_count.gte': 50
          }
        });
        if (response.data && response.data.results) {
          return response.data.results.map(formatShow).filter(s => s.tmdb_id !== tmdbId);
        }
      } catch (err) {
        console.error('TMDB TV Genre Fallback Error:', err);
      }
    }
    return TV_FALLBACKS;
  },

  getTrailerUrl: async (mediaType, tmdbId) => {
    if (!TMDB_API_KEY) return null;
    try {
      const response = await axios.get(`${BASE_URL}/${mediaType}/${tmdbId}/videos`, {
        params: { api_key: TMDB_API_KEY }
      });
      if (response.data && response.data.results) {
        const trailer = response.data.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
        if (trailer) {
          return `https://www.youtube.com/watch?v=${trailer.key}`;
        }
      }
    } catch (e) {
      console.error('TMDB Videos Error:', e);
    }
    return null;
  }
};

const TV_FALLBACKS = [
  {
    "tmdb_id": 1396,
    "title": "Breaking Bad",
    "overview": "Walter White, a New Mexico chemistry teacher, learns he has stage III cancer and has been given a prognosis of two years to live. He decides he has nothing to lose. He turns to a life of crime, partnering with Jesse Pinkman to manufacture and sell methamphetamine.",
    "poster_url": "https://image.tmdb.org/t/p/w500/ztkUQv63MzC36o76t7613z5i71c.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/9faGsLEj6Z32vUj61hJyKTAxJ19.jpg",
    "release_date": "2008-01-20",
    "genres": "Drama, Crime",
    "language": "en",
    "community_rating": 0.0,
    "recommendation_percentage": 0,
    "watch_count": 0,
    "local_id": null
  },
  {
    "tmdb_id": 66732,
    "title": "Stranger Things",
    "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    "poster_url": "https://image.tmdb.org/t/p/w500/49WkfeN0mGRLYClR6uH0J07vBGt.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/56v2Kj2qL524rmgU6WgZJy8i7Zq.jpg",
    "release_date": "2016-07-15",
    "genres": "Sci-Fi & Fantasy, Mystery, Drama",
    "language": "en",
    "community_rating": 0.0,
    "recommendation_percentage": 0,
    "watch_count": 0,
    "local_id": null
  },
  {
    "tmdb_id": 1399,
    "title": "Game of Thrones",
    "overview": "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
    "poster_url": "https://image.tmdb.org/t/p/w500/1XS1JmqxZCC6hE5H0jG3jGggnLJ.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/z55QXt0144h2b45e998e1m8a2ec.jpg",
    "release_date": "2011-04-17",
    "genres": "Sci-Fi & Fantasy, Drama, Action & Adventure",
    "language": "en",
    "community_rating": 0.0,
    "recommendation_percentage": 0,
    "watch_count": 0,
    "local_id": null
  },
  {
    "tmdb_id": 19885,
    "title": "Sherlock",
    "overview": "A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.",
    "poster_url": "https://image.tmdb.org/t/p/w500/f9zGxLHkJ13347S76A56M367JbA.jpg",
    "backdrop_url": "https://image.tmdb.org/t/p/original/o8wQcR2b0K98H6SgU9aQj24M7fB.jpg",
    "release_date": "2010-07-25",
    "genres": "Drama, Crime, Mystery",
    "language": "en",
    "community_rating": 0.0,
    "recommendation_percentage": 0,
    "watch_count": 0,
    "local_id": null
  }
];

const formatShow = (s) => {
  const genres_list = [];
  if (s.genres) {
    s.genres.forEach(g => genres_list.push(g.name));
  } else if (s.genre_ids) {
    const genre_map = {
      10759: "Action & Adventure", 16: "Animation", 35: "Comedy",
      80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
      10762: "Kids", 9648: "Mystery", 10763: "News", 10764: "Reality",
      10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk",
      10768: "War & Politics", 37: "Western"
    };
    s.genre_ids.forEach(gid => {
      if (genre_map[gid]) genres_list.push(genre_map[gid]);
    });
  }

  const poster_path = s.poster_path;
  const backdrop_path = s.backdrop_path;

  return {
    tmdb_id: s.id,
    title: s.name || s.title || s.original_name,
    overview: s.overview,
    poster_url: poster_path ? `${IMAGE_BASE_URL}${poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
    backdrop_url: backdrop_path ? `${BACKDROP_BASE_URL}${backdrop_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600",
    release_date: s.first_air_date || s.release_date,
    genres: genres_list.join(', ') || 'Drama',
    language: s.original_language || 'en',
    community_rating: 0.0,
    recommendation_percentage: 0,
    watch_count: 0,
    local_id: null
  };
};

