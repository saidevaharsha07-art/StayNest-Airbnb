import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Home,
  CalendarCheck,
  TrendingUp,
  PlusCircle,
  Edit3,
  Trash2,
  ExternalLink,
  Users,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const HostDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'reservations'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propsRes, bookingsRes] = await Promise.all([
        api.get('/properties/host/my-listings'),
        api.get('/bookings/host'),
      ]);

      setProperties(propsRes.data.properties || []);
      setBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      showToast('Failed to load host dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats
  const totalListings = properties.length;
  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Delete property
  const handleDeleteProperty = async (propId) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) {
      return;
    }

    try {
      await api.delete(`/properties/${propId}`);
      showToast('Property deleted successfully', 'success');
      setProperties((prev) => prev.filter((p) => p._id !== propId));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete listing', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Host Dashboard
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Welcome back, {user?.name}. Manage your property portfolio and guest reservations.
            </p>
          </div>

          <Link
            to="/host/properties/new"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 hover:bg-brand-600 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create new listing</span>
          </Link>
        </div>

        {/* 3 Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-3xl border border-neutral-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-neutral-400">Total Listings</p>
              <h3 className="text-2xl font-black text-neutral-900">{totalListings}</h3>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-neutral-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-neutral-400">Active Bookings</p>
              <h3 className="text-2xl font-black text-neutral-900">{activeBookings.length}</h3>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-neutral-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-neutral-400">Estimated Revenue</p>
              <h3 className="text-2xl font-black text-neutral-900">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'listings'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            My Listings ({properties.length})
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reservations'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Reservations Received ({bookings.length})
          </button>
        </div>

        {/* Tab 1: My Listings */}
        {activeTab === 'listings' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 rounded-3xl skeleton-shimmer" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-neutral-200">
                <Home className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800 mb-1">
                  You haven't listed any properties yet
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
                  Turn your extra room or vacation home into income by publishing your first StayNest listing.
                </p>
                <Link
                  to="/host/properties/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-md hover:bg-brand-600"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create your first listing</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((prop) => (
                  <div
                    key={prop._id}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 rounded-3xl border border-neutral-200 hover:shadow-md transition-shadow gap-4 bg-white"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={prop.images?.[0]}
                        alt={prop.title}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-neutral-400">
                          {prop.propertyType} • {prop.city}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900 truncate max-w-md">
                          {prop.title}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          ₹{prop.pricePerNight?.toLocaleString('en-IN')} / night •{' '}
                          {prop.maxGuests} max guests
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {prop.activeReservationsCount || 0} active reservations
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Link
                        to={`/properties/${prop._id}`}
                        className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-900 transition-colors"
                        title="View Public Space"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/host/properties/${prop._id}/edit`}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-800 text-xs font-bold hover:border-neutral-900 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteProperty(prop._id)}
                        className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reservations Received */}
        {activeTab === 'reservations' && (
          <div>
            {bookings.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-neutral-200">
                <CalendarCheck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800 mb-1">
                  No reservations received yet
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  When guests book your accommodations, their booking dates and payout details will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="p-5 rounded-3xl border border-neutral-200 bg-white hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-neutral-900">
                          {b.property?.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600">
                        Guest:{' '}
                        <span className="font-semibold text-neutral-900">
                          {b.guest?.name} ({b.guest?.email})
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {new Date(b.checkIn).toLocaleDateString()} –{' '}
                          {new Date(b.checkOut).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          {b.numberOfNights} nights
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-neutral-400" />
                          {b.numberOfGuests} guests
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                        Payout Amount
                      </span>
                      <span className="text-lg font-black text-neutral-900">
                        ₹{b.totalPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HostDashboardPage;
