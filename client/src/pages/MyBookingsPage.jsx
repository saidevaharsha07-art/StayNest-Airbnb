import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

const MyBookingsPage = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming'); // 'all', 'upcoming', 'past', 'cancelled'
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch (err) {
      showToast('Failed to load your reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const today = new Date();

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((b) => {
    const checkOut = new Date(b.checkOut);
    if (tab === 'all') return true;
    if (tab === 'cancelled') return b.status === 'cancelled';
    if (tab === 'upcoming') return b.status === 'confirmed' && checkOut >= today;
    if (tab === 'past') return b.status === 'confirmed' && checkOut < today;
    return true;
  });

  const handleOpenCancelModal = (bookingId) => {
    setCancellingId(bookingId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingId) return;

    try {
      setSubmittingCancel(true);
      await api.patch(`/bookings/${cancellingId}/cancel`, {
        reason: cancelReason.trim() || 'Guest cancelled reservation',
      });
      showToast('Reservation cancelled successfully. Dates have been released.', 'success');
      setCancelModalOpen(false);
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel reservation', 'error');
    } finally {
      setSubmittingCancel(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              My Bookings & Trips
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              View details of your past and upcoming stays, and manage active reservations.
            </p>
          </div>

          <Link
            to="/"
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
          >
            Explore more places
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'upcoming', label: 'Upcoming Stays' },
            { id: 'past', label: 'Past Stays' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'all', label: 'All Bookings' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                tab === t.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl skeleton-shimmer" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-neutral-200">
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-800 mb-1">
              No {tab} reservations found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
              When you book accommodations, your travel confirmations and stay details will appear here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800"
            >
              Start exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const prop = booking.property;
              const isCancelled = booking.status === 'cancelled';
              const isPast = new Date(booking.checkOut) < today;

              return (
                <div
                  key={booking._id}
                  className="flex flex-col md:flex-row items-stretch rounded-3xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Property Cover Image */}
                  <div className="md:w-72 h-52 md:h-auto shrink-0 relative bg-neutral-100">
                    <img
                      src={prop?.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'}
                      alt={prop?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isPast
                            ? 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isCancelled ? 'Cancelled' : isPast ? 'Completed' : 'Confirmed'}
                      </span>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-extrabold uppercase text-neutral-400">
                          {prop?.propertyType} • {prop?.city}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          ID: {booking._id.slice(-8).toUpperCase()}
                        </span>
                      </div>

                      <Link
                        to={`/properties/${prop?._id}`}
                        className="text-lg font-bold text-neutral-900 hover:text-brand-600 transition-colors block mb-3 line-clamp-1"
                      >
                        {prop?.title}
                      </Link>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600 mb-4 pb-4 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
                          <span>
                            {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            –{' '}
                            {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                          <span>{booking.numberOfNights} nights stay</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                          <span>
                            {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                          </span>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <p className="text-xs text-neutral-500 italic mb-3">
                          " {booking.specialRequests} "
                        </p>
                      )}
                    </div>

                    {/* Bottom row: Total price and actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                          Total Reserved
                        </span>
                        <span className="text-xl font-black text-neutral-900">
                          ₹{booking.totalPrice?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/properties/${prop?._id}`}
                          className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:border-neutral-900"
                        >
                          View Space
                        </Link>

                        {!isCancelled && !isPast && (
                          <button
                            onClick={() => handleOpenCancelModal(booking._id)}
                            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition-colors"
                          >
                            Cancel Reservation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Cancel Reservation</h3>
            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
              Are you sure you want to cancel this reservation? The reserved dates will be
              immediately released and made available for other guests to book.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Change in travel plans, scheduling conflict..."
                className="w-full text-xs p-3 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-bold border rounded-xl hover:bg-neutral-100"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={submittingCancel}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md disabled:opacity-50"
              >
                {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyBookingsPage;
