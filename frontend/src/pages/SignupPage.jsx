import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/layout/PageContainer';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (name.trim().length > 50) return 'Name cannot exceed 50 characters.';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return 'Please provide a valid email address.';
    if (email.trim().length > 254) return 'Email address is too long.';
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (password.length > 72) return 'Password cannot exceed 72 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await signup(name.trim(), email.trim(), password);
      if (res.success) {
        navigate('/login', { replace: true, state: { verificationRequired: true, verificationLink: res.verificationLink } });
      } else {
        setError(res.error || 'Failed to sign up. Email may already be in use.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="max-w-md">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lifted">
        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Join thousands of students reviewing college & PG messes
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                required
                maxLength={50}
                className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                required
                className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full pl-11 pr-11 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.99] shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <span>Sign Up Free</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign In here
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default SignupPage;
