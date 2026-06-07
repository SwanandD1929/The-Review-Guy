from flask import Blueprint, request, jsonify
from backend.database import db
from backend.models.movie import Movie
from backend.models.rating import Rating
from backend.models.review import Review
from backend.models.watched import Watched
from backend.models.watch_later import WatchLater
from backend.models.trg_rating import TrgRating
from backend.models.trg_review import TrgReview
from backend.models.featured_movie import FeaturedMovie
from backend.services import tmdb_service

movies_bp = Blueprint('movies', __name__)

def resolve_movie(movie_id_str):
    if not movie_id_str:
        return None
    movie_id_str = str(movie_id_str)
    if movie_id_str.startswith('ext_'):
        tmdb_id = int(movie_id_str.replace('ext_', ''))
        movie = Movie.query.filter_by(tmdb_id=tmdb_id).first()
        if not movie:
            # On-the-fly fetch details and import
            details = tmdb_service.get_movie_details(tmdb_id)
            if details:
                movie = Movie(
                    tmdb_id=tmdb_id,
                    title=details['title'],
                    overview=details['overview'],
                    poster_url=details['poster_url'],
                    backdrop_url=details['backdrop_url'],
                    release_date=details['release_date'],
                    genres=details['genres'],
                    language=details['language']
                )
                db.session.add(movie)
                db.session.commit()
        return movie
    else:
        try:
            parsed_id = int(movie_id_str)
            movie = Movie.query.filter_by(tmdb_id=parsed_id).first()
            if not movie:
                movie = Movie.query.get(parsed_id)
            return movie
        except ValueError:
            return None

def get_movie_stats(movie_id, fingerprint=None):
    # Calculate community average rating (1-10)
    avg_rating = db.session.query(db.func.avg(Rating.rating)).filter(Rating.movie_id == movie_id).scalar()
    avg_rating = round(float(avg_rating), 1) if avg_rating else 0.0

    # Calculate recommendation percentage (ratings >= 7 / total ratings)
    total_ratings = db.session.query(db.func.count(Rating.id)).filter(Rating.movie_id == movie_id).scalar()
    high_ratings = db.session.query(db.func.count(Rating.id)).filter(Rating.movie_id == movie_id, Rating.rating >= 7).scalar()
    rec_percentage = int((high_ratings / total_ratings) * 100) if total_ratings > 0 else 0

    # Calculate total watched count
    watch_count = db.session.query(db.func.count(Watched.id)).filter(Watched.movie_id == movie_id).scalar()
    
    # Calculate reviews count
    review_count = db.session.query(db.func.count(Review.id)).filter(Review.movie_id == movie_id).scalar()

    # User-specific flags based on fingerprint
    user_rating = None
    is_watched = False
    is_watch_later = False

    if fingerprint:
        user_rating_obj = Rating.query.filter_by(movie_id=movie_id, fingerprint=fingerprint).first()
        if user_rating_obj:
            user_rating = user_rating_obj.rating
        
        is_watched = Watched.query.filter_by(movie_id=movie_id, fingerprint=fingerprint).first() is not None
        is_watch_later = WatchLater.query.filter_by(movie_id=movie_id, fingerprint=fingerprint).first() is not None

    return {
        'avg_rating': avg_rating,
        'total_ratings': total_ratings,
        'recommendation_percentage': rec_percentage,
        'watch_count': watch_count,
        'review_count': review_count,
        'user_rating': user_rating,
        'is_watched': is_watched,
        'is_watch_later': is_watch_later
    }

def merge_local_data(movies_list, fingerprint=None):
    # Merges database metrics into TMDB lists
    merged = []
    for m in movies_list:
        m_copy = dict(m)
        tmdb_id = m_copy.get('tmdb_id') or m_copy.get('id')
        if not tmdb_id:
            continue
        local_m = Movie.query.filter_by(tmdb_id=tmdb_id).first()
        if local_m:
            stats = get_movie_stats(local_m.id, fingerprint)
            trg_rating_obj = TrgRating.query.filter_by(movie_id=local_m.id).first()
            m_dict = local_m.to_dict()
            m_dict.update({
                'community_rating': stats['avg_rating'],
                'recommendation_percentage': stats['recommendation_percentage'],
                'watch_count': stats['watch_count'],
                'local_id': local_m.id,
                'trg_rating': trg_rating_obj.rating if trg_rating_obj else None
            })
            if 'tmdb_id' not in m_dict:
                m_dict['tmdb_id'] = tmdb_id
            merged.append(m_dict)
        else:
            m_copy.update({
                'tmdb_id': tmdb_id,
                'community_rating': 0.0,
                'recommendation_percentage': 0,
                'watch_count': 0,
                'local_id': None,
                'trg_rating': None
            })
            merged.append(m_copy)
    return merged

