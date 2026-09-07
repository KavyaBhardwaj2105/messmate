import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  MessageSquare,
  MapPin,
  Star,
  Edit3,
  Trash2,
  PlusCircle,
  Calendar,
  IndianRupee,
  Loader2,
} from 'lucide-react';
import { hostelService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ReviewCard from '../components/common/ReviewCard';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import ReviewForm from '../components/forms/ReviewForm';
import PageContainer from '../components/layout/PageContainer';

const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'hostels'
  const [myHostels, setMyHostels] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Edit state
  const [editingReview, setEditingReview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Delete Hostel state
  const [hostelToDelete, setHostelToDelete] = useState(null);
  const [isDeletingHostel, setIsDeletingHostel] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [hostelsRes, reviewsRes] = await Promise.all([
        hostelService.getMyHostels(),
        reviewService.getMyReviews(),
      ]);

      if (hostelsRes.data?.success) setMyHostels(hostelsRes.data.hostels || []);
      if (reviewsRes.data?.success) setMyReviews(reviewsRes.data.reviews || []);
    } catch (err) {
      showError('Failed to load user profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for the initial session check (GET /auth/me) to finish before
    // deciding whether to redirect — otherwise a logged-in user gets
    // bounced to /login for a flash while their token is still verifying.
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [isAuthenticated, authLoading, navigate]);

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await reviewService.delete(reviewId);
      if (res.data?.success) {
        showSuccess('Review removed successfully.');
        setMyReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      showError(err.message);
    }
  };

  const handleUpdateReview = async (formData) => {
    try {
      setIsSubmittingReview(true);
      const res = await reviewService.update(editingReview._id, formData);
      if (res.data?.success) {
        showSuccess('Review updated successfully!');
        setEditingReview(null);
        fetchUserData();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteHostel = async () => {
    if (!hostelToDelete) return;
    try {
      setIsDeletingHostel(true);
      const res = await hostelService.delete(hostelToDelete._id);
      if (res.data?.success) {
        showSuccess('Hostel deleted successfully.');
        setMyHostels((prev) => prev.filter((h) => h._id !== hostelToDelete._id));
        setHostelToDelete(null);
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsDeletingHostel(false);
    }
  };

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <PageContainer maxWidth="max-w-5xl">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
        </div>
      </PageContainer>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <PageContainer maxWidth="max-w-5xl">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-800 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-brand-500/20 uppercase">
          {user?.name?.charAt(0) || 'U'}
        </div>

        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {user?.name}
          </h1>
          <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since{' '}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })
                : '2026'}
            </span>
          </div>
        </div>

        <Link
          to="/add-hostel"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Add Hostel
        </Link>
      </div>

      {/* Tabs Selection */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Reviews ({myReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hostels')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'hostels'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Listed Hostels ({myHostels.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : activeTab === 'reviews' ? (
        /* My Reviews Tab */
        myReviews.length > 0 ? (
          <div className="space-y-4">
            {myReviews.map((rev) => (
              <div key={rev._id} className="relative">
                {/* Linked Hostel Banner */}
                {rev.hostel && (
                  <div className="px-4 py-2 bg-brand-50/70 border-x border-t border-brand-100 rounded-t-2xl flex items-center justify-between text-xs text-brand-900 font-semibold">
                    <span className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-brand-600" /> Review for:{' '}
                      <strong className="text-brand-800">{rev.hostel.name}</strong> ({rev.hostel.city})
                    </span>
                    <Link
                      to={`/hostels/${rev.hostel._id}`}
                      className="text-brand-600 hover:underline font-bold text-[11px]"
                    >
                      View Hostel →
                    </Link>
                  </div>
                )}
                <ReviewCard
                  review={rev}
                  onEdit={() => setEditingReview(rev)}
                  onDelete={handleDeleteReview}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reviews yet"
            description="You haven't written any mess reviews yet. Help other students by sharing your food feedback!"
            actionLabel="Explore Hostels to Review"
            onAction={() => navigate('/explore')}
          />
        )
      ) : (
        /* My Listed Hostels Tab */
        myHostels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myHostels.map((hostel) => (
              <div
                key={hostel._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      <MapPin className="w-3 h-3 text-brand-500" /> {hostel.city}
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      ⭐ {hostel.avgRating > 0 ? Number(hostel.avgRating).toFixed(1) : 'New'} ({hostel.totalReviews || 0})
                    </span>
                  </div>

                  <Link to={`/hostels/${hostel._id}`}>
                    <h3 className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors">
                      {hostel.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">
                    Mess: ₹{hostel.monthlyMessCost?.toLocaleString('en-IN')}/month
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <Link
                    to={`/hostels/${hostel._id}`}
                    className="font-bold text-slate-700 hover:text-brand-600"
                  >
                    View Page
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/hostels/${hostel._id}/edit`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setHostelToDelete(hostel)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hostels listed"
            description="You haven't added any hostels yet. Add your PG or college hostel mess to get student reviews."
            actionLabel="Add Your Hostel"
            onAction={() => navigate('/add-hostel')}
          />
        )
      )}

      {/* Edit Review Modal */}
      <Modal
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
        title="Update Your Review"
      >
        {editingReview && (
          <ReviewForm
            initialData={editingReview}
            onSubmit={handleUpdateReview}
            onCancel={() => setEditingReview(null)}
            isSubmitting={isSubmittingReview}
          />
        )}
      </Modal>

      {/* Delete Hostel Confirmation Modal */}
      <Modal
        isOpen={!!hostelToDelete}
        onClose={() => setHostelToDelete(null)}
        title="Delete Hostel"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{hostelToDelete?.name}</strong>? All reviews associated with this hostel will also be permanently removed.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setHostelToDelete(null)}
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
                'Yes, Delete'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ProfilePage;
