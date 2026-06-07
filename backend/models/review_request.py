from datetime import datetime
from backend.database import db

class ReviewRequest(db.Model):
    __tablename__ = 'review_requests'

    id = db.Column(db.Integer, primary_key=True)
    media_type = db.Column(db.String(50), nullable=False) # 'movie' or 'tv'
    tmdb_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False) # Cache title for display
    fingerprint = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='pending') # 'pending' or 'completed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('media_type', 'tmdb_id', 'fingerprint', name='uq_media_fingerprint_request'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'media_type': self.media_type,
            'tmdb_id': self.tmdb_id,
            'title': self.title,
            'fingerprint': self.fingerprint,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
