import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { hostelService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import HostelForm from '../components/forms/HostelForm';
import PageContainer from '../components/layout/PageContainer';

const EditHostelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Wait for the initial session check to resolve before fetching or
    // redirecting — avoids kicking an already-logged-in user to /login
    // just because their token hadn't finished verifying yet.
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchHostel = async () => {
      try {
        setLoading(true);
        const res = await hostelService.getById(id);
        if (res.data?.success) {
          const h = res.data.hostel;
          // Check ownership
          const creatorId = h.createdBy?._id || h.createdBy;
          if (user && creatorId && creatorId.toString() !== user._id.toString()) {
            showError('You are not authorized to edit this hostel.');
            navigate(`/hostels/${id}`);
            return;
          }
          setHostel(h);
        }
      } catch (err) {
        showError(err.message || 'Failed to load hostel data.');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };

    fetchHostel();
  }, [id, user, isAuthenticated, authLoading, navigate, showError]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const res = await hostelService.update(id, formData);
      if (res.data?.success) {
        showSuccess('Hostel updated successfully!');
        navigate(`/hostels/${id}`);
      }
    } catch (err) {
      showError(err.message || 'Failed to update hostel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <PageContainer maxWidth="max-w-4xl">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-500">Checking your session...</p>
        </div>
      </PageContainer>
    );
  }

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <PageContainer maxWidth="max-w-4xl">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-500">Loading hostel details...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <Link
          to={`/hostels/${id}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to hostel
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Edit Hostel Details
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Update pricing, meal options, or location details for {hostel?.name}.
        </p>
      </div>

      {hostel && (
        <HostelForm
          initialData={hostel}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </PageContainer>
  );
};

export default EditHostelPage;
