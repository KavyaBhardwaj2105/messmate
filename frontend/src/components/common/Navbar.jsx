import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,
  PlusCircle,
  Compass,
  User,
  LogOut,
  Menu,
  X,
  BookmarkCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinkClasses = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'text-brand-600 bg-brand-50'
        : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Mess<span className="text-brand-600">Mate</span>
              </span>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium -mt-1 leading-tight">
                Know your mess before you move in
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/explore" className={navLinkClasses}>
              <Compass className="w-4 h-4" />
              Explore Hostels
            </NavLink>

            <NavLink to="/add-hostel" className={navLinkClasses}>
              <PlusCircle className="w-4 h-4" />
              Add Hostel
            </NavLink>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full border border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                    {user?.name}
                  </span>
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lifted border border-slate-100 py-2 z-50"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <BookmarkCheck className="w-4 h-4 text-slate-400" />
                        My Hostels & Reviews
                      </Link>

                      <Link
                        to="/add-hostel"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-slate-400" />
                        Add New Hostel
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl shadow-sm shadow-brand-500/25 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-2">
              <NavLink
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Compass className="w-4 h-4" />
                Explore Hostels
              </NavLink>

              <NavLink
                to="/add-hostel"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <PlusCircle className="w-4 h-4" />
                Add Hostel
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                        isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    <User className="w-4 h-4" />
                    My Profile & Hostels ({user?.name})
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
