import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  IndianRupee,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { hostelService } from '../services/api';
import HostelCard from '../components/common/HostelCard';
import { HostelSkeletonCard } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import PageContainer from '../components/layout/PageContainer';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [maxCost, setMaxCost] = useState(searchParams.get('maxCost') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'highest_rated');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data & Status State
  const [hostels, setHostels] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch unique cities for filter dropdown
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await hostelService.getCities();
        if (res.data?.success) {
          setAvailableCities(res.data.cities || []);
        }
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    };
    fetchCities();
  }, []);

  // Fetch Hostels function
  const fetchHostels = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        q: query || undefined,
        city: city !== 'All' ? city : undefined,
        minRating: minRating || undefined,
        maxCost: maxCost || undefined,
        sort,
        page,
        limit: 9,
      };

      const res = await hostelService.getAll(params);
      if (res.data?.success) {
        setHostels(res.data.hostels || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch hostels:', err);
    } finally {
      setLoading(false);
    }
  }, [query, city, minRating, maxCost, sort, page]);

  // Trigger fetch when parameters change
  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  // Update URL Search Params
  useEffect(() => {
    const p = {};
    if (query) p.q = query;
    if (city && city !== 'All') p.city = city;
    if (minRating) p.minRating = minRating;
    if (maxCost) p.maxCost = maxCost;
    if (sort !== 'highest_rated') p.sort = sort;
    if (page > 1) p.page = page.toString();
    setSearchParams(p, { replace: true });
  }, [query, city, minRating, maxCost, sort, page, setSearchParams]);

  const handleResetFilters = () => {
    setQuery('');
    setCity('All');
    setMinRating('');
    setMaxCost('');
    setSort('highest_rated');
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <PageContainer>
      {/* Page Title & Search Bar */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Explore Hostels & PGs
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
          Filter by city, minimum food rating, or mess budget to find the best place for your college journey.
        </p>

        {/* Search & Mobile Filter Toggle */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by hostel name, PG name, or landmark..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-soft"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filters & Sort</span>
          </button>
        </div>
      </div>

      {/* Filter & Sorting Controls Bar */}
      <div
        className={`bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-soft mb-8 transition-all ${
          showMobileFilters ? 'block' : 'hidden sm:block'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* City Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-500" /> City
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Min Rating Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Minimum Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Any Rating</option>
              <option value="4.5">⭐ 4.5+ (Top Tier)</option>
              <option value="4.0">⭐ 4.0+ (Good Food)</option>
              <option value="3.5">⭐ 3.5+ (Above Average)</option>
              <option value="3.0">⭐ 3.0+ (Manageable)</option>
            </select>
          </div>

          {/* Max Mess Cost */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Max Mess Cost
            </label>
            <select
              value={maxCost}
              onChange={(e) => {
                setMaxCost(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Any Budget</option>
              <option value="3000">Under ₹3,000 / mo</option>
              <option value="4000">Under ₹4,000 / mo</option>
              <option value="5000">Under ₹5,000 / mo</option>
              <option value="6000">Under ₹6,000 / mo</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" /> Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="highest_rated">Highest Rated Food</option>
              <option value="most_reviewed">Most Reviewed</option>
              <option value="lowest_cost">Lowest Mess Cost</option>
              <option value="highest_cost">Highest Mess Cost</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Row & Reset */}
        {(query || city !== 'All' || minRating || maxCost) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap text-slate-600">
              <span className="font-semibold text-slate-400">Active filters:</span>
              {query && (
                <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-medium">
                  "{query}"
                </span>
              )}
              {city !== 'All' && (
                <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-medium">
                  City: {city}
                </span>
              )}
              {minRating && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-medium">
                  {minRating}+ Stars
                </span>
              )}
              {maxCost && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                  ≤ ₹{maxCost}/mo
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Results Header / Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{totalCount}</span> hostels found
        </p>
      </div>

      {/* Hostels Grid (3-col desktop, 2-col tablet, 1-col mobile) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <HostelSkeletonCard key={i} />
          ))}
        </div>
      ) : hostels.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <HostelCard key={hostel._id} hostel={hostel} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-soft"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      page === p
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-soft"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No hostels found"
          description="Looks like there aren't any hostels matching your search or filters."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      )}
    </PageContainer>
  );
};

export default ExplorePage;
