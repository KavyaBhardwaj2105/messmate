import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, IndianRupee, Utensils, AlignLeft, Loader2, Sparkles, ImagePlus, X } from 'lucide-react';
import { uploadService } from '../../services/api';
import HostelCard from '../common/HostelCard';

const POPULAR_CITIES = [
  'Delhi',
  'Meerut',
  'Kota',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Jaipur',
  'Noida',
  'Chennai',
  'Mumbai',
  'Indore',
  'Chandigarh',
];

const FOOD_OPTIONS = [
  '3 Meals / Day (Breakfast, Lunch & Dinner)',
  '3 Meals + Evening Tea & Snacks',
  'Breakfast & Dinner (Mon-Fri) + 3 Meals (Weekends)',
  'Pure Veg (3 Meals / Day)',
  'Veg + Non-Veg (Special Days)',
  'Lunch & Dinner Only',
];

const HostelForm = ({ initialData, onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    city: initialData?.city || '',
    monthlyMessCost: initialData?.monthlyMessCost || '',
    foodAvailability: initialData?.foodAvailability || '3 Meals / Day (Breakfast, Lunch & Dinner)',
    address: initialData?.address || '',
    description: initialData?.description || '',
  });
  const [images, setImages] = useState(initialData?.images || []);
  const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Hostel or PG name is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.monthlyMessCost || Number(formData.monthlyMessCost) < 0) {
      errs.monthlyMessCost = 'Please provide a valid monthly mess cost (₹)';
    } else if (Number(formData.monthlyMessCost) > 1000000) {
      errs.monthlyMessCost = 'Monthly mess cost seems unrealistically high';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setUploading(true);
    try {
      const pending = images.filter(x=>typeof x==='string');
      const existing = images.filter(x=>typeof x!=='string');
      const uploaded = pending.length ? (await uploadService.uploadImages(pending)).data.images : [];
      await onSubmit({ ...formData, monthlyMessCost: Number(formData.monthlyMessCost), images: [...existing, ...uploaded] });
    } catch (err) { setErrors(prev=>({...prev, images: err.message || 'Image upload failed.'})); } finally { setUploading(false); }
  };

  // Simulated hostel object for live preview
  const previewHostel = {
    _id: 'preview',
    name: formData.name.trim() || 'Sunrise Student PG & Mess',
    city: formData.city.trim() || 'Meerut',
    monthlyMessCost: Number(formData.monthlyMessCost) || 3000,
    foodAvailability: formData.foodAvailability,
    avgRating: initialData?.avgRating || 0,
    totalReviews: initialData?.totalReviews || 0,
    categoryRatings: { taste: 4.5, hygiene: 4.5 },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left / Main Form Column */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Hostel photos</label>
            <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-300 cursor-pointer"><ImagePlus className="w-5 h-5 text-brand-600"/><span className="text-sm font-semibold text-slate-600">Add up to 8 photos</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={async e=>{const files=Array.from(e.target.files||[]);if(images.length+files.length>8){setErrors(prev=>({...prev,images:'You can add up to 8 photos.'}));return;}const urls=await Promise.all(files.map(f=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',0.82))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(f)})));setImages(prev=>[...prev,...urls]);}}/></label>
            {errors.images&&<p className="text-xs text-rose-600 mt-1">{errors.images}</p>}
            {images.length>0&&<div className="grid grid-cols-3 gap-2 mt-3">{images.map((img,i)=><div key={i} className="relative aspect-square rounded-xl overflow-hidden"><img src={img.url||img} alt="Hostel" className="w-full h-full object-cover"/><button type="button" onClick={()=>setImages(prev=>prev.filter((_,idx)=>idx!==i))} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"><X className="w-3.5 h-3.5"/></button></div>)}</div>}
          </div>

          {/* Hostel Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Hostel / PG Name *
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Starlight Student Residency or Sunrise PG"
                className={`w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border ${
                  errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-brand-500'
                } focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              />
            </div>
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* City Selection & Input */}
          <div>
            <label
              htmlFor="city"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              City / Location *
            </label>
            <div className="relative mb-2.5">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                maxLength={60}
                placeholder="e.g. Delhi, Meerut, Kota, Bengaluru..."
                className={`w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border ${
                  errors.city ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-brand-500'
                } focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              />
            </div>
            {/* Quick city pill suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, city: c }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    formData.city.toLowerCase() === c.toLowerCase()
                      ? 'bg-brand-100 text-brand-700 border border-brand-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
          </div>

          {/* Monthly Mess Cost */}
          <div>
            <label
              htmlFor="monthlyMessCost"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Monthly Mess Cost (₹) *
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </div>
              <input
                type="number"
                id="monthlyMessCost"
                name="monthlyMessCost"
                value={formData.monthlyMessCost}
                onChange={handleChange}
                placeholder="e.g. 3500"
                min="0"
                step="50"
                className={`w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border ${
                  errors.monthlyMessCost
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-brand-500'
                } focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              />
            </div>
            {errors.monthlyMessCost && (
              <p className="text-xs text-rose-500 mt-1">{errors.monthlyMessCost}</p>
            )}
          </div>

          {/* Food Availability Menu */}
          <div>
            <label
              htmlFor="foodAvailability"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Food Availability / Meals
            </label>
            <div className="relative">
              <Utensils className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                id="foodAvailability"
                name="foodAvailability"
                value={formData.foodAvailability}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {FOOD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Street Address / Landmark (Optional)
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              maxLength={250}
              placeholder="e.g. Near University North Campus Gate 4, Hudson Lane"
              className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
            >
              Description & Mess Timings (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              maxLength={1000}
              placeholder="Mention special cuisines, Sunday meal timings, hygiene standards, dining hall seating capacity..."
              className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.99] shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Hostel...
              </>
            ) : initialData ? (
              'Save Changes'
            ) : (
              'Add Hostel / PG'
            )}
          </button>
        </form>
      </div>

      {/* Right Column: Live Card Preview */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-500" /> Live Listing Preview
        </div>
        <HostelCard hostel={previewHostel} />

        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 leading-relaxed space-y-1.5">
          <p className="font-bold flex items-center gap-1.5">
            💡 Tip for Community Contributor:
          </p>
          <p>
            Adding accurate mess costs and meal types helps freshers make well-informed decisions before paying hefty upfront deposits!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HostelForm;
