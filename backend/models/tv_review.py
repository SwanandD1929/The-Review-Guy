from datetime import datetime
from backend.database import db

class TvReview(db.Model):
    __tablename__ = 'tv_reviews'

    id = db.Column(db.Integer, primary_key=True)
    tv_show_id = db.Column(db.Integer, db.ForeignKey('tv_shows.id', ondelete='CASCADE'), nullable=False)
    fingerprint = db.Column(db.String(255), nullable=False)
    review_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'tv_show_id': self.tv_show_id,
            'fingerprint': self.fingerprint,
            'review_text': self.review_text,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
