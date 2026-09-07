import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Utensils,
  Award,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import { hostelService } from '../services/api';
import HostelCard from '../components/common/HostelCard';
import { HostelSkeletonCard } from '../components/common/SkeletonLoader';
import PageContainer from '../components/layout/PageContainer';

const QUICK_CITIES = ['All', 'Delhi', 'Kota', 'Meerut', 'Bengaluru', 'Pune', 'Hyderabad', 'Jaipur'];

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [popularHostels, setPopularHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularHostels = async () => {
      try {
        setLoading(true);
        const res = await hostelService.getAll({
          sort: 'highest_rated',
          limit: 6,
          city: selectedCity !== 'All' ? selectedCity : undefined,
        });
        if (res.data?.success) {
          setPopularHostels(res.data.hostels || []);
        }
      } catch (err) {
        console.error('Failed to load popular hostels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularHostels();
  }, [selectedCity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-brand-50/70 via-[#FBFBFA] to-[#FBFBFA] dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-200/30 to-amber-200/20 dark:from-brand-900/20 dark:to-amber-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-brand-200 dark:border-slate-700 shadow-sm text-xs font-bold text-brand-700 dark:text-brand-300 mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Over 10,000+ honest food reviews by students</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6"
          >
            Before you choose your hostel,{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
              check the food.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10"
          >
            Real food ratings and honest reviews from students living in hostels and PGs across India.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-3xl border border-slate-200/90 dark:border-slate-700 shadow-lifted flex flex-col sm:flex-row items-center gap-2.5 mb-6"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hostel name, PG, or city (e.g. Sunrise PG, Meerut, Kota)..."
                className="w-full pl-12 pr-4 py-3 text-sm text-slate-900 dark:text-white bg-transparent rounded-2xl focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-md shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          <div className="flex items-center justify-center flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-8">
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Popular Cities:
            </span>
            {QUICK_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-full transition-all ${
                  selectedCity === city
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-300'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-7 py-3 rounded-2xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              Explore All Hostels
            </Link>
            <Link
              to="/add-hostel"
              className="w-full sm:w-auto px-7 py-3 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 shadow-soft transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-brand-500" />
              Add Your Hostel
            </Link>
          </div>
        </div>
      </section>

      {/* Key Benefits Grid */}
      <section className="py-12 bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Taste & Quality Scores
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Real breakdown of tawa rotis, Sunday specials, curry flavors, and daily breakfast items.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Kitchen Hygiene Checked
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Student insights on kitchen cleanliness, RO drinking water, and utensil sanitization.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-950/50 text-brand-800 dark:text-brand-300">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Transparent Mess Costs
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Clear monthly mess pricing and meal options so there are no surprise fees later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Hostels Section */}
      <section className="py-16 bg-[#FBFBFA] dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" /> Top Rated Places
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {selectedCity === 'All' ? 'Popular Hostels & PGs' : `Top Hostels in ${selectedCity}`}
              </h2>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 group"
            >
              <span>View all listings</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <HostelSkeletonCard key={i} />
              ))}
            </div>
          ) : popularHostels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularHostels.map((hostel) => (
                <HostelCard key={hostel._id} hostel={hostel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <p className="text-slate-500 dark:text-slate-400 mb-3">
                No hostels found for this city yet.
              </p>
              <Link
                to="/add-hostel"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                Add the first hostel in {selectedCity}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Community Banner */}
      <section className="py-16 bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Living in a PG or Hostel right now?
          </h2>
          <p className="text-indigo-200 text-base sm:text-lg max-w-xl mx-auto mb-8">
            Help freshers and incoming college students avoid terrible food by sharing your honest 1-minute mess review!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/add-hostel"
              className="px-8 py-3.5 rounded-2xl font-extrabold text-sm text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition-all active:scale-95"
            >
              List Your Hostel / PG
            </Link>
            <Link
              to="/explore"
              className="px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all"
            >
              Browse All Reviews
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
