from flask import Blueprint, request, jsonify
from backend.database import db
from backend.models.tv_show import TVShow
from backend.models.tv_rating import TvRating
from backend.models.tv_review import TvReview
from backend.models.tv_watched import TvWatched
from backend.models.tv_watch_later import TvWatchLater
from backend.models.tv_trg_rating import TvTrgRating
from backend.models.tv_trg_review import TvTrgReview
from backend.models.review_request import ReviewRequest
from backend.services import tmdb_service

tv_shows_bp = Blueprint('tv_shows', __name__)

def resolve_tv_show(tv_show_id_str):
    if not tv_show_id_str:
        return None
    tv_show_id_str = str(tv_show_id_str)
    if tv_show_id_str.startswith('ext_'):
        tmdb_id = int(tv_show_id_str.replace('ext_', ''))
        tv_show = TVShow.query.filter_by(tmdb_id=tmdb_id).first()
        if not tv_show:
            details = tmdb_service.get_tv_details(tmdb_id)
            if details:
                tv_show = TVShow(
                    tmdb_id=tmdb_id,
                    title=details['title'],
                    overview=details['overview'],
                    poster_url=details['poster_url'],
                    backdrop_url=details['backdrop_url'],
                    first_air_date=details['first_air_date'],
                    genres=details['genres'],
                    language=details['language']
                )
                db.session.add(tv_show)
                db.session.commit()
        return tv_show
    else:
        try:
            parsed_id = int(tv_show_id_str)
            tv_show = TVShow.query.filter_by(tmdb_id=parsed_id).first()
            if not tv_show:
                tv_show = TVShow.query.get(parsed_id)
            return tv_show
        except ValueError:
            return None

def get_tv_stats(tv_show_id, fingerprint=None):
    # Calculate community average rating (1-10)
    avg_rating = db.session.query(db.func.avg(TvRating.rating)).filter(TvRating.tv_show_id == tv_show_id).scalar()
    avg_rating = round(float(avg_rating), 1) if avg_rating else 0.0

    # Calculate recommendation percentage (ratings >= 7 / total ratings)
    total_ratings = db.session.query(db.func.count(TvRating.id)).filter(TvRating.tv_show_id == tv_show_id).scalar()
    high_ratings = db.session.query(db.func.count(TvRating.id)).filter(TvRating.tv_show_id == tv_show_id, TvRating.rating >= 7).scalar()
    rec_percentage = int((high_ratings / total_ratings) * 100) if total_ratings > 0 else 0

    # Calculate total watched count
    watch_count = db.session.query(db.func.count(TvWatched.id)).filter(TvWatched.tv_show_id == tv_show_id).scalar()

    # Calculate total review count
    review_count = db.session.query(db.func.count(TvReview.id)).filter(TvReview.tv_show_id == tv_show_id).scalar()

    user_rating = None
    is_watched = False
    is_watch_later = False

    if fingerprint:
        rating_obj = TvRating.query.filter_by(tv_show_id=tv_show_id, fingerprint=fingerprint).first()
        user_rating = rating_obj.rating if rating_obj else None
        
        is_watched = TvWatched.query.filter_by(tv_show_id=tv_show_id, fingerprint=fingerprint).first() is not None
        is_watch_later = TvWatchLater.query.filter_by(tv_show_id=tv_show_id, fingerprint=fingerprint).first() is not None

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

def add_tv_db_stats(s, fingerprint=None):
    tv_show = TVShow.query.filter_by(tmdb_id=s['tmdb_id']).first()
    youtube_url = None
    if tv_show:
        stats = get_tv_stats(tv_show.id, fingerprint)
        trg_rating_obj = TvTrgRating.query.filter_by(tv_show_id=tv_show.id).first()
        trg_review_obj = TvTrgReview.query.filter_by(tv_show_id=tv_show.id).first()
        youtube_url = tv_show.youtube_review_url
        s.update({
            'id': f"ext_{tv_show.tmdb_id}",
            'community_rating': stats['avg_rating'],
            'total_ratings': stats['total_ratings'],
            'recommendation_percentage': stats['recommendation_percentage'],
            'watch_count': stats['watch_count'],
            'review_count': stats['review_count'],
            'user_rating': stats['user_rating'],
            'is_watched': stats['is_watched'],
            'is_watch_later': stats['is_watch_later'],
            'trg_rating': trg_rating_obj.rating if trg_rating_obj else None,
            'trg_review': trg_review_obj.review_text if trg_review_obj else None,
            'youtube_review_url': youtube_url
        })
    else:
        s.update({
            'id': f"ext_{s['tmdb_id']}",
            'community_rating': 0.0,
            'total_ratings': 0,
            'recommendation_percentage': 0,
            'watch_count': 0,
            'review_count': 0,
            'user_rating': None,
            'is_watched': False,
            'is_watch_later': False,
            'trg_rating': None,
            'trg_review': None,
            'youtube_review_url': None
        })
    return s

