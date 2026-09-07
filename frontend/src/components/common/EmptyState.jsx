import React from 'react';
import { motion } from 'framer-motion';
import { SearchX, Utensils, AlertCircle } from 'lucide-react';

const EmptyState = ({
  icon: CustomIcon,
  title = 'No results found',
  description = "Looks like there aren't any items matching your criteria.",
  actionLabel,
  onAction,
}) => {
  const IconComponent = CustomIcon || SearchX;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200/90 shadow-soft max-w-lg mx-auto my-8"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <IconComponent className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-sm shadow-brand-500/20"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
