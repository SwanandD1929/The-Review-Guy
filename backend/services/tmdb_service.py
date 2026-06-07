import os
import requests
import urllib3
import time
from dotenv import load_dotenv

# Suppress InsecureRequestWarning when using verify=False
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Find .env in project root relative to this file
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(base_dir, '.env')
load_dotenv(dotenv_path)

TMDB_API_KEY = os.getenv('TMDB_API_KEY') or os.getenv('VITE_TMDB_API_KEY')
BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original"

# Rich seed/fallback dataset representing popular movies
MOCK_MOVIES = [
    {
        "id": 157336,
        "title": "Interstellar",
        "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        "poster_url": "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/2ssWTSVklAEc98frZUQhgtGHx7s.jpg",
        "release_date": "2014-11-05",
        "genres": "Adventure, Drama, Science Fiction",
        "language": "en",
        "vote_average": 8.4,
        "runtime": 169,
        "director": "Christopher Nolan",
        "cast": "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine"
    },
    {
        "id": 27205,
        "title": "Inception",
        "overview": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
        "poster_url": "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "release_date": "2010-07-15",
        "genres": "Action, Science Fiction, Adventure",
        "language": "en",
        "vote_average": 8.3,
        "runtime": 148,
        "director": "Christopher Nolan",
        "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Elliot Page"
    },
    {
        "id": 155,
        "title": "The Dark Knight",
        "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
        "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
        "release_date": "2008-07-16",
        "genres": "Drama, Action, Crime, Thriller",
        "language": "en",
        "vote_average": 8.5,
        "runtime": 152,
        "director": "Christopher Nolan",
        "cast": "Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine"
    },
    {
        "id": 438631,
        "title": "Dune",
        "overview": "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people. As malevolent forces explode into conflict over the planet's exclusive supply of the most precious resource in existence-a commodity capable of unlocking humanity's greatest potential-only those who can conquer their fear will survive.",
        "poster_url": "https://image.tmdb.org/t/p/w500/gDzOcq0pfeCeqMBwKIJlSmQpjkZ.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/zRKQW58MBEY078AxkHxEJzUskCl.jpg",
        "release_date": "2021-09-15",
        "genres": "Science Fiction, Adventure",
        "language": "en",
        "vote_average": 7.8,
        "runtime": 155,
        "director": "Denis Villeneuve",
        "cast": "Timothée Chalamet, Rebecca Ferguson, Oscar Isaac, Josh Brolin"
    },
    {
        "id": 507086,
        "title": "Jurassic World Dominion",
        "overview": "Four years after Isla Nublar was destroyed, dinosaurs now live—and hunt—alongside humans all over the world. This fragile balance will reshape the future and determine, once and for all, whether human beings are to remain the apex predators on a planet they now share with history's most fearsome creatures.",
        "poster_url": "https://image.tmdb.org/t/p/w500/jbAvCACjLf1ZG0unB2tdmx5HAf1.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/698FjyzLdpgXmUSr63LaRwblTmx.jpg",
        "release_date": "2022-06-01",
        "genres": "Adventure, Action, Science Fiction",
        "language": "en",
        "vote_average": 6.9,
        "runtime": 147,
        "director": "Colin Trevorrow",
        "cast": "Chris Pratt, Bryce Dallas Howard, Laura Dern, Sam Neill"
    },
    {
        "id": 579974,
        "title": "RRR",
        "overview": "A fictional history of two legendary revolutionaries' journey away from home before they began fighting for their country in the 1920s.",
        "poster_url": "https://image.tmdb.org/t/p/w500/u0XUBNQWlOvrh0Gd97ARGpIkL0.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/i0Y0wP8H6SRgjr6QmuwbtQbS24D.jpg",
        "release_date": "2022-03-24",
        "genres": "Action, Drama",
        "language": "te",
        "vote_average": 7.8,
        "runtime": 187,
        "director": "S. S. Rajamouli",
        "cast": "N. T. Rama Rao Jr., Ram Charan, Ajay Devgn, Alia Bhatt"
    },
    {
        "id": 299536,
        "title": "Avengers: Infinity War",
        "overview": "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.",
        "poster_url": "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
        "release_date": "2018-04-25",
        "genres": "Adventure, Action, Science Fiction",
        "language": "en",
        "vote_average": 8.3,
        "runtime": 149,
        "director": "Anthony Russo",
        "cast": "Robert Downey Jr., Chris Hemsworth, Mark Ruffalo, Chris Evans"
    },
    {
        "id": 496243,
        "title": "Parasite",
        "overview": "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
        "poster_url": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
        "release_date": "2019-05-30",
        "genres": "Comedy, Thriller, Drama",
        "language": "ko",
        "vote_average": 8.5,
        "runtime": 132,
        "director": "Bong Joon Ho",
        "cast": "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik"
    }
]

