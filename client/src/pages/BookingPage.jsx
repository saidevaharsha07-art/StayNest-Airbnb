import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ChevronLeft, Star, ShieldCheck, Calendar, Users, Info, AlertTriangle } from 'lucide-react';

const BookingPage = () => {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = Number(searchParams.get('guests')) || 1;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      navigate(`/properties/${propertyId}`);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/properties/${propertyId}`);
        setProperty(res.data.property);
      } catch (err) {
        setError('Failed to load property details for booking.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, checkIn, checkOut, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-5xl mx-auto w-full px-4 py-12">
          <div className="h-8 w-1/3 rounded skeleton-shimmer mb-6" />
          <div className="h-64 rounded-3xl skeleton-shimmer" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-md mx-auto my-20 p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">Reservation Error</h2>
          <p className="text-sm text-neutral-500 mb-4">{error || 'Property not found.'}</p>
          <Link to="/" className="text-sm font-bold text-brand-600 underline">
            Return to Explore
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate pricing breakdown
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const numberOfNights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  const basePrice = numberOfNights * property.pricePerNight;
  const cleaningFee = property.cleaningFee || 0;
  const serviceFee = Math.round(basePrice * 0.12);
  const totalPrice = basePrice + cleaningFee + serviceFee;

  const handleConfirmReservation = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const res = await api.post('/bookings', {
        propertyId: property._id,
        checkIn,
        checkOut,
        numberOfGuests: guests,
        specialRequests,
      });

      showToast('Reservation confirmed successfully! Check your bookings.', 'success');
      navigate('/bookings');
    } catch (err) {
      console.error('[Booking error]', err);
      const msg = err.response?.data?.message || 'Failed to confirm booking. The dates may have just been reserved.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 mb-8">
          <Link
            to={`/properties/${property._id}`}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Confirm and Reserve
          </h1>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Trip Details & Confirmation */}
          <div className="lg:col-span-7 space-y-8">
            {/* Trip Details Card */}
            <div className="p-6 rounded-3xl border border-neutral-200 space-y-5">
              <h2 className="text-lg font-bold text-neutral-900">Your Trip Details</h2>

              <div className="flex items-start justify-between py-2 border-b border-neutral-100">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase text-neutral-500">Dates</h3>
                    <p className="text-sm font-semibold text-neutral-900">
                      {new Date(checkIn).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      –{' '}
                      {new Date(checkOut).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <span className="text-xs text-neutral-500">{numberOfNights} nights total</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between py-2">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase text-neutral-500">Guests</h3>
                    <p className="text-sm font-semibold text-neutral-900">
                      {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="p-6 rounded-3xl border border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900 mb-2">Message the Host</h2>
              <p className="text-xs text-neutral-500 mb-3">
                Let {property.host?.name} know if you have specific arrival times or special requests.
              </p>
              <textarea
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g., Arriving by 7 PM, early luggage drop-off..."
                className="w-full text-sm p-3 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
              />
            </div>

            {/* Capstone Policy Notice */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Reservation Policy:</span> This reservation is
                processed in project demonstration mode without online payment. Your dates will be
                reserved immediately and saved to your account.
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="text-xs text-neutral-500 leading-relaxed">
              By selecting the button below, I agree to the StayNest Host House Rules, Ground Rules for
              Guests, and Cancellation Policy.
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmReservation}
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98]"
            >
              {submitting ? 'Confirming Reservation...' : 'Confirm Reservation'}
            </button>
          </div>

          {/* Right Column: Sticky Property Summary Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 p-6 rounded-3xl border border-neutral-200 shadow-xl space-y-6">
              {/* Property Header */}
              <div className="flex gap-4 items-center pb-6 border-b border-neutral-100">
                <img
                  src={property.images?.[0]}
                  alt={property.title}
                  className="w-24 h-24 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    {property.propertyType}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900 truncate">{property.title}</h3>
                  <p className="text-xs text-neutral-500 truncate">
                    {property.location}, {property.city}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-neutral-900 text-neutral-900" />
                    <span>{property.ratingAverage > 0 ? property.ratingAverage.toFixed(2) : 'New'}</span>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-3 text-xs text-neutral-600">
                <h4 className="font-bold text-neutral-900 text-sm">Price details</h4>

                <div className="flex justify-between">
                  <span>
                    ₹{property.pricePerNight?.toLocaleString('en-IN')} × {numberOfNights} nights
                  </span>
                  <span className="font-semibold text-neutral-900">
                    ₹{basePrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span className="font-semibold text-neutral-900">
                      ₹{cleaningFee.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>StayNest service fee (12%)</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{serviceFee.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-4 border-t border-neutral-200 flex justify-between text-base font-extrabold text-neutral-900">
                  <span>Total (INR)</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protected by StayNest Guest Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
