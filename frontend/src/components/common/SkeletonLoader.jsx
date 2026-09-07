import React from 'react';

export const HostelSkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-soft animate-pulse flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
          <div className="h-6 w-14 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-6 w-3/4 bg-slate-200 rounded-md mb-2"></div>
        <div className="h-4 w-1/2 bg-slate-100 rounded-md"></div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="h-3 w-16 bg-slate-100 rounded mb-1"></div>
          <div className="h-5 w-24 bg-slate-200 rounded"></div>
        </div>
        <div className="h-8 w-8 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
};

export const ReviewSkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-soft animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200"></div>
          <div>
            <div className="h-4 w-28 bg-slate-200 rounded mb-1"></div>
            <div className="h-3 w-16 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-12 bg-slate-200 rounded-xl"></div>
      </div>

      <div className="space-y-2 py-2">
        <div className="h-3.5 w-full bg-slate-100 rounded"></div>
        <div className="h-3.5 w-5/6 bg-slate-100 rounded"></div>
        <div className="h-3.5 w-4/6 bg-slate-100 rounded"></div>
      </div>

      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 bg-slate-100 rounded-lg"></div>
        <div className="h-6 w-16 bg-slate-100 rounded-lg"></div>
        <div className="h-6 w-16 bg-slate-100 rounded-lg"></div>
      </div>
    </div>
  );
};

export const DetailsSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-soft">
        <div className="h-8 w-1/3 bg-slate-200 rounded-lg mb-3"></div>
        <div className="h-4 w-1/4 bg-slate-100 rounded mb-6"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
          <div className="h-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>

      {/* Breakdown skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-white rounded-3xl border border-slate-200/70 p-6"></div>
        <div className="md:col-span-2 h-64 bg-white rounded-3xl border border-slate-200/70 p-6"></div>
      </div>
    </div>
  );
};