def make_request(path, params=None):
    if not TMDB_API_KEY:
        return None
    url = f"{BASE_URL}{path}"
    payload = {"api_key": TMDB_API_KEY}
    if params:
        payload.update(params)
        
    max_retries = 3
    retry_delay = 0.5
    
    for attempt in range(1, max_retries + 1):
        try:
            # Bypassing SSL verification is highly recommended for local development to prevent WinError 10054 connection reset errors
            response = requests.get(url, params=payload, timeout=5, verify=False)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Attempt {attempt}/{max_retries}: TMDB API request failed for {path} with status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Attempt {attempt}/{max_retries}: TMDB connection error for {path}: {e}")
        
        if attempt < max_retries:
            time.sleep(retry_delay)
            
    return None

def format_tmdb_movie(m):
    genres_list = []
    # If genre_ids are present, map them or just use a generic mapper, otherwise details endpoint returns genres directly as objects
    if 'genres' in m:
        genres_list = [g['name'] for g in m['genres']]
    elif 'genre_ids' in m:
        # Simple mapper for standard TMDB genres
        genre_map = {
            28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
            80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
            14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
            9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
            10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
        }
        genres_list = [genre_map.get(gid, "Drama") for gid in m['genre_ids']]
    
    poster_path = m.get('poster_path')
    backdrop_path = m.get('backdrop_path')
    
    return {
        "tmdb_id": m.get('id'),
        "title": m.get('title') or m.get('name'),
        "overview": m.get('overview'),
        "poster_url": f"{IMAGE_BASE_URL}{poster_path}" if poster_path else "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
        "backdrop_url": f"{BACKDROP_BASE_URL}{backdrop_path}" if backdrop_path else "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600",
        "release_date": m.get('release_date') or m.get('first_air_date'),
        "genres": ", ".join(genres_list) if genres_list else "Drama",
        "language": m.get('original_language', 'en'),
        "vote_average": m.get('vote_average')
    }

def get_trending():
    global_data = make_request("/trending/movie/week", {"language": "en-US"})
    global_movies = [format_tmdb_movie(m) for m in global_data['results']] if global_data and 'results' in global_data else []
    if not global_movies:
        global_movies = [m for m in MOCK_MOVIES]
    
    in_data = make_request("/discover/movie", {"region": "IN", "with_original_language": "hi|te|ta|ml|kn", "sort_by": "popularity.desc"})
    in_movies = [format_tmdb_movie(m) for m in in_data['results']] if in_data and 'results' in in_data else []
    
    raw_combined = global_movies[:16] + in_movies[:4]
    seen = set()
    combined = []
    for m in raw_combined:
        tid = m.get('tmdb_id')
        if tid not in seen:
            seen.add(tid)
            combined.append(m)
    return combined if combined else [m for m in MOCK_MOVIES]

def get_upcoming():
    from datetime import date
    today = date.today().isoformat()
    
    us_data = make_request("/movie/upcoming", {"language": "en-US"})
    us_movies = [format_tmdb_movie(m) for m in us_data['results']] if us_data and 'results' in us_data else []
    us_movies = [m for m in us_movies if m.get('release_date') and m.get('release_date') >= today]
    if not us_movies:
        us_movies = [m for m in MOCK_MOVIES[3:7]]
    
    in_data = make_request("/movie/upcoming", {"region": "IN"})
    in_movies = [format_tmdb_movie(m) for m in in_data['results']] if in_data and 'results' in in_data else []
    indian_langs = {'hi', 'te', 'ta', 'ml', 'kn', 'bn', 'mr', 'pa'}
    in_movies = [m for m in in_movies if m.get('release_date') and m.get('release_date') >= today and m.get('language') in indian_langs]
    
    raw_combined = us_movies[:16] + in_movies[:4]
    seen = set()
    combined = []
    for m in raw_combined:
        tid = m.get('tmdb_id')
        if tid not in seen:
            seen.add(tid)
            combined.append(m)
    return combined if combined else [m for m in MOCK_MOVIES[3:7]]