@tv_shows_bp.route('/api/tv/trending', methods=['GET'])
def get_tv_trending():
    fingerprint = request.args.get('fingerprint')
    shows = tmdb_service.get_tv_trending()
    return jsonify([add_tv_db_stats(s, fingerprint) for s in shows])

@tv_shows_bp.route('/api/tv/popular', methods=['GET'])
def get_tv_popular():
    fingerprint = request.args.get('fingerprint')
    shows = tmdb_service.get_tv_popular()
    return jsonify([add_tv_db_stats(s, fingerprint) for s in shows])

@tv_shows_bp.route('/api/tv/top-rated', methods=['GET'])
def get_tv_top_rated():
    fingerprint = request.args.get('fingerprint')
    shows = tmdb_service.get_tv_top_rated()
    return jsonify([add_tv_db_stats(s, fingerprint) for s in shows])

@tv_shows_bp.route('/api/tv/airing-today', methods=['GET'])
def get_tv_airing_today():
    fingerprint = request.args.get('fingerprint')
    shows = tmdb_service.get_tv_airing_today()
    return jsonify([add_tv_db_stats(s, fingerprint) for s in shows])

@tv_shows_bp.route('/api/tv/on-the-air', methods=['GET'])
def get_tv_on_the_air():
    fingerprint = request.args.get('fingerprint')
    shows = tmdb_service.get_tv_on_the_air()
    return jsonify([add_tv_db_stats(s, fingerprint) for s in shows])

@tv_shows_bp.route('/api/tv/discover', methods=['GET'])
def get_tv_discover():
    fingerprint = request.args.get('fingerprint')
    genre_id = request.args.get('genre_id')
    shows = tmdb_service.discover_tv_shows(genre_id)
    return jsonify([add_tv_db_stats(s, fingerprint) for s in shows])

@tv_shows_bp.route('/api/tv/search', methods=['GET'])
def search_tv():
    query = request.args.get('q', '').strip()
    fingerprint = request.args.get('fingerprint')
    if not query:
        return jsonify({'local': [], 'tmdb': []})
    
    # 1. Search local DB
    local_matches = TVShow.query.filter(TVShow.title.ilike(f"%{query}%") | TVShow.genres.ilike(f"%{query}%")).all()
    local_results = []
    for s in local_matches:
        stats = get_tv_stats(s.id, fingerprint)
        s_dict = s.to_dict()
        s_dict.update({
            'community_rating': stats['avg_rating'],
            'recommendation_percentage': stats['recommendation_percentage'],
            'watch_count': stats['watch_count'],
            'local_id': s.id
        })
        # Add TRG specific keys if available
        trg_rating_obj = TvTrgRating.query.filter_by(tv_show_id=s.id).first()
        trg_review_obj = TvTrgReview.query.filter_by(tv_show_id=s.id).first()
        s_dict.update({
            'trg_rating': trg_rating_obj.rating if trg_rating_obj else None,
            'trg_review': trg_review_obj.review_text if trg_review_obj else None,
            'youtube_review_url': s.youtube_review_url
        })
        local_results.append(s_dict)

    # 2. Search TMDB
    tmdb_matches = tmdb_service.search_tv_shows(query)
    tmdb_results = []
    
    # Exclude those that are already imported locally
    local_tmdb_ids = {s.tmdb_id for s in local_matches if s.tmdb_id}
    if not local_tmdb_ids:
        # Get all local tmdb ids to filter
        local_tmdb_ids = {s.tmdb_id for s in TVShow.query.filter(TVShow.tmdb_id.isnot(None)).all()}

    for tm in tmdb_matches:
        if tm['tmdb_id'] not in local_tmdb_ids:
            tm_with_stats = add_tv_db_stats(tm, fingerprint)
            tmdb_results.append(tm_with_stats)
            
    return jsonify({
        'local': local_results,
        'tmdb': tmdb_results
    })

