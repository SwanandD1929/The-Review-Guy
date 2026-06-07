from datetime import datetime
from backend.database import db

class TrgRating(db.Model):
    __tablename__ = 'trg_ratings'

    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id', ondelete='CASCADE'), unique=True, nullable=False)
    rating = db.Column(db.Float, nullable=False)  # decimal rating 1.0 - 10.0
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'movie_id': self.movie_id,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
