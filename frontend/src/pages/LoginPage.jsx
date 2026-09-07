import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/layout/PageContainer';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.verificationRequired ? 'Account created. Verify your email before signing in.' : '');
  const verificationLink = location.state?.verificationLink;

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email.trim(), password);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.error || 'Failed to log in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Fill Demo Student Credentials
  const fillDemoAccount = () => {
    setEmail('demo@messmate.com');
    setPassword('password123');
    setError('');
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
            Welcome back to MessMate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sign in to manage your reviews and hostel listings
          </p>
        </div>

        {/* Demo Account Quick-Fill Card */}
        <div className="mb-6 p-3.5 bg-brand-50/80 border border-brand-100 rounded-2xl flex items-center justify-between gap-2 text-xs text-brand-900">
          <div>
            <span className="font-bold block">Testing the app?</span>
            <span className="text-brand-700 text-[11px]">Use demo student account with 1 click</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo
          </button>
        </div>

        {/* Error Alert */}
        {notice && <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">{notice}{verificationLink && <><br/><a className="underline break-all" href={verificationLink}>Open development verification link</a></>}</div>}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="student@college.edu or demo@messmate.com"
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
              Password
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

          <div className="flex justify-end -mt-1"><Link to="/forgot-password" className="text-xs font-bold text-brand-600 hover:text-brand-700">Forgot password?</Link></div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.99] shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700">
            Create student account
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default LoginPage;