@movies_bp.route('/api/movies/trending', methods=['GET'])
def get_trending():
    fingerprint = request.args.get('fingerprint')
    tmdb_movies = tmdb_service.get_trending()
    return jsonify(merge_local_data(tmdb_movies, fingerprint))

@movies_bp.route('/api/movies/upcoming', methods=['GET'])
def get_upcoming():
    fingerprint = request.args.get('fingerprint')
    tmdb_movies = tmdb_service.get_upcoming()
    return jsonify(merge_local_data(tmdb_movies, fingerprint))

@movies_bp.route('/api/movies/now-playing', methods=['GET'])
def get_now_playing():
    fingerprint = request.args.get('fingerprint')
    tmdb_movies = tmdb_service.get_now_playing()
    return jsonify(merge_local_data(tmdb_movies, fingerprint))

@movies_bp.route('/api/movies/top-rated', methods=['GET'])
def get_top_rated():
    fingerprint = request.args.get('fingerprint')
    # Fetch local movies, compute rating, sort
    all_local = Movie.query.all()
    rated_movies = []
    for m in all_local:
        stats = get_movie_stats(m.id, fingerprint)
        trg_rating_obj = TrgRating.query.filter_by(movie_id=m.id).first()
        m_dict = m.to_dict()
        m_dict.update({
            'community_rating': stats['avg_rating'],
            'total_ratings': stats['total_ratings'],
            'recommendation_percentage': stats['recommendation_percentage'],
            'watch_count': stats['watch_count'],
            'local_id': m.id,
            'trg_rating': trg_rating_obj.rating if trg_rating_obj else None
        })
        rated_movies.append(m_dict)
    # Sort by community rating desc, then total ratings desc
    rated_movies.sort(key=lambda x: (x['community_rating'], x['total_ratings']), reverse=True)
    return jsonify(rated_movies)

@movies_bp.route('/api/movies/most-watched', methods=['GET'])
def get_most_watched():
    fingerprint = request.args.get('fingerprint')
    all_local = Movie.query.all()
    watched_movies = []
    for m in all_local:
        stats = get_movie_stats(m.id, fingerprint)
        trg_rating_obj = TrgRating.query.filter_by(movie_id=m.id).first()
        m_dict = m.to_dict()
        m_dict.update({
            'community_rating': stats['avg_rating'],
            'recommendation_percentage': stats['recommendation_percentage'],
            'watch_count': stats['watch_count'],
            'local_id': m.id,
            'trg_rating': trg_rating_obj.rating if trg_rating_obj else None
        })
        watched_movies.append(m_dict)
    # Sort by watch count desc
    watched_movies.sort(key=lambda x: x['watch_count'], reverse=True)
    return jsonify(watched_movies)

@movies_bp.route('/api/movies/search', methods=['GET'])
def search():
    query = request.args.get('q', '').strip()
    fingerprint = request.args.get('fingerprint')
    if not query:
        return jsonify({'local': [], 'tmdb': []})
    
    # 1. Search local DB
    local_matches = Movie.query.filter(Movie.title.ilike(f"%{query}%") | Movie.genres.ilike(f"%{query}%")).all()
    local_results = []
    for m in local_matches:
        stats = get_movie_stats(m.id, fingerprint)
        m_dict = m.to_dict()
        m_dict.update({
            'community_rating': stats['avg_rating'],
            'recommendation_percentage': stats['recommendation_percentage'],
            'watch_count': stats['watch_count'],
            'local_id': m.id
        })
        local_results.append(m_dict)

    # 2. Search TMDB
    tmdb_matches = tmdb_service.search_movies(query)
    tmdb_results = []
    
    # Exclude those that are already imported locally
    local_tmdb_ids = {m.tmdb_id for m in local_matches if m.tmdb_id}
    if not local_tmdb_ids:
        # Get all local tmdb ids to filter
        local_tmdb_ids = {m.tmdb_id for m in Movie.query.filter(Movie.tmdb_id.isnot(None)).all()}

    for tm in tmdb_matches:
        if tm['tmdb_id'] not in local_tmdb_ids:
            tmdb_results.append(tm)
            
    return jsonify({
        'local': local_results,
        'tmdb': tmdb_results
    })

