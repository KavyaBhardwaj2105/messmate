import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft, Compass } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';

const NotFoundPage = () => {
  return (
    <PageContainer maxWidth="max-w-lg">
      <div className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-200 shadow-soft my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Page not found</h2>
        <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">
          The page you're looking for was moved, removed, or never existed in the mess!
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/25 transition-all"
          >
            <Compass className="w-4 h-4" />
            Explore Hostels
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default NotFoundPage;
