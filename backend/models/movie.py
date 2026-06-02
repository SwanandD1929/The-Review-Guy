from datetime import datetime
from backend.database import db

class Movie(db.Model):
    __tablename__ = 'movies'

    id = db.Column(db.Integer, primary_key=True)
    tmdb_id = db.Column(db.Integer, unique=True, nullable=True)
    title = db.Column(db.String(255), nullable=False)
    overview = db.Column(db.Text, nullable=True)
    poster_url = db.Column(db.Text, nullable=True)
    backdrop_url = db.Column(db.Text, nullable=True)
    release_date = db.Column(db.String(50), nullable=True)
    genres = db.Column(db.String(255), nullable=True)  # Comma-separated genres
    language = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'tmdb_id': self.tmdb_id,
            'title': self.title,
            'overview': self.overview,
            'poster_url': self.poster_url,
            'backdrop_url': self.backdrop_url,
            'release_date': self.release_date,
            'genres': [g.strip() for g in self.genres.split(',')] if self.genres else [],
            'language': self.language,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
