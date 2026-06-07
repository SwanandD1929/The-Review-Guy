from datetime import datetime
from backend.database import db

class TvWatched(db.Model):
    __tablename__ = 'tv_watched'

    id = db.Column(db.Integer, primary_key=True)
    tv_show_id = db.Column(db.Integer, db.ForeignKey('tv_shows.id', ondelete='CASCADE'), nullable=False)
    fingerprint = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('tv_show_id', 'fingerprint', name='uq_tv_fingerprint_watched'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'tv_show_id': self.tv_show_id,
            'fingerprint': self.fingerprint,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
