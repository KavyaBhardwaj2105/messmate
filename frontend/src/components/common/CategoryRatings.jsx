import React from 'react';
import { Sparkles, ShieldCheck, Scale, Layers } from 'lucide-react';
import StarRating from './StarRating';

const CategoryRatings = ({ categoryRatings = {} }) => {
  const categories = [
    {
      key: 'taste',
      label: 'Taste',
      score: categoryRatings.taste || 0,
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-50 border-amber-100',
    },
    {
      key: 'hygiene',
      label: 'Hygiene',
      score: categoryRatings.hygiene || 0,
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      key: 'portionSize',
      label: 'Portion Size',
      score: categoryRatings.portionSize || 0,
      icon: Scale,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      key: 'variety',
      label: 'Variety',
      score: categoryRatings.variety || 0,
      icon: Layers,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {categories.map((cat) => {
        const IconComponent = cat.icon;
        const scoreFormatted = cat.score > 0 ? Number(cat.score).toFixed(1) : 'N/A';

        return (
          <div
            key={cat.key}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {cat.label}
              </span>
              <div className={`p-1.5 rounded-xl border ${cat.color}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  {scoreFormatted}
                </span>
                {cat.score > 0 && (
                  <span className="text-xs font-medium text-slate-400">/ 5</span>
                )}
              </div>
              <div className="mt-1">
                <StarRating rating={cat.score} size="sm" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryRatings;
