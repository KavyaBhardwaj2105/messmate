import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Mess<span className="text-brand-400">Mate</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Helping students make better hostel decisions with transparent, authentic mess reviews and ratings.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Student Verified
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" /> Real Food Reviews
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Hostels
                </Link>
              </li>
              <li>
                <Link to="/add-hostel" className="hover:text-white transition-colors">
                  Add Your Hostel
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Hubs */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Top Student Hubs
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" /> Delhi / NCR & Meerut
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" /> Kota (Rajasthan)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" /> Bengaluru & Pune
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" /> Hyderabad & Jaipur
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MessMate. "Know your mess before you move in."</p>
          <p className="inline-flex items-center gap-1">
            Built for students with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
