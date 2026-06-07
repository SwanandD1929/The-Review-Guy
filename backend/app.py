import os
import random
from flask import Flask
from flask_cors import CORS
from backend.database import db
from backend.models.movie import Movie
from backend.models.rating import Rating
from backend.models.review import Review
from backend.models.watched import Watched
from backend.routes.movies import movies_bp
from backend.routes.tv_shows import tv_shows_bp
from backend.services import tmdb_service

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# SQLite database setup
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'logicverse.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Register blueprints
app.register_blueprint(movies_bp)
app.register_blueprint(tv_shows_bp)

# Curated reviews list for seeding
SEED_REVIEWS = [
    "Absolute masterpiece! The story, cinematography, and acting were top notch.",
    "A visually stunning piece of cinema, though the pacing felt a bit slow in the second act.",
    "The soundtrack is incredible and really carries the emotional weight of the film.",
    "One of the best movies of the decade. A must-watch on the biggest screen possible!",
    "Great direction and acting, though I felt the script could have been tighter.",
    "Mind-bending plot that leaves you thinking long after the credits roll.",
    "An absolute classic. I've watched it multiple times and it never gets old.",
    "Good, but slightly overrated in my opinion. Still worth a watch."
]

def seed_database():
    # Only seed if database is empty
    if Movie.query.count() == 0:
        print("Seeding database with initial movies, ratings, and reviews...")
        
        # 1. Seed Movies
        seeded_movies = []
        for m in tmdb_service.MOCK_MOVIES:
            new_movie = Movie(
                tmdb_id=m['id'],
                title=m['title'],
                overview=m['overview'],
                poster_url=m['poster_url'],
                backdrop_url=m['backdrop_url'],
                release_date=m['release_date'],
                genres=m['genres'],
                language=m['language']
            )
            db.session.add(new_movie)
            seeded_movies.append(new_movie)
        
        db.session.flush() # Populate IDs

        # No community stats seeded (all starts at zero)
        pass

        try:
            db.session.commit()
            print("Database successfully seeded!")
        except Exception as e:
            db.session.rollback()
            print(f"Error seeding database: {e}")

def update_seeded_movies():
    for m in tmdb_service.MOCK_MOVIES:
        # Since MOCK_MOVIES now has tmdb_id populated:
        movie = Movie.query.filter_by(tmdb_id=m['tmdb_id']).first()
        if movie:
            if movie.poster_url != m['poster_url']:
                movie.poster_url = m['poster_url']
            if movie.backdrop_url != m['backdrop_url']:
                movie.backdrop_url = m['backdrop_url']
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error updating seeded movies: {e}")

def alter_tables_on_startup():
    try:
        with db.engine.connect() as conn:
            columns = [row[1] for row in conn.execute(db.text("PRAGMA table_info(movies)")).fetchall()]
            if 'youtube_review_url' not in columns:
                print("Adding column youtube_review_url to movies table...")
                conn.execute(db.text("ALTER TABLE movies ADD COLUMN youtube_review_url TEXT"))
                conn.commit()
                print("Column youtube_review_url added successfully!")
    except Exception as e:
        print(f"Error altering movies table: {e}")

with app.app_context():
    alter_tables_on_startup()
    db.create_all()
    seed_database()
    update_seeded_movies()

if __name__ == '__main__':
    app.run(port=5000, debug=True)
