from datetime import datetime
from backend.database import db

class WatchLater(db.Model):
    __tablename__ = 'watch_later'

    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id', ondelete='CASCADE'), nullable=False)
    fingerprint = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # A user can add a movie to watch later once
    __table_args__ = (
        db.UniqueConstraint('movie_id', 'fingerprint', name='uq_movie_fingerprint_watch_later'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'movie_id': self.movie_id,
            'fingerprint': self.fingerprint,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