@movies_bp.route('/api/movie/<string:movie_id>', methods=['GET'])
def get_movie(movie_id):
    fingerprint = request.args.get('fingerprint')
    movie = resolve_movie(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
        
    stats = get_movie_stats(movie.id, fingerprint)
    
    # Fetch reviews
    reviews_list = Review.query.filter_by(movie_id=movie.id).order_by(Review.created_at.desc()).all()
    
    # For reviews, find what rating the reviewer gave
    reviews_data = []
    for r in reviews_list:
        rev_rating = Rating.query.filter_by(movie_id=movie.id, fingerprint=r.fingerprint).first()
        reviews_data.append({
            'id': r.id,
            'fingerprint': r.fingerprint,
            'review_text': r.review_text,
            'created_at': r.created_at.isoformat(),
            'rating': rev_rating.rating if rev_rating else None
        })

    trg_rating_obj = TrgRating.query.filter_by(movie_id=movie.id).first()
    trg_review_obj = TrgReview.query.filter_by(movie_id=movie.id).first()
    m_dict = movie.to_dict()
    # Add stats
    m_dict.update({
        'community_rating': stats['avg_rating'],
        'total_ratings': stats['total_ratings'],
        'recommendation_percentage': stats['recommendation_percentage'],
        'watch_count': stats['watch_count'],
        'review_count': stats['review_count'],
        'user_rating': stats['user_rating'],
        'is_watched': stats['is_watched'],
        'is_watch_later': stats['is_watch_later'],
        'reviews': reviews_data,
        'trg_rating': trg_rating_obj.rating if trg_rating_obj else None,
        'trg_review': trg_review_obj.review_text if trg_review_obj else None
    })
    
    # Query additional attributes from TMDB if applicable
    if movie.tmdb_id:
        tm_details = tmdb_service.get_movie_details(movie.tmdb_id)
        if tm_details:
            m_dict.update({
                'tmdb_rating': tm_details.get('vote_average'),
                'runtime': tm_details.get('runtime', 120),
                'director': tm_details.get('director', 'Unknown'),
                'cast': tm_details.get('cast', 'Unknown')
            })
    else:
        # Manual movies
        m_dict.update({
            'tmdb_rating': None,
            'runtime': 120,
            'director': 'Unknown',
            'cast': 'Unknown'
        })
        
    return jsonify(m_dict)

@movies_bp.route('/api/movie/import', methods=['POST'])
def import_movie():
    data = request.get_json() or {}
    tmdb_id = data.get('tmdb_id')
    if not tmdb_id:
        return jsonify({'error': 'tmdb_id is required'}), 400
        
    # Check if already imported
    existing = Movie.query.filter_by(tmdb_id=tmdb_id).first()
    if existing:
        return jsonify(existing.to_dict())
        
    # Get details from TMDB
    details = tmdb_service.get_movie_details(tmdb_id)
    if not details:
        return jsonify({'error': 'Failed to fetch details from TMDB'}), 404
        
    new_movie = Movie(
        tmdb_id=tmdb_id,
        title=details['title'],
        overview=details['overview'],
        poster_url=details['poster_url'],
        backdrop_url=details['backdrop_url'],
        release_date=details['release_date'],
        genres=details['genres'],
        language=details['language']
    )
    
    try:
        db.session.add(new_movie)
        db.session.commit()
        return jsonify(new_movie.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movies', methods=['POST'])
def add_movie():
    data = request.get_json() or {}
    title = data.get('title')
    release_date = data.get('release_date')
    
    if not title:
        return jsonify({'error': 'Title is required'}), 400
        
    # Check duplicate by title and year/release_date
    existing = Movie.query.filter_by(title=title, release_date=release_date).first()
    if existing:
        return jsonify({'exists': True, 'movie': existing.to_dict()})
        
    new_movie = Movie(
        title=title,
        overview=data.get('overview'),
        poster_url=data.get('poster_url') or "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
        backdrop_url=data.get('backdrop_url') or "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600",
        release_date=release_date,
        genres=data.get('genres') or 'Drama',
        language=data.get('language') or 'en'
    )
    
    try:
        db.session.add(new_movie)
        db.session.commit()
        return jsonify({'exists': False, 'movie': new_movie.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movie/<string:movie_id>/rate', methods=['POST'])
def rate_movie(movie_id):
    data = request.get_json() or {}
    fingerprint = data.get('fingerprint')
    rating_val = data.get('rating')
    
    if not fingerprint:
        return jsonify({'error': 'Fingerprint is required'}), 400
    if rating_val is None or not (1 <= rating_val <= 10):
        return jsonify({'error': 'Rating must be an integer between 1 and 10'}), 400
        
    # Check if movie exists
    movie = resolve_movie(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
        
    # Anti-spam logic: Check if fingerprint has already rated this movie
    rating_obj = Rating.query.filter_by(movie_id=movie.id, fingerprint=fingerprint).first()
    if rating_obj:
      # Update existing
      rating_obj.rating = rating_val
    else:
      # Create new
      rating_obj = Rating(movie_id=movie.id, fingerprint=fingerprint, rating=rating_val)
      db.session.add(rating_obj)
        
    # Rate = Watched Logic: Automatically mark movie as watched if not already
    existing_watched = Watched.query.filter_by(movie_id=movie.id, fingerprint=fingerprint).first()
    if not existing_watched:
      watched_obj = Watched(movie_id=movie.id, fingerprint=fingerprint)
      db.session.add(watched_obj)
        
    try:
      db.session.commit()
      return jsonify({'success': True, 'rating': rating_obj.to_dict()})
    except Exception as e:
      db.session.rollback()
      return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movie/<string:movie_id>/review', methods=['POST'])
def add_review(movie_id):
    data = request.get_json() or {}
    fingerprint = data.get('fingerprint')
    review_text = data.get('review_text')
    
    if not fingerprint:
        return jsonify({'error': 'Fingerprint is required'}), 400
    if not review_text or not review_text.strip():
        return jsonify({'error': 'Review text is required'}), 400
        
    # Check if movie exists
    movie = resolve_movie(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
        
    new_review = Review(movie_id=movie.id, fingerprint=fingerprint, review_text=review_text.strip())
    db.session.add(new_review)
    
    try:
        db.session.commit()
        return jsonify({'success': True, 'review': new_review.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movie/<string:movie_id>/watched', methods=['POST'])
def toggle_watched(movie_id):
    data = request.get_json() or {}
    fingerprint = data.get('fingerprint')
    
    if not fingerprint:
        return jsonify({'error': 'Fingerprint is required'}), 400
        
    # Check if movie exists
    movie = resolve_movie(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
        
    # Toggle watched
    watched_obj = Watched.query.filter_by(movie_id=movie.id, fingerprint=fingerprint).first()
    is_watched = False
    if watched_obj:
        db.session.delete(watched_obj)
    else:
        watched_obj = Watched(movie_id=movie.id, fingerprint=fingerprint)
        db.session.add(watched_obj)
        is_watched = True
        
    try:
        db.session.commit()
        return jsonify({'success': True, 'is_watched': is_watched})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movie/<string:movie_id>/watch-later', methods=['POST'])
def toggle_watch_later(movie_id):
    data = request.get_json() or {}
    fingerprint = data.get('fingerprint')
    
    if not fingerprint:
        return jsonify({'error': 'Fingerprint is required'}), 400
        
    # Check if movie exists
    movie = resolve_movie(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
        
    # Toggle watch later
    wl_obj = WatchLater.query.filter_by(movie_id=movie.id, fingerprint=fingerprint).first()
    is_watch_later = False
    if wl_obj:
        db.session.delete(wl_obj)
    else:
        wl_obj = WatchLater(movie_id=movie.id, fingerprint=fingerprint)
        db.session.add(wl_obj)
        is_watch_later = True
        
    try:
        db.session.commit()
        return jsonify({'success': True, 'is_watch_later': is_watch_later})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/user/watch-later', methods=['GET'])
def get_user_watch_later():
    fingerprint = request.args.get('fingerprint')
    if not fingerprint:
        return jsonify({'error': 'Fingerprint is required'}), 400
        
    watch_later_items = WatchLater.query.filter_by(fingerprint=fingerprint).all()
    movies_data = []
    for item in watch_later_items:
        m = Movie.query.get(item.movie_id)
        if m:
            stats = get_movie_stats(m.id, fingerprint)
            m_dict = m.to_dict()
            m_dict.update({
                'community_rating': stats['avg_rating'],
                'recommendation_percentage': stats['recommendation_percentage'],
                'watch_count': stats['watch_count'],
                'local_id': m.id
            })
            movies_data.append(m_dict)
            
    return jsonify(movies_data)

@movies_bp.route('/api/user/stats', methods=['GET'])
def get_user_stats():
    fingerprint = request.args.get('fingerprint')
    if not fingerprint:
        return jsonify({'error': 'Fingerprint is required'}), 400
        
    wl_count = WatchLater.query.filter_by(fingerprint=fingerprint).count()
    watched_count = Watched.query.filter_by(fingerprint=fingerprint).count()
    reviews_count = Review.query.filter_by(fingerprint=fingerprint).count()
    ratings_count = Rating.query.filter_by(fingerprint=fingerprint).count()
    
    return jsonify({
        'watch_later_count': wl_count,
        'watched_count': watched_count,
        'reviews_count': reviews_count,
        'ratings_count': ratings_count
    })

@movies_bp.route('/api/movie/featured', methods=['GET'])
def get_featured_movie():
    featured = FeaturedMovie.query.filter_by(active=True).order_by(FeaturedMovie.created_at.desc()).first()
    if not featured:
        return jsonify(None)
    
    movie = Movie.query.get(featured.movie_id)
    if not movie:
        return jsonify(None)
    
    trg_rating_obj = TrgRating.query.filter_by(movie_id=movie.id).first()
    
    m_dict = movie.to_dict()
    m_dict.update({
        'trg_rating': trg_rating_obj.rating if trg_rating_obj else None,
        'short_verdict': featured.short_verdict,
        'local_id': movie.id
    })
    return jsonify(m_dict)

@movies_bp.route('/api/movie/featured', methods=['POST'])
def set_featured_movie():
    data = request.get_json() or {}
    movie_id = data.get('movie_id')
    short_verdict = data.get('short_verdict')
    
    if not movie_id:
        return jsonify({'error': 'movie_id is required'}), 400
        
    movie = resolve_movie(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
        
    FeaturedMovie.query.update({FeaturedMovie.active: False})
    
    new_featured = FeaturedMovie(movie_id=movie.id, short_verdict=short_verdict, active=True)
    db.session.add(new_featured)
    
    try:
        db.session.commit()
        return jsonify(new_featured.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movie/featured', methods=['DELETE'])
def remove_featured_movie():
    FeaturedMovie.query.update({FeaturedMovie.active: False})
    try:
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movie/<string:movie_id>/trg', methods=['POST'])
def save_trg_stats(movie_id):
    data = request.get_json() or {}
    rating = data.get('rating')
    review_text = data.get('review_text')
    
    movie = resolve_movie(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
        
    if rating is not None:
        trg_rating = TrgRating.query.filter_by(movie_id=movie.id).first()
        if trg_rating:
            if rating == "" or rating is None:
                db.session.delete(trg_rating)
            else:
                trg_rating.rating = float(rating)
        elif rating != "" and rating is not None:
            trg_rating = TrgRating(movie_id=movie.id, rating=float(rating))
            db.session.add(trg_rating)
            
    if review_text is not None:
        trg_review = TrgReview.query.filter_by(movie_id=movie.id).first()
        if trg_review:
            if review_text == "" or review_text is None:
                db.session.delete(trg_review)
            else:
                trg_review.review_text = review_text
        elif review_text != "" and review_text is not None:
            trg_review = TrgReview(movie_id=movie.id, review_text=review_text)
            db.session.add(trg_review)
            
    try:
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movie/<string:movie_id>', methods=['DELETE'])
def delete_movie(movie_id):
    movie = resolve_movie(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
        
    try:
        db.session.delete(movie)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movie/<string:movie_id>/metadata', methods=['PUT'])
def update_movie_metadata(movie_id):
    movie = resolve_movie(movie_id)
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
        
    data = request.get_json() or {}
    if 'title' in data:
        movie.title = data['title']
    if 'release_date' in data:
        movie.release_date = data['release_date']
    if 'genres' in data:
        g = data['genres']
        movie.genres = ", ".join(g) if isinstance(g, list) else g
    if 'poster_url' in data:
        movie.poster_url = data['poster_url']
    if 'backdrop_url' in data:
        movie.backdrop_url = data['backdrop_url']
    if 'overview' in data:
        movie.overview = data['overview']
    if 'language' in data:
        movie.language = data['language']
    if 'youtube_review_url' in data:
        movie.youtube_review_url = data['youtube_review_url']
        
    try:
        db.session.commit()
        return jsonify(movie.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/api/movie/<string:movie_id>/trailer', methods=['GET'])
def get_movie_trailer(movie_id):
    movie = resolve_movie(movie_id)
    if not movie or not movie.tmdb_id:
        return jsonify({'trailer_url': None})
        
    trailer_url = tmdb_service.get_trailer_url('movie', movie.tmdb_id)
    return jsonify({'trailer_url': trailer_url})