def get_now_playing():
    us_data = make_request("/movie/now_playing", {"language": "en-US"})
    us_movies = [format_tmdb_movie(m) for m in us_data['results']] if us_data and 'results' in us_data else []
    if not us_movies:
        us_movies = [m for m in MOCK_MOVIES[1:6]]
    
    in_data = make_request("/movie/now_playing", {"region": "IN"})
    in_movies = [format_tmdb_movie(m) for m in in_data['results']] if in_data and 'results' in in_data else []
    indian_langs = {'hi', 'te', 'ta', 'ml', 'kn', 'bn', 'mr', 'pa'}
    in_movies = [m for m in in_movies if m.get('language') in indian_langs]
    
    raw_combined = us_movies[:16] + in_movies[:4]
    seen = set()
    combined = []
    for m in raw_combined:
        tid = m.get('tmdb_id')
        if tid not in seen:
            seen.add(tid)
            combined.append(m)
    return combined if combined else [m for m in MOCK_MOVIES[1:6]]

def search_movies(query):
    data = make_request("/search/movie", {"query": query})
    if data and 'results' in data:
        return [format_tmdb_movie(m) for m in data['results']]
    
    # Filter mocks
    query = query.lower()
    return [m for m in MOCK_MOVIES if query in m['title'].lower() or query in m['overview'].lower()]

def get_movie_details(tmdb_id):
    data = make_request(f"/movie/{tmdb_id}", {"append_to_response": "credits"})
    if data:
        formatted = format_tmdb_movie(data)
        
        # Extract director and cast from credits
        credits = data.get('credits', {})
        cast_list = [c['name'] for c in credits.get('cast', [])[:4]]
        director_list = [c['name'] for c in credits.get('crew', []) if c['job'] == 'Director']
        
        formatted.update({
            "runtime": data.get('runtime', 120),
            "director": director_list[0] if director_list else "Unknown",
            "cast": ", ".join(cast_list) if cast_list else "Unknown"
        })
        return formatted
        
    # Search in mocks
    for m in MOCK_MOVIES:
        if m['id'] == int(tmdb_id):
            return m
            
    return None

# Ensure mock movies have tmdb_id populated
for m in MOCK_MOVIES:
    if 'tmdb_id' not in m and 'id' in m:
        m['tmdb_id'] = m['id']

MOCK_SHOWS = [
    {
        "id": 1396,
        "title": "Breaking Bad",
        "overview": "Walter White, a New Mexico chemistry teacher, learns he has stage III cancer and has been given a prognosis of two years to live. He decides he has nothing to lose. He turns to a life of crime, partnering with Jesse Pinkman to manufacture and sell methamphetamine.",
        "poster_url": "https://image.tmdb.org/t/p/w500/ztkUQv63MzC36o76t7613z5i71c.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/9faGsLEj6Z32vUj61hJyKTAxJ19.jpg",
        "first_air_date": "2008-01-20",
        "genres": "Drama, Crime",
        "language": "en",
        "vote_average": 8.9,
        "runtime": 49,
        "director": "Vince Gilligan",
        "cast": "Bryan Cranston, Aaron Paul, Anna Gunn, Dean Norris"
    },
    {
        "id": 66732,
        "title": "Stranger Things",
        "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
        "poster_url": "https://image.tmdb.org/t/p/w500/49WkfeN0mGRLYClR6uH0J07vBGt.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/56v2Kj2qL524rmgU6WgZJy8i7Zq.jpg",
        "first_air_date": "2016-07-15",
        "genres": "Sci-Fi & Fantasy, Mystery, Drama",
        "language": "en",
        "vote_average": 8.6,
        "runtime": 50,
        "director": "The Duffer Brothers",
        "cast": "Winona Ryder, David Harbour, Millie Bobby Brown, Finn Wolfhard"
    },
    {
        "id": 1399,
        "title": "Game of Thrones",
        "overview": "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
        "poster_url": "https://image.tmdb.org/t/p/w500/1XS1JmqxZCC6hE5H0jG3jGggnLJ.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/z55QXt0144h2b45e998e1m8a2ec.jpg",
        "first_air_date": "2011-04-17",
        "genres": "Sci-Fi & Fantasy, Drama, Action & Adventure",
        "language": "en",
        "vote_average": 8.4,
        "runtime": 60,
        "director": "David Benioff, D. B. Weiss",
        "cast": "Kit Harington, Emilia Clarke, Peter Dinklage, Lena Headey"
    },
    {
        "id": 19885,
        "title": "Sherlock",
        "overview": "A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.",
        "poster_url": "https://image.tmdb.org/t/p/w500/f9zGxLHkJ13347S76A56M367JbA.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/o8wQcR2b0K98H6SgU9aQj24M7fB.jpg",
        "first_air_date": "2010-07-25",
        "genres": "Drama, Crime, Mystery",
        "language": "en",
        "vote_average": 8.5,
        "runtime": 90,
        "director": "Mark Gatiss, Steven Moffat",
        "cast": "Benedict Cumberbatch, Martin Freeman, Rupert Graves, Una Stubbs"
    }
]

