import React from 'react';
import { Star, User } from 'lucide-react';

export default function ReviewCard({ review }) {
  // Shorten user fingerprint to a friendly username (e.g., User_c81b)
  const getUsername = (fp) => {
    if (!fp) return 'Anonymous User';
    if (fp.startsWith('fingerprint_seed_user_')) {
      return `SeedUser_${fp.split('_').pop()}`;
    }
    const clean = fp.replace('fp_', '');
    return `User_${clean.substring(0, 4)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-gray-800/80 flex flex-col space-y-3 text-left">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* User Icon Badge */}
          <div className="h-8 w-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <User className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-200">
              {getUsername(review.fingerprint)}
            </h4>
            <span className="text-[10px] text-gray-400 font-light">
              {formatDate(review.created_at)}
            </span>
          </div>
        </div>

        {/* Rating Badge */}
        {review.rating && (
          <div className="flex items-center space-x-1 bg-yellow-500/10 border border-yellow-500/25 px-2 py-0.5 rounded-full text-[10px] font-bold text-yellow-400">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{review.rating}/10</span>
          </div>
        )}
      </div>

      {/* Review Body */}
      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans font-light pl-0.5">
        {review.review_text}
      </p>
    </div>
  );
}
