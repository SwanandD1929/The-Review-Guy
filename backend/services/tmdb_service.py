import os
import requests
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv('TMDB_API_KEY')
BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original"

# Rich seed/fallback dataset representing popular movies
MOCK_MOVIES = [
    {
        "id": 157336,
        "title": "Interstellar",
        "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
        "poster_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E7vNIvXT8StmQj2J5A.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/xJHok2Ja57jF97nU74v21tG6eGu.jpg",
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
        "poster_url": "https://image.tmdb.org/t/p/w500/o01vCoZSZgGBbb3622egR2QJyvL.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/s3TBr7xHhua6d1IL6qn9qyLM2iY.jpg",
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
        "poster_url": "https://image.tmdb.org/t/p/w500/qJ2tWGBbeZu6SndzScJj648tK1t.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/nMKdUUepdz876F9vj6Pz9t4kC61.jpg",
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
        "poster_url": "https://image.tmdb.org/t/p/w500/d5N0Gego0mwtjBD5V27tIcln36t.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/lz7UB1Qv8ncsG27XlRoxlW249vO.jpg",
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
        "poster_url": "https://image.tmdb.org/t/p/w500/kAVRgw7GgK11J655g6S6R22qc2V.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/17G69u01L0RjOCL6B628tq2fh0h.jpg",
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
        "poster_url": "https://image.tmdb.org/t/p/w500/uE796BhRlFLgD3t3g6rn2G6X7rn.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/2wPtwgZ470Srkz1q7mHwXhA0G0p.jpg",
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
        "poster_url": "https://image.tmdb.org/t/p/w500/7WsyChwLEasfb6o9smjygjfsR3q.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/bOGv62LIgiQn2ndCu2jtvcmdRUr.jpg",
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
        "poster_url": "https://image.tmdb.org/t/p/w500/7IiTT05EX2V2v9SDc2ZvU6w2ciq.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/original/hiK5UmTMu5YvPIsrD1q44N81OmI.jpg",
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
    try:
        response = requests.get(url, params=payload, timeout=5)
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass
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
    data = make_request("/trending/movie/week")
    if data and 'results' in data:
        return [format_tmdb_movie(m) for m in data['results']]
    return [m for m in MOCK_MOVIES]

def get_upcoming():
    data = make_request("/movie/upcoming", {"region": "IN"})
    if not data:
        data = make_request("/movie/upcoming")
    if data and 'results' in data:
        return [format_tmdb_movie(m) for m in data['results']]
    # Rotate or filter our mocks as fake upcoming
    return [m for m in MOCK_MOVIES[3:7]]

def get_now_playing():
    data = make_request("/movie/now_playing")
    if data and 'results' in data:
        return [format_tmdb_movie(m) for m in data['results']]
    return [m for m in MOCK_MOVIES[1:6]]

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
