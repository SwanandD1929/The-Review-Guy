import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingWidget({ initialRating = null, onRate }) {
  const [hoverRating, setHoverRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(initialRating);

  const getRatingLabel = (rating) => {
    if (!rating) return 'Rate this film';
    const labels = {
      1: 'Appalling',
      2: 'Horrible',
      3: 'Very Bad',
      4: 'Bad',
      5: 'Average',
      6: 'Fine',
      7: 'Good',
      8: 'Very Good',
      9: 'Great',
      10: 'Masterpiece'
    };
    return `${rating} / 10 — ${labels[rating]}`;
  };

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
    if (onRate) {
      onRate(rating);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-2 select-none">
      {/* Rating Label */}
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {getRatingLabel(hoverRating || selectedRating)}
      </span>

      {/* 10 Star Button Row */}
      <div className="flex items-center space-x-1.5 py-1">
        {[...Array(10)].map((_, index) => {
          const starValue = index + 1;
          const isActive = hoverRating !== null ? starValue <= hoverRating : starValue <= selectedRating;
          
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => handleRatingClick(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              className="focus:outline-none transition-transform active:scale-90 hover:scale-110 cursor-pointer"
            >
              <Star
                className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${
                  isActive
                    ? 'text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