@tv_shows_bp.route('/api/tv/<string:tv_id>', methods=['GET'])
def get_tv_detail(tv_id):
    fingerprint = request.args.get('fingerprint')
    tv_show = resolve_tv_show(tv_id)
    if not tv_show:
        return jsonify({'error': 'TV Show not found'}), 404
        
    stats = get_tv_stats(tv_show.id, fingerprint)
    
    reviews_list = TvReview.query.filter_by(tv_show_id=tv_show.id).order_by(TvReview.created_at.desc()).all()
    reviews_data = []
    for r in reviews_list:
        rev_rating = TvRating.query.filter_by(tv_show_id=tv_show.id, fingerprint=r.fingerprint).first()
        reviews_data.append({
            'id': r.id,
            'fingerprint': r.fingerprint,
            'review_text': r.review_text,
            'created_at': r.created_at.isoformat(),
            'rating': rev_rating.rating if rev_rating else None
        })

    trg_rating_obj = TvTrgRating.query.filter_by(tv_show_id=tv_show.id).first()
    trg_review_obj = TvTrgReview.query.filter_by(tv_show_id=tv_show.id).first()
    
    s_dict = tv_show.to_dict()
    s_dict.update({
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
    
    # Query additional attributes from TMDB
    if tv_show.tmdb_id:
        tm_details = tmdb_service.get_tv_details(tv_show.tmdb_id)
        if tm_details:
            s_dict.update({
                'number_of_seasons': tm_details.get('number_of_seasons', 1),
                'number_of_episodes': tm_details.get('number_of_episodes', 10),
                'status': tm_details.get('status', 'Ended'),
                'creator': tm_details.get('creator', 'Unknown'),
                'cast': tm_details.get('cast', 'Unknown'),
                'last_air_date': tm_details.get('last_air_date'),
                'network': tm_details.get('network', 'Unknown'),
                'seasons': tm_details.get('seasons', [])
            })
            
    return jsonify(s_dict)

@tv_shows_bp.route('/api/tv/<string:tv_id>/season/<int:season_number>', methods=['GET'])
def get_tv_season_details(tv_id, season_number):
    tv_show = resolve_tv_show(tv_id)
    if not tv_show or not tv_show.tmdb_id:
        return jsonify({'error': 'TV Show not found'}), 404
        
    details = tmdb_service.get_tv_season_details(tv_show.tmdb_id, season_number)
    if not details:
        return jsonify({'error': 'Season not found'}), 404
        
    return jsonify(details)

@tv_shows_bp.route('/api/tv/<string:tv_id>/rate', methods=['POST'])
def rate_tv(tv_id):
    data = request.json or {}
    rating_val = data.get('rating')
    fingerprint = data.get('fingerprint')

    if not rating_val or not fingerprint:
        return jsonify({'error': 'Missing rating or fingerprint'}), 400

    tv_show = resolve_tv_show(tv_id)
    if not tv_show:
        return jsonify({'error': 'TV Show not found'}), 404

    rating_obj = TvRating.query.filter_by(tv_show_id=tv_show.id, fingerprint=fingerprint).first()
    if rating_obj:
        rating_obj.rating = rating_val
    else:
        rating_obj = TvRating(tv_show_id=tv_show.id, fingerprint=fingerprint, rating=rating_val)
        db.session.add(rating_obj)

    try:
        db.session.commit()
        stats = get_tv_stats(tv_show.id, fingerprint)
        return jsonify(stats)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tv_shows_bp.route('/api/tv/<string:tv_id>/review', methods=['POST'])
def review_tv(tv_id):
    data = request.json or {}
    review_text = data.get('review_text')
    fingerprint = data.get('fingerprint')

    if not review_text or not fingerprint:
        return jsonify({'error': 'Missing review_text or fingerprint'}), 400

    tv_show = resolve_tv_show(tv_id)
    if not tv_show:
        return jsonify({'error': 'TV Show not found'}), 404

    # Enforce one review per user
    review_obj = TvReview.query.filter_by(tv_show_id=tv_show.id, fingerprint=fingerprint).first()
    if review_obj:
        review_obj.review_text = review_text
    else:
        review_obj = TvReview(tv_show_id=tv_show.id, fingerprint=fingerprint, review_text=review_text)
        db.session.add(review_obj)

    try:
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tv_shows_bp.route('/api/tv/<string:tv_id>/watched', methods=['POST'])
def toggle_tv_watched(tv_id):
    data = request.json or {}
    fingerprint = data.get('fingerprint')

    if not fingerprint:
        return jsonify({'error': 'Missing fingerprint'}), 400

    tv_show = resolve_tv_show(tv_id)
    if not tv_show:
        return jsonify({'error': 'TV Show not found'}), 404

    watch_obj = TvWatched.query.filter_by(tv_show_id=tv_show.id, fingerprint=fingerprint).first()
    if watch_obj:
        db.session.delete(watch_obj)
    else:
        watch_obj = TvWatched(tv_show_id=tv_show.id, fingerprint=fingerprint)
        db.session.add(watch_obj)

    try:
        db.session.commit()
        stats = get_tv_stats(tv_show.id, fingerprint)
        return jsonify(stats)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tv_shows_bp.route('/api/tv/<string:tv_id>/watch-later', methods=['POST'])
def toggle_tv_watch_later(tv_id):
    data = request.json or {}
    fingerprint = data.get('fingerprint')

    if not fingerprint:
        return jsonify({'error': 'Missing fingerprint'}), 400

    tv_show = resolve_tv_show(tv_id)
    if not tv_show:
        return jsonify({'error': 'TV Show not found'}), 404

    later_obj = TvWatchLater.query.filter_by(tv_show_id=tv_show.id, fingerprint=fingerprint).first()
    if later_obj:
        db.session.delete(later_obj)
    else:
        later_obj = TvWatchLater(tv_show_id=tv_show.id, fingerprint=fingerprint)
        db.session.add(later_obj)

    try:
        db.session.commit()
        stats = get_tv_stats(tv_show.id, fingerprint)
        return jsonify(stats)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tv_shows_bp.route('/api/tv/watch-later', methods=['GET'])
def get_user_tv_watch_later():
    fingerprint = request.args.get('fingerprint')
    if not fingerprint:
        return jsonify([])
        
    later_list = TvWatchLater.query.filter_by(fingerprint=fingerprint).all()
    results = []
    for item in later_list:
        tv = TVShow.query.get(item.tv_show_id)
        if tv:
            s_dict = tv.to_dict()
            results.append(add_tv_db_stats(s_dict, fingerprint))
    return jsonify(results)

@tv_shows_bp.route('/api/tv/<string:tv_id>/trg', methods=['POST'])
def save_trg_tv_stats(tv_id):
    data = request.json or {}
    rating_val = data.get('rating')
    review_text = data.get('review_text')

    tv_show = resolve_tv_show(tv_id)
    if not tv_show:
        return jsonify({'error': 'TV Show not found'}), 404

    # Update official rating
    if rating_val is not None:
        trg_rating = TvTrgRating.query.filter_by(tv_show_id=tv_show.id).first()
        if trg_rating:
            trg_rating.rating = float(rating_val)
        else:
            trg_rating = TvTrgRating(tv_show_id=tv_show.id, rating=float(rating_val))
            db.session.add(trg_rating)
            
    # Update official review
    if review_text is not None:
        trg_review = TvTrgReview.query.filter_by(tv_show_id=tv_show.id).first()
        if trg_review:
            trg_review.review_text = review_text
        else:
            trg_review = TvTrgReview(tv_show_id=tv_show.id, review_text=review_text)
            db.session.add(trg_review)

    try:
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tv_shows_bp.route('/api/tv/<string:tv_id>/metadata', methods=['PUT'])
def update_tv_metadata(tv_id):
    data = request.json or {}
    tv_show = resolve_tv_show(tv_id)
    if not tv_show:
        return jsonify({'error': 'TV Show not found'}), 404

    if 'youtube_review_url' in data:
        tv_show.youtube_review_url = data['youtube_review_url']
    if 'title' in data:
        tv_show.title = data['title']
    if 'overview' in data:
        tv_show.overview = data['overview']
    if 'first_air_date' in data:
        tv_show.first_air_date = data['first_air_date']
    if 'genres' in data:
        g = data['genres']
        if isinstance(g, list):
            tv_show.genres = ", ".join(g)
        else:
            tv_show.genres = g
    if 'poster_url' in data:
        tv_show.poster_url = data['poster_url']
    if 'backdrop_url' in data:
        tv_show.backdrop_url = data['backdrop_url']
    if 'language' in data:
        tv_show.language = data['language']

    try:
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tv_shows_bp.route('/api/tv', methods=['GET'])
def get_all_tv_shows():
    shows = TVShow.query.all()
    return jsonify([s.to_dict() for s in shows])

@tv_shows_bp.route('/api/tv/<string:tv_id>', methods=['DELETE'])
def delete_tv_show(tv_id):
    tv_show = resolve_tv_show(tv_id)
    if not tv_show:
        return jsonify({'error': 'TV Show not found'}), 404
        
    try:
        db.session.delete(tv_show)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# --- REVIEW REQUESTS ENDPOINTS ---

@tv_shows_bp.route('/api/review-requests', methods=['POST'])
def add_review_request():
    data = request.json or {}
    media_type = data.get('media_type')
    tmdb_id = data.get('tmdb_id')
    title = data.get('title')
    fingerprint = data.get('fingerprint')

    if not media_type or not tmdb_id or not title or not fingerprint:
        return jsonify({'error': 'Missing required fields'}), 400

    existing = ReviewRequest.query.filter_by(
        media_type=media_type,
        tmdb_id=int(tmdb_id),
        fingerprint=fingerprint
    ).first()

    if existing:
        return jsonify({'error': 'You have already requested this review'}), 400

    new_req = ReviewRequest(
        media_type=media_type,
        tmdb_id=int(tmdb_id),
        title=title,
        fingerprint=fingerprint
    )
    db.session.add(new_req)

    try:
        db.session.commit()
        # Return new count
        count = ReviewRequest.query.filter_by(media_type=media_type, tmdb_id=int(tmdb_id), status='pending').count()
        return jsonify({'success': True, 'count': count})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tv_shows_bp.route('/api/review-requests/<string:media_type>/<int:tmdb_id>', methods=['GET'])
def get_review_request_count(media_type, tmdb_id):
    fingerprint = request.args.get('fingerprint')
    count = ReviewRequest.query.filter_by(media_type=media_type, tmdb_id=tmdb_id, status='pending').count()
    has_requested = False
    if fingerprint:
        has_requested = ReviewRequest.query.filter_by(
            media_type=media_type,
            tmdb_id=tmdb_id,
            fingerprint=fingerprint
        ).first() is not None
    return jsonify({'count': count, 'has_requested': has_requested})

@tv_shows_bp.route('/api/review-requests/stats', methods=['GET'])
def get_review_requests_stats():
    # Group pending requests by tmdb_id and count them
    # For Movies
    movie_query = db.session.query(
        ReviewRequest.tmdb_id,
        ReviewRequest.title,
        db.func.count(ReviewRequest.id).label('votes')
    ).filter(
        ReviewRequest.media_type == 'movie',
        ReviewRequest.status == 'pending'
    ).group_by(
        ReviewRequest.tmdb_id,
        ReviewRequest.title
    ).order_by(db.desc('votes')).all()

    movies_list = [{'tmdb_id': r[0], 'title': r[1], 'requests': r[2]} for r in movie_query]

    # For TV Shows
    tv_query = db.session.query(
        ReviewRequest.tmdb_id,
        ReviewRequest.title,
        db.func.count(ReviewRequest.id).label('votes')
    ).filter(
        ReviewRequest.media_type == 'tv',
        ReviewRequest.status == 'pending'
    ).group_by(
        ReviewRequest.tmdb_id,
        ReviewRequest.title
    ).order_by(db.desc('votes')).all()

    tv_list = [{'tmdb_id': r[0], 'title': r[1], 'requests': r[2]} for r in tv_query]

    return jsonify({
        'movies': movies_list,
        'tv': tv_list
    })

@tv_shows_bp.route('/api/review-requests/manage', methods=['POST'])
def manage_review_requests():
    data = request.json or {}
    action = data.get('action') # 'reset', 'remove', 'completed'
    media_type = data.get('media_type')
    tmdb_id = data.get('tmdb_id')

    if not action or not media_type or tmdb_id is None:
        return jsonify({'error': 'Missing action, media_type, or tmdb_id'}), 400

    try:
        if action == 'reset' or action == 'remove':
            # Remove/Delete requests from DB
            db.session.query(ReviewRequest).filter_by(
                media_type=media_type,
                tmdb_id=int(tmdb_id)
            ).delete()
        elif action == 'completed':
            # Mark requests as completed (change status so they don't count in pending requests list)
            db.session.query(ReviewRequest).filter_by(
                media_type=media_type,
                tmdb_id=int(tmdb_id)
            ).update({'status': 'completed'})
            
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
