from datetime import datetime
from backend.database import db

class TrgReview(db.Model):
    __tablename__ = 'trg_reviews'

    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id', ondelete='CASCADE'), unique=True, nullable=False)
    review_text = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(255), default="The Review Guy")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'movie_id': self.movie_id,
            'review_text': self.review_text,
            'author': self.author,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
