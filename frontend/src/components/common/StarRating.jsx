import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({
  rating = 0,
  interactive = false,
  onChange,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  showScore = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  const currentDisplay = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = currentDisplay >= starValue;
          const isPartiallyFilled = !isFilled && currentDisplay >= starValue - 0.5;

          if (interactive) {
            return (
              <motion.button
                key={starValue}
                type="button"
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={() => onChange && onChange(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-slate-300 focus:outline-none transition-colors"
                aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
              >
                <Star
                  className={`${starSize} transition-colors duration-150 ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                      : 'text-slate-300 hover:text-amber-300'
                  }`}
                />
              </motion.button>
            );
          }

          return (
            <span key={starValue} className="inline-block p-0.5">
              <Star
                className={`${starSize} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isPartiallyFilled
                    ? 'fill-amber-300/60 text-amber-400'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            </span>
          );
        })}
      </div>

      {showScore && (
        <span className="ml-1.5 text-sm font-bold text-slate-800">
          {rating > 0 ? Number(rating).toFixed(1) : 'New'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
