import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Utensils, MessageSquare, ArrowRight, IndianRupee } from 'lucide-react';

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

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-lifted hover:border-brand-200 transition-all duration-300 overflow-hidden"
    >
      {images[0]?.url ? <Link to={`/hostels/${_id}`} className="block h-44 overflow-hidden bg-slate-100"><img src={images[0].url} alt={images[0].alt || name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/></Link> : <div className="h-24 bg-gradient-to-br from-brand-50 to-indigo-50" />}

      {/* Top Card Section */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        {/* Header row: City & Rating Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-brand-500" />
            {city}
          </span>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm ${
              avgRating >= 4.0
                ? 'bg-amber-500 text-white'
                : avgRating >= 3.0
                ? 'bg-amber-400 text-slate-900'
                : avgRating > 0
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{avgRating > 0 ? Number(avgRating).toFixed(1) : 'New'}</span>
          </div>
        </div>

        {/* Hostel Title & Details */}
        <div>
          <Link to={`/hostels/${_id}`} className="focus:outline-none">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {name}
            </h3>
          </Link>
          {foodAvailability && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
              <Utensils className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{foodAvailability}</span>
            </p>
          )}
        </div>

        {/* Quick Category highlights if available */}
        {categoryRatings && categoryRatings.taste > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-400">Taste</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {Number(categoryRatings.taste).toFixed(1)}
            </span>

            <span className="text-slate-300">•</span>

            <span className="text-slate-400">Hygiene</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {Number(categoryRatings.hygiene).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer: Mess Cost & CTA */}
      <div className="px-5 sm:px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Monthly Mess
          </p>
          <p className="text-base font-extrabold text-slate-900 flex items-center">
            ₹{monthlyMessCost?.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-slate-500 ml-0.5">/mo</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>

          <Link
            to={`/hostels/${_id}`}
            className="p-2 rounded-xl bg-white group-hover:bg-brand-600 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-brand-600 shadow-sm transition-all"
            aria-label={`View reviews for ${name}`}
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default HostelCard;
