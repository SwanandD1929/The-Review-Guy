from datetime import datetime
from backend.database import db

class Rating(db.Model):
    __tablename__ = 'ratings'

    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id', ondelete='CASCADE'), nullable=False)
    fingerprint = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-10
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Enforce uniqueness of fingerprint per movie
    __table_args__ = (
        db.UniqueConstraint('movie_id', 'fingerprint', name='uq_movie_fingerprint_rating'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'movie_id': self.movie_id,
            'fingerprint': self.fingerprint,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
