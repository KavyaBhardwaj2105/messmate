import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Lock, Loader2 } from 'lucide-react';
import { hostelService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import HostelForm from '../components/forms/HostelForm';
import PageContainer from '../components/layout/PageContainer';

const AddHostelPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const res = await hostelService.create(formData);
      if (res.data?.success) {
        showSuccess('Hostel added successfully! Now add the first food review.');
        navigate(`/hostels/${res.data.hostel._id}`);
      }
    } catch (err) {
      showError(err.message || 'Failed to create hostel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wait for the initial session check before deciding whether to show the
  // sign-in prompt — otherwise an already-logged-in user briefly sees it
  // flash on screen while their token is still being verified.
  if (authLoading) {
    return (
      <PageContainer maxWidth="max-w-md">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-500">Checking your session...</p>
        </div>
      </PageContainer>
    );
  }

  // If not authenticated, show friendly sign-in required prompt
  if (!isAuthenticated) {
    return (
      <PageContainer maxWidth="max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card text-center space-y-4 my-12">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In Required
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Please log in or create a free student account to list a new hostel or PG mess.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md"
            >
              Sign In to Continue
            </Link>
            <Link
              to="/signup"
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
            >
              Create Account
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all hostels
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Add a New Hostel or PG
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-xl">
          List your hostel or private mess so students can find and review its food quality.
        </p>
      </div>

      <HostelForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </PageContainer>
  );
};

export default AddHostelPage;
