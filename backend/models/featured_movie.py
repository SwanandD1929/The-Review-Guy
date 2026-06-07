from datetime import datetime
from backend.database import db

class FeaturedMovie(db.Model):
    __tablename__ = 'featured_movies'

    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id', ondelete='CASCADE'), nullable=False)
    short_verdict = db.Column(db.String(255), nullable=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'movie_id': self.movie_id,
            'short_verdict': self.short_verdict,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
