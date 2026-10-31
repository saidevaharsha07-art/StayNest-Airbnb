import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Globe,
  Menu,
  User,
  Compass,
  PlusCircle,
  Calendar,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Navbar = ({ onSearchClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    setDropdownOpen(false);
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 transition-shadow duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Brand Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:bg-brand-600 transition-colors">
              <Compass className="w-6 h-6 transform group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-brand-500 leading-none">
                StayNest
              </span>
              <span className="text-[10px] tracking-wider text-neutral-600 uppercase font-medium">
                Vacation Rentals
              </span>
            </div>
          </Link>

          {/* 2. Interactive Search Bar (Compact Pill) */}
          {isHome ? (
            <button
              onClick={onSearchClick}
              className="hidden md:flex items-center border border-neutral-300 hover:shadow-md transition-all rounded-full py-2.5 px-4 text-sm font-medium shadow-sm divide-x divide-neutral-200 cursor-pointer"
            >
              <span className="px-3 hover:text-brand-500">Anywhere</span>
              <span className="px-3 hover:text-brand-500">Any week</span>
              <span className="px-3 text-neutral-500 font-normal">Add guests</span>
              <div className="pl-3">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </button>
          ) : (
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 border border-neutral-300 hover:shadow-md transition-all rounded-full py-2 px-4 text-sm font-medium shadow-sm"
            >
              <Search className="w-4 h-4 text-brand-500" />
              <span>Explore all stays</span>
            </Link>
          )}

          {/* 3. Host CTA & User Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to={isAuthenticated ? '/host/properties/new' : '/login?redirect=/host/properties/new'}
              className="hidden sm:flex items-center gap-1.5 py-2.5 px-3.5 rounded-full text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-brand-500" />
              <span>Become a host</span>
            </Link>

            {/* Profile Dropdown Toggle */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 border border-neutral-300 hover:shadow-md transition-all rounded-full py-1.5 pl-3 pr-2"
                aria-label="User navigation menu"
              >
                <Menu className="w-4 h-4 text-neutral-600" />
                {isAuthenticated && user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-semibold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="font-semibold text-neutral-900 truncate">{user?.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
                          {user?.role === 'host' ? 'Host Account' : 'Guest Account'}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 font-medium text-neutral-700"
                        >
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/host/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 font-medium text-neutral-700"
                        >
                          <LayoutDashboard className="w-4 h-4 text-neutral-500" />
                          <span>Host Dashboard</span>
                        </Link>
                        <Link
                          to="/host/properties/new"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 font-medium text-neutral-700"
                        >
                          <PlusCircle className="w-4 h-4 text-brand-500" />
                          <span>Create new listing</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 font-medium text-neutral-700"
                        >
                          <User className="w-4 h-4 text-neutral-500" />
                          <span>Account Profile</span>
                        </Link>
                      </div>

                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 font-semibold text-neutral-900 hover:bg-neutral-50"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50"
                      >
                        Sign up
                      </Link>
                      <div className="border-t border-neutral-100 my-1" />
                      <Link
                        to="/login?redirect=/host/properties/new"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-neutral-700 hover:bg-neutral-50"
                      >
                        Host your home
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