for s in MOCK_SHOWS:
    if 'tmdb_id' not in s and 'id' in s:
        s['tmdb_id'] = s['id']

def format_tmdb_show(s):
    genres_list = []
    if 'genres' in s:
        genres_list = [g['name'] for g in s['genres']]
    elif 'genre_ids' in s:
        genre_map = {
            10759: "Action & Adventure", 16: "Animation", 35: "Comedy",
            80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
            10762: "Kids", 9648: "Mystery", 10763: "News", 10764: "Reality",
            10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk",
            10768: "War & Politics", 37: "Western"
        }
        genres_list = [genre_map.get(gid, "Drama") for gid in s['genre_ids']]
        
    poster_path = s.get('poster_path')
    backdrop_path = s.get('backdrop_path')
    
    return {
        "tmdb_id": s.get('id'),
        "title": s.get('name') or s.get('original_name'),
        "overview": s.get('overview'),
        "poster_url": f"{IMAGE_BASE_URL}{poster_path}" if poster_path else "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
        "backdrop_url": f"{BACKDROP_BASE_URL}{backdrop_path}" if backdrop_path else "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600",
        "first_air_date": s.get('first_air_date'),
        "genres": ", ".join(genres_list) if genres_list else "Drama",
        "language": s.get('original_language', 'en'),
        "vote_average": s.get('vote_average')
    }

def get_tv_trending():
    global_data = make_request("/trending/tv/week", {"language": "en-US"})
    global_shows = [format_tmdb_show(s) for s in global_data['results']] if global_data and 'results' in global_data else []
    if not global_shows:
        global_shows = [s for s in MOCK_SHOWS]
        
    in_data = make_request("/discover/tv", {"region": "IN", "with_original_language": "hi|te|ta|ml|kn", "sort_by": "popularity.desc"})
    in_shows = [format_tmdb_show(s) for s in in_data['results']] if in_data and 'results' in in_data else []
    
    raw_combined = global_shows[:16] + in_shows[:4]
    seen = set()
    combined = []
    for s in raw_combined:
        tid = s.get('tmdb_id')
        if tid not in seen:
            seen.add(tid)
            combined.append(s)
    return combined if combined else [s for s in MOCK_SHOWS]

def get_tv_popular():
    data = make_request("/tv/popular", {"language": "en-US"})
    if data and 'results' in data:
        return [format_tmdb_show(s) for s in data['results']]
    return [s for s in MOCK_SHOWS]

def get_tv_top_rated():
    data = make_request("/tv/top_rated", {"language": "en-US"})
    if data and 'results' in data:
        return [format_tmdb_show(s) for s in data['results']]
    return [s for s in MOCK_SHOWS]

def get_tv_airing_today():
    data = make_request("/tv/airing_today", {"language": "en-US"})
    if data and 'results' in data:
        return [format_tmdb_show(s) for s in data['results']]
    return [s for s in MOCK_SHOWS[2:]]

def get_tv_on_the_air():
    data = make_request("/tv/on_the_air", {"language": "en-US"})
    if data and 'results' in data:
        return [format_tmdb_show(s) for s in data['results']]
    return [s for s in MOCK_SHOWS[:2]]

