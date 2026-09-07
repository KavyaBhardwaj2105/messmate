import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Edit3, Trash2, Tag, Calendar, User } from 'lucide-react';
import StarRating from './StarRating';
import { useAuth } from '../../context/AuthContext';

const ReviewCard = ({ review, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    _id,
    user: author,
    rating,
    categories,
    tags = [],
    comment,
    images = [],
    createdAt,
  } = review;

  const isAuthor =
    user &&
    (author?._id === user._id || author === user._id || author?._id?.toString() === user._id?.toString());

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const authorName = author?.name || 'Student Resident';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(_id);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all"
    >
      {/* Review Header */}
      <div className="flex items-start justify-between gap-4 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-100 to-brand-200 text-brand-700 font-bold text-sm flex items-center justify-center border border-brand-200 shadow-sm uppercase">
            {authorName.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              {authorName}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              {isAuthor && (
                <span className="px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded text-[10px] font-bold">
                  You
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rating and Author Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-extrabold text-amber-900">
              {Number(rating).toFixed(1)}
            </span>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => onEdit && onEdit(review)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                title="Edit review"
                aria-label="Edit review"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete review"
                aria-label="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Warning */}
      {confirmDelete && (
        <div className="my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800">
          <span>Are you sure you want to delete your review?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Review Comment */}
      <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line mb-3.5">
        {comment}
      </p>

      {images.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">{images.map((img,i)=><a href={img.url} target="_blank" rel="noreferrer" key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100"><img src={img.url} alt={img.alt || 'Food photo'} className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy"/></a>)}</div>}

      {/* Categories Mini-Breakdown if available */}
      {categories && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
          {categories.taste && (
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg">
              <span className="text-slate-400">Taste</span>
              <span className="font-bold text-slate-800">{categories.taste}★</span>
            </div>
          )}
          {categories.hygiene && (
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg">
              <span className="text-slate-400">Hygiene</span>
              <span className="font-bold text-slate-800">{categories.hygiene}★</span>
            </div>
          )}
          {categories.portionSize && (
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg">
              <span className="text-slate-400">Portions</span>
              <span className="font-bold text-slate-800">{categories.portionSize}★</span>
            </div>
          )}
          {categories.variety && (
            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg">
              <span className="text-slate-400">Variety</span>
              <span className="font-bold text-slate-800">{categories.variety}★</span>
            </div>
          )}
        </div>
      )}

      {/* Tags / Pills */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              <Tag className="w-3 h-3 text-slate-400" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ReviewCard;
