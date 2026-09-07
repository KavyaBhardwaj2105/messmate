import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  IndianRupee,
  Utensils,
  MessageSquare,
  PlusCircle,
  Edit3,
  Trash2,
  Share2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowUpDown,
  Tag,
  Loader2,
} from 'lucide-react';
import { hostelService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/common/StarRating';
import RatingBreakdown from '../components/common/RatingBreakdown';
import CategoryRatings from '../components/common/CategoryRatings';
import ReviewCard from '../components/common/ReviewCard';
import { DetailsSkeleton, ReviewSkeletonCard } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import ReviewForm from '../components/forms/ReviewForm';
import PageContainer from '../components/layout/PageContainer';

const HostelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // State
  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSort, setReviewSort] = useState('newest');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDeletingHostel, setIsDeletingHostel] = useState(false);
  const [showDeleteHostelModal, setShowDeleteHostelModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Fetch hostel details & stats
  const fetchHostelData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await hostelService.getById(id);
      if (res.data?.success) {
        setHostel(res.data.hostel);
      }
    } catch (err) {
      showError(err.message || 'Failed to load hostel details.');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  // Fetch reviews for this hostel
  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const res = await reviewService.getForHostel(id, { sort: reviewSort });
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id, reviewSort]);

  useEffect(() => {
    fetchHostelData();
  }, [fetchHostelData]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Find if current user has already reviewed this hostel
  const existingUserReview = reviews.find(
    (r) =>
      user &&
      (r.user?._id === user._id || r.user === user._id || r.user?._id?.toString() === user._id?.toString())
  );

  // Review submission handler (Create or Update)
  const handleReviewSubmit = async (formData) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await reviewService.postForHostel(id, formData);
      if (res.data?.success) {
        showSuccess(res.data.message);
        setIsReviewModalOpen(false);
        setEditingReview(null);
        // Refresh both hostel stats and reviews list
        await Promise.all([fetchHostelData(), fetchReviews()]);
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Delete review handler
  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await reviewService.delete(reviewId);
      if (res.data?.success) {
        showSuccess(res.data.message);
        await Promise.all([fetchHostelData(), fetchReviews()]);
      }
    } catch (err) {
      showError(err.message);
    }
  };

  // Delete hostel handler (Owner only)
  const handleDeleteHostel = async () => {
    try {
      setIsDeletingHostel(true);
      const res = await hostelService.delete(id);
      if (res.data?.success) {
        showSuccess('Hostel removed successfully.');
        navigate('/explore');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsDeletingHostel(false);
      setShowDeleteHostelModal(false);
    }
  };

  // Open review modal for new or existing review
  const handleOpenReviewModal = () => {
    if (!isAuthenticated) {
      showInfo('Please sign in to rate this hostel mess.');
      navigate('/login');
      return;
    }
    if (existingUserReview) {
      setEditingReview(existingUserReview);
    } else {
      setEditingReview(null);
    }
    setIsReviewModalOpen(true);
  };

  // Copy shareable link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <PageContainer maxWidth="max-w-5xl">
        <DetailsSkeleton />
      </PageContainer>
    );
  }

  if (!hostel) {
    return (
      <PageContainer maxWidth="max-w-3xl">
        <EmptyState
          title="Hostel Not Found"
          description="The hostel you are looking for does not exist or has been removed."
          actionLabel="Back to Explore"
          onAction={() => navigate('/explore')}
        />
      </PageContainer>
    );
  }

  const isCreator =
    user &&
    (hostel.createdBy?._id === user._id ||
      hostel.createdBy === user._id ||
      hostel.createdBy?._id?.toString() === user._id?.toString());

  return (
    <PageContainer maxWidth="max-w-5xl">
      {/* Back button & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all hostels
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-soft transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
      </div>

      {/* Main Hostel Header Card */}
      {hostel.images?.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">{hostel.images.map((img,i)=><img key={i} src={img.url} alt={img.alt || hostel.name} className="w-full h-44 md:h-56 object-cover rounded-2xl border border-slate-200" loading="lazy" />)}</div>}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                <MapPin className="w-3.5 h-3.5" />
                {hostel.city}
              </span>
              {hostel.foodAvailability && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  <Utensils className="w-3.5 h-3.5 text-slate-400" />
                  {hostel.foodAvailability}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              {hostel.name}
            </h1>

            {hostel.address && (
              <p className="text-sm text-slate-500 leading-relaxed mb-3">
                {hostel.address}
              </p>
            )}

            {hostel.description && (
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100 max-w-2xl">
                {hostel.description}
              </p>
            )}
          </div>

          {/* Monthly Mess Cost Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-card flex flex-col justify-between min-w-[200px] flex-shrink-0">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Monthly Mess
              </p>
              <p className="text-2xl sm:text-3xl font-black mt-1 flex items-baseline">
                ₹{hostel.monthlyMessCost?.toLocaleString('en-IN')}
                <span className="text-xs text-slate-400 font-normal ml-1">/ month</span>
              </p>
            </div>

            {/* Creator Actions */}
            {isCreator && (
              <div className="pt-4 mt-4 border-t border-slate-700/80 flex items-center gap-2">
                <Link
                  to={`/hostels/${hostel._id}/edit`}
                  className="flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Edit Hostel
                </Link>
                <button
                  onClick={() => setShowDeleteHostelModal(true)}
                  className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 transition-colors"
                  title="Delete hostel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Summary Highlights */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 block">Overall Score</span>
            <span className="text-xl font-extrabold text-slate-900 flex items-center gap-1 mt-0.5 justify-center sm:justify-start">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              {hostel.avgRating > 0 ? Number(hostel.avgRating).toFixed(1) : 'New'} / 5
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 block">Total Reviews</span>
            <span className="text-xl font-extrabold text-slate-900 flex items-center gap-1 mt-0.5 justify-center sm:justify-start">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              {hostel.totalReviews || 0} students
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 block">Taste Rating</span>
            <span className="text-xl font-extrabold text-slate-900 flex items-center gap-1 mt-0.5 justify-center sm:justify-start">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {hostel.categoryRatings?.taste ? `${hostel.categoryRatings.taste}★` : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 block">Hygiene Rating</span>
            <span className="text-xl font-extrabold text-slate-900 flex items-center gap-1 mt-0.5 justify-center sm:justify-start">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {hostel.categoryRatings?.hygiene ? `${hostel.categoryRatings.hygiene}★` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Food Ratings Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-brand-600" /> Food Category Breakdown
        </h2>
        <CategoryRatings categoryRatings={hostel.categoryRatings} />
      </div>

      {/* Rating Breakdown & Review CTA Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        {/* Rating Breakdown Visual Bars */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Food Rating Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Based on verified feedback from {hostel.totalReviews} students
            </p>
            <RatingBreakdown
              breakdown={hostel.ratingBreakdown}
              totalReviews={hostel.totalReviews}
            />
          </div>
        </div>

        {/* Action / Review Submission Prompt Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">
              {existingUserReview ? 'You reviewed this mess' : 'Living or stayed here?'}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed mb-6">
              {existingUserReview
                ? 'Your rating helps students make smart choices. You can modify your review anytime.'
                : 'Share your authentic experience with the taste, cleanliness, and portion sizes.'}
            </p>
          </div>

          <button
            onClick={handleOpenReviewModal}
            className="w-full py-3 px-5 rounded-2xl font-bold text-sm bg-amber-400 hover:bg-amber-300 text-slate-900 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {existingUserReview ? (
              <>
                <Edit3 className="w-4 h-4" /> Edit Your Review
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Rate & Review Food
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reviews List Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Student Food Reviews
            </h2>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
              {reviews.length}
            </span>
          </div>

          {/* Sort Reviews Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="reviewSort" className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </label>
            <select
              id="reviewSort"
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="highest_rating">Highest Rated</option>
              <option value="lowest_rating">Lowest Rated</option>
            </select>
          </div>
        </div>

        {/* Reviews Content */}
        {reviewsLoading ? (
          <div className="space-y-4">
            <ReviewSkeletonCard />
            <ReviewSkeletonCard />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <ReviewCard
                key={rev._id}
                review={rev}
                onEdit={() => {
                  setEditingReview(rev);
                  setIsReviewModalOpen(true);
                }}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reviews yet"
            description="Be the first student to share your food experience for this hostel mess."
            actionLabel="Write the First Review"
            onAction={handleOpenReviewModal}
          />
        )}
      </div>

      {/* Review Submission Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        title={editingReview ? `Update your review for ${hostel.name}` : `Rate & Review ${hostel.name}`}
      >
        <ReviewForm
          initialData={editingReview}
          onSubmit={handleReviewSubmit}
          onCancel={() => {
            setIsReviewModalOpen(false);
            setEditingReview(null);
          }}
          isSubmitting={isReviewModalOpen && isSubmittingReview}
        />
      </Modal>

      {/* Delete Hostel Confirmation Modal */}
      <Modal
        isOpen={showDeleteHostelModal}
        onClose={() => setShowDeleteHostelModal(false)}
        title="Delete Hostel"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete <strong>{hostel.name}</strong>? All associated reviews will also be removed. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowDeleteHostelModal(false)}
              disabled={isDeletingHostel}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteHostel}
              disabled={isDeletingHostel}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-2"
            >
              {isDeletingHostel ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                </>
              ) : (
                'Yes, Delete Hostel'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default HostelDetailsPage;
