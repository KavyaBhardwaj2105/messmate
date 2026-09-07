import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const RatingBreakdown = ({ breakdown = {}, totalReviews = 0 }) => {
  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2.5 w-full">
      {stars.map((star) => {
        const item = breakdown[star] || { count: 0, percentage: 0 };
        const percentage = totalReviews > 0 ? item.percentage || 0 : 0;

        return (
          <div key={star} className="flex items-center gap-3 text-sm">
            {/* Star label */}
            <div className="flex items-center gap-1 w-12 font-medium text-slate-700 text-xs sm:text-sm">
              <span>{star}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>

            {/* Progress bar container */}
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  star >= 4
                    ? 'bg-amber-400'
                    : star === 3
                    ? 'bg-amber-300'
                    : 'bg-amber-200'
                }`}
              />
            </div>

            {/* Percentage & Count */}
            <div className="w-14 text-right text-xs font-semibold text-slate-500">
              {percentage}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RatingBreakdown;
