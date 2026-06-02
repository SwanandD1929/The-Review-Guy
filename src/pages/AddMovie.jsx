import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { PlusCircle, ArrowRight, AlertCircle, Sparkles, ChevronLeft } from 'lucide-react';

export default function AddMovie() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    release_date: '',
    poster_url: '',
    genres: '',
    language: 'en',
    overview: '',
    backdrop_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Movie Name is required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const res = await apiService.addMovie({
        title: formData.title.trim(),
        release_date: formData.release_date || new Date().toISOString().split('T')[0],
        poster_url: formData.poster_url.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
        backdrop_url: formData.backdrop_url.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1920',
        genres: formData.genres.trim() || 'Drama',
        language: formData.language.trim()
      });

      if (res.exists) {
        setSuccessInfo("Movie already exists in database. Redirecting you to details...");
        const targetId = res.movie.local_id || res.movie.id;
        setTimeout(() => {
          navigate(`/movie/${targetId}`);
        }, 2000);
      } else {
        setSuccessInfo("Movie successfully added! Redirecting...");
        const targetId = res.movie.local_id || res.movie.id;
        setTimeout(() => {
          navigate(`/movie/${targetId}`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to add movie. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-10 rounded-3xl border border-gray-800/80 text-left space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <Link to="/" className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-amber-400 transition-colors mb-2">
            <ChevronLeft className="h-3 w-3" />
            <span>Back to Discovery</span>
          </Link>
          
          <h1 className="text-2xl sm:text-4xl font-serif tracking-wide flex items-center space-x-2">
            <PlusCircle className="h-7 w-7 text-amber-500" />
            <span>Add a <span className="italic text-amber-500">Movie</span></span>
          </h1>
          <p className="text-xs text-gray-400 font-light font-sans">
            Submit custom releases to the community catalog. If it already exists, you will be redirected automatically.
          </p>
        </div>

        {/* Messaging status alerts */}
        {error && (
          <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl flex items-center space-x-2 text-xs text-amber-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-2xl flex items-center space-x-2 text-xs text-emerald-400">
            <Sparkles className="h-4 w-4 flex-shrink-0 text-emerald-400 animate-spin" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Add Movie Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
          
          {/* Row 1: Movie Name */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-gray-400 font-semibold uppercase tracking-wider">Movie Name *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Interstellar"
              className="bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 text-gray-200 p-3.5 rounded-xl focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Row 2: Release Date & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-gray-400 font-semibold uppercase tracking-wider">Release Date</label>
              <input
                type="date"
                name="release_date"
                value={formData.release_date}
                onChange={handleChange}
                className="bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 text-gray-200 p-3.5 rounded-xl focus:outline-none transition-colors"
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label className="text-gray-400 font-semibold uppercase tracking-wider">Language Code</label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="e.g. en, te, hi"
                className="bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 text-gray-200 p-3.5 rounded-xl focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Genres & Poster URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-gray-400 font-semibold uppercase tracking-wider">Genres (comma-separated)</label>
              <input
                type="text"
                name="genres"
                value={formData.genres}
                onChange={handleChange}
                placeholder="e.g. Sci-Fi, Drama, Adventure"
                className="bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 text-gray-200 p-3.5 rounded-xl focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-gray-400 font-semibold uppercase tracking-wider">Poster Image URL</label>
              <input
                type="url"
                name="poster_url"
                value={formData.poster_url}
                onChange={handleChange}
                placeholder="https://example.com/poster.jpg"
                className="bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 text-gray-200 p-3.5 rounded-xl focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Backdrop URL (Optional) */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-gray-400 font-semibold uppercase tracking-wider">Backdrop Image URL (Optional)</label>
            <input
              type="url"
              name="backdrop_url"
              value={formData.backdrop_url}
              onChange={handleChange}
              placeholder="https://example.com/backdrop.jpg"
              className="bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 text-gray-200 p-3.5 rounded-xl focus:outline-none transition-colors"
            />
          </div>

          {/* Row 4: Overview / Synopsis */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-gray-400 font-semibold uppercase tracking-wider">Overview / Synopsis</label>
            <textarea
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              placeholder="Provide a brief summary of the film..."
              rows="4"
              className="w-full bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 text-gray-200 p-4 rounded-xl focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-amber-950/20 active:scale-98 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Add Movie</span>
                <ArrowRight className="h-4 w-4 stroke-[3px]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
