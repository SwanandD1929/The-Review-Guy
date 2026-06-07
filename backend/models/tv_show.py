from datetime import datetime
from backend.database import db

class TVShow(db.Model):
    __tablename__ = 'tv_shows'

    id = db.Column(db.Integer, primary_key=True)
    tmdb_id = db.Column(db.Integer, unique=True, nullable=True)
    title = db.Column(db.String(255), nullable=False) # Maps to TMDB 'name'
    overview = db.Column(db.Text, nullable=True)
    poster_url = db.Column(db.Text, nullable=True)
    backdrop_url = db.Column(db.Text, nullable=True)
    first_air_date = db.Column(db.String(50), nullable=True)
    genres = db.Column(db.String(255), nullable=True) # Comma-separated
    language = db.Column(db.String(50), nullable=True)
    youtube_review_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'tmdb_id': self.tmdb_id,
            'title': self.title,
            'overview': self.overview,
            'poster_url': self.poster_url,
            'backdrop_url': self.backdrop_url,
            'first_air_date': self.first_air_date,
            'genres': [g.strip() for g in self.genres.split(',')] if self.genres else [],
            'language': self.language,
            'youtube_review_url': self.youtube_review_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
