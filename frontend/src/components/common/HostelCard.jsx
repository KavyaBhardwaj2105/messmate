import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  Utensils,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

const HostelCard = ({ hostel }) => {
  const {
    _id,
    name,
    city,
    monthlyMessCost,
    avgRating = 0,
    totalReviews = 0,
    foodAvailability,
    categoryRatings,
    images = [],
  } = hostel;

  const rating = Number(avgRating || 0).toFixed(1);
  const price =
    monthlyMessCost !== undefined &&
    monthlyMessCost !== null &&
    monthlyMessCost !== ''
      ? `₹${Number(monthlyMessCost).toLocaleString('en-IN')}/month`
      : 'Price not listed';

  const foodLabel =
    foodAvailability === true
      ? 'Food Available'
      : foodAvailability === false
        ? 'Food Not Listed'
        : 'Food Info Available';

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft hover:shadow-lifted hover:border-brand-200 dark:hover:border-brand-500/50 transition-all duration-300 overflow-hidden"
    >
      {images[0]?.url ? (
        <Link
          to={'/hostels/' + _id}
          className="block h-44 overflow-hidden bg-slate-100 dark:bg-slate-800"
        >
          <img
            src={images[0].url}
            alt={images[0].alt || name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
      ) : (
        <div className="h-24 bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700" />
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <Link
              to={'/hostels/' + _id}
              className="block text-lg font-extrabold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate"
            >
              {name}
            </Link>

            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{city || 'Location not listed'}</span>
            </div>
          </div>

          <div className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-extrabold">
            <Star className="w-3.5 h-3.5 fill-current" />
            {rating}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <Utensils className="w-3.5 h-3.5" />
            {foodLabel}
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {categoryRatings && Object.keys(categoryRatings).length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {Object.entries(categoryRatings)
              .slice(0, 4)
              .map(([category, value]) => (
                <div
                  key={category}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-slate-500 dark:text-slate-400 truncate capitalize">
                    {category}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {Number(value || 0).toFixed(1)}
                  </span>
                </div>
              ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Monthly mess cost
            </p>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {price}
            </p>
          </div>

          <Link
            to={'/hostels/' + _id}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            View
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default HostelCard;