def search_tv_shows(query):
    data = make_request("/search/tv", {"query": query})
    if data and 'results' in data:
        return [format_tmdb_show(s) for s in data['results']]
    
    query = query.lower()
    return [s for s in MOCK_SHOWS if query in s['title'].lower() or query in s['overview'].lower()]

def get_tv_details(tmdb_id):
    data = make_request(f"/tv/{tmdb_id}", {"append_to_response": "credits"})
    if data:
        formatted = format_tmdb_show(data)
        
        credits = data.get('credits', {})
        cast_list = [c['name'] for c in credits.get('cast', [])[:4]]
        
        # Creator info
        creators = data.get('created_by', [])
        creator_name = ", ".join([c['name'] for c in creators]) if creators else "Unknown"
        
        # Networks
        networks = data.get('networks', [])
        network_name = ", ".join([n['name'] for n in networks]) if networks else "Unknown"
        
        # Seasons
        seasons_list = []
        for s in data.get('seasons', []):
            seasons_list.append({
                "season_number": s.get('season_number'),
                "name": s.get('name'),
                "episode_count": s.get('episode_count'),
                "poster_path": s.get('poster_path')
            })
            
        formatted.update({
            "number_of_seasons": data.get('number_of_seasons', 1),
            "number_of_episodes": data.get('number_of_episodes', 10),
            "status": data.get('status', 'Ended'),
            "creator": creator_name,
            "cast": ", ".join(cast_list) if cast_list else "Unknown",
            "last_air_date": data.get('last_air_date'),
            "network": network_name,
            "seasons": seasons_list
        })
        return formatted
        
    for s in MOCK_SHOWS:
        if s['id'] == int(tmdb_id):
            return s
            
    return None

def get_tv_season_details(tmdb_id, season_number):
    data = make_request(f"/tv/{tmdb_id}/season/{season_number}")
    if data:
        episodes = []
        for ep in data.get('episodes', []):
            still_path = ep.get('still_path')
            episodes.append({
                "episode_number": ep.get('episode_number'),
                "name": ep.get('name'),
                "air_date": ep.get('air_date'),
                "overview": ep.get('overview'),
                "still_url": f"{IMAGE_BASE_URL}{still_path}" if still_path else None
            })
        return {
            "season_number": data.get('season_number'),
            "name": data.get('name'),
            "overview": data.get('overview'),
            "episodes": episodes
        }
    
    # Fallback mock episodes if TMDB fails or doesn't have details
    episodes = []
    for i in range(1, 11):
        episodes.append({
            "episode_number": i,
            "name": f"Episode {i}",
            "air_date": "2026-01-01",
            "overview": f"This is a placeholder overview for season {season_number} episode {i}.",
            "still_url": None
        })
    return {
        "season_number": season_number,
        "name": f"Season {season_number}",
        "overview": f"Mock overview for Season {season_number}",
        "episodes": episodes
    }

def get_tv_recommendations(tmdb_id, genre_id=None):
    data = make_request(f"/tv/{tmdb_id}/recommendations", {"language": "en-US"})
    if data and 'results' in data and len(data['results']) > 0:
        return [format_tmdb_show(s) for s in data['results']]
        
    if genre_id:
        gen_data = make_request("/discover/tv", {
            "with_genres": genre_id,
            "sort_by": "popularity.desc",
            "vote_count.gte": 50
        })
        if gen_data and 'results' in gen_data:
            return [format_tmdb_show(s) for s in gen_data['results'] if s.get('id') != int(tmdb_id)]
            
    return [s for s in MOCK_SHOWS if s['id'] != int(tmdb_id)]

def get_trailer_url(media_type, tmdb_id):
    # Calls /movie/{tmdb_id}/videos or /tv/{tmdb_id}/videos
    data = make_request(f"/{media_type}/{tmdb_id}/videos")
    if data and 'results' in data:
        for video in data['results']:
            # Search for YouTube trailers
            if video.get('site') == 'YouTube' and video.get('type') == 'Trailer':
                return f"https://www.youtube.com/watch?v={video.get('key')}"
    return None

def discover_tv_shows(genre_id):
    data = make_request("/discover/tv", {"with_genres": genre_id, "sort_by": "popularity.desc"})
    if data and 'results' in data:
        return [format_tmdb_show(s) for s in data['results']]
    return [s for s in MOCK_SHOWS]

