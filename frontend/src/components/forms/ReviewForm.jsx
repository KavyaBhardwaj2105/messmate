import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Tag, Check, Loader2, Sparkles, ShieldCheck, Scale, Layers, ImagePlus, X } from 'lucide-react';
import { uploadService } from '../../services/api';
import StarRating from '../common/StarRating';

const POPULAR_TAGS = [
  'Taste',
  'Hygiene',
  'Good Portions',
  'Variety',
  'Sunday Special',
  'Homestyle',
  'Value for Money',
  'Healthy Options',
  'Crispy Rotis',
  'Evening Snacks',
];

const ReviewForm = ({ initialData, onSubmit, onCancel, isSubmitting = false }) => {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [categories, setCategories] = useState({
    taste: initialData?.categories?.taste || initialData?.rating || 5,
    hygiene: initialData?.categories?.hygiene || initialData?.rating || 5,
    portionSize: initialData?.categories?.portionSize || initialData?.rating || 4,
    variety: initialData?.categories?.variety || initialData?.rating || 4,
  });
  const [selectedTags, setSelectedTags] = useState(initialData?.tags || ['Taste', 'Hygiene']);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [images, setImages] = useState(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Update initial data if changed
  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating || 5);
      setCategories({
        taste: initialData.categories?.taste || initialData.rating || 5,
        hygiene: initialData.categories?.hygiene || initialData.rating || 5,
        portionSize: initialData.categories?.portionSize || initialData.rating || 4,
        variety: initialData.categories?.variety || initialData.rating || 4,
      });
      setSelectedTags(initialData.tags || []);
      setComment(initialData.comment || '');
      setImages(initialData.images || []);
    }
  }, [initialData]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCategoryChange = (key, val) => {
    setCategories((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please choose an overall rating between 1 and 5 stars.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 3) {
      setError('Please provide at least a short comment (min 3 characters).');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const pending = images.filter((x) => typeof x === 'string');
      const existing = images.filter((x) => typeof x !== 'string');
      const uploaded = pending.length ? (await uploadService.uploadImages(pending)).data.images : [];
      await onSubmit({ rating: Number(rating), categories, tags: selectedTags, comment: comment.trim(), images: [...existing, ...uploaded] });
    } catch (err) { setError(err.message || 'Image upload failed. Please try again.'); } finally { setUploading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
          {error}
        </div>
      )}

      {/* Main Overall Rating */}
      <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-100 flex flex-col items-center justify-center text-center gap-2">
        <label className="text-xs font-extrabold uppercase tracking-wider text-brand-900">
          Overall Food Rating *
        </label>
        <div className="py-1">
          <StarRating rating={rating} interactive onChange={(val) => setRating(val)} size="xl" />
        </div>
        <span className="text-sm font-bold text-brand-700">
          {rating === 5 && 'Outstanding! (5.0)'}
          {rating === 4 && 'Good Food (4.0)'}
          {rating === 3 && 'Average / Manageable (3.0)'}
          {rating === 2 && 'Needs Improvement (2.0)'}
          {rating === 1 && 'Poor Quality (1.0)'}
        </span>
      </div>

      {/* Category Ratings Breakdown */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Category Ratings (Optional)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Taste */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Taste
            </span>
            <StarRating
              rating={categories.taste}
              interactive
              onChange={(val) => handleCategoryChange('taste', val)}
              size="sm"
            />
          </div>

          {/* Hygiene */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Hygiene
            </span>
            <StarRating
              rating={categories.hygiene}
              interactive
              onChange={(val) => handleCategoryChange('hygiene', val)}
              size="sm"
            />
          </div>

          {/* Portion Size */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-600" /> Portions
            </span>
            <StarRating
              rating={categories.portionSize}
              interactive
              onChange={(val) => handleCategoryChange('portionSize', val)}
              size="sm"
            />
          </div>

          {/* Variety */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" /> Variety
            </span>
            <StarRating
              rating={categories.variety}
              interactive
              onChange={(val) => handleCategoryChange('variety', val)}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Tags Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Select Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5 text-slate-400" />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Comment Textarea */}
      <div>
        <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          How was the food? *
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your authentic experience with the mess: taste, Sunday specials, chapati softness, cleanliness, breakfast menu..."
          required
          className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-slate-400"
        />
        <p className="text-[11px] text-slate-400 text-right mt-1">
          {comment.length} / 1000 characters
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Food photos (up to 6)</label>
        <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-300 cursor-pointer transition-colors">
          <ImagePlus className="w-5 h-5 text-brand-600" /><span className="text-sm font-semibold text-slate-600">Add photos from your device</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={async e=>{const files=Array.from(e.target.files||[]); if(images.length+files.length>6){setError('You can add up to 6 photos.');return;} const urls=await Promise.all(files.map(f=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',0.82))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(f)})));setImages(prev=>[...prev,...urls]);}}/>
        </label>
        {images.length>0&&<div className="grid grid-cols-3 gap-2 mt-3">{images.map((img,i)=><div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100"><img src={img.url||img} alt="Review food" className="w-full h-full object-cover"/><button type="button" onClick={()=>setImages(prev=>prev.filter((_,idx)=>idx!==i))} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"><X className="w-3.5 h-3.5"/></button></div>)}</div>}
        {uploading&&<p className="text-[11px] text-brand-600 mt-2 font-semibold">Uploading photos securely…</p>}
      </div>

      {/* Submit / Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || uploading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-md shadow-brand-500/25 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : initialData ? (
            'Update Review'
          ) : (
            'Post Review'
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
