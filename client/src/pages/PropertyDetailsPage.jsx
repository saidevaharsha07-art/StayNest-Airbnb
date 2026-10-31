import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Users,
  Bed,
  Bath,
  Wifi,
  Tv,
  Car,
  Utensils,
  Wind,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';

const AMENITY_ICONS = {
  Wifi: Wifi,
  'Air conditioning': Wind,
  Kitchen: Utensils,
  'Free parking': Car,
  TV: Tv,
  'Private pool': Sparkles,
  Pool: Sparkles,
};

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reservation form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [propRes, revRes, bookedRes] = await Promise.all([
          api.get(`/properties/${id}`),
          api.get(`/properties/${id}/reviews`).catch(() => ({ data: { reviews: [] } })),
          api.get(`/bookings/property/${id}/booked-dates`).catch(() => ({ data: { bookedRanges: [] } })),
        ]);

        setProperty(propRes.data.property);
        setReviews(revRes.data.reviews || []);
        setBookedDates(bookedRes.data.bookedRanges || []);
      } catch (err) {
        console.error('[PropertyDetails] Load Error:', err);
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Price calculations
  let numberOfNights = 0;
  let basePrice = 0;
  let cleaningFee = 0;
  let serviceFee = 0;
  let totalPrice = 0;

  if (checkIn && checkOut && property) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    if (d2 > d1) {
      numberOfNights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      basePrice = numberOfNights * property.pricePerNight;
      cleaningFee = property.cleaningFee || 0;
      serviceFee = Math.round(basePrice * 0.12);
      totalPrice = basePrice + cleaningFee + serviceFee;
    }
  }

  // Handle reserve action
  const handleReserve = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please log in to make a reservation', 'info');
      navigate(`/login?redirect=/book/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${numberOfGuests}`);
      return;
    }

    if (property.host?._id === user?._id) {
      showToast('You cannot book your own property listing', 'error');
      return;
    }

    if (!checkIn || !checkOut) {
      showToast('Please select check-in and check-out dates', 'error');
      return;
    }

    if (numberOfNights < 1) {
      showToast('Check-out must be at least one day after check-in', 'error');
      return;
    }

    navigate(
      `/book/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${numberOfGuests}`
    );
  };

  // Handle review submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Please write a review comment', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/properties/${id}/reviews`, {
        rating: Number(newRating),
        comment: newComment.trim(),
      });

      showToast('Review submitted successfully!', 'success');
      setReviews((prev) => [res.data.review, ...prev]);
      setNewComment('');
      // update property rating count
      setProperty((prev) => ({
        ...prev,
        reviewCount: (prev.reviewCount || 0) + 1,
      }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-8 w-1/2 rounded skeleton-shimmer mb-4" />
          <div className="h-4 w-1/4 rounded skeleton-shimmer mb-6" />
          <div className="h-[450px] w-full rounded-3xl skeleton-shimmer mb-8" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Property Not Found</h2>
          <p className="text-sm text-neutral-500 mb-6">{error || 'This property does not exist or has been removed.'}</p>
          <Link
            to="/"
            className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-sm shadow-md"
          >
            Explore Other Stays
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [];
  const isOwner = user && property.host?._id === user._id;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
            {property.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-bold text-neutral-900">
                <Star className="w-4 h-4 fill-neutral-900 text-neutral-900" />
                {property.ratingAverage > 0 ? property.ratingAverage.toFixed(2) : 'New'}
              </span>
              <span>•</span>
              <span className="underline font-medium">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                {property.location}, {property.city}, {property.country}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {isOwner && (
                <Link
                  to={`/host/properties/${property._id}/edit`}
                  className="px-4 py-1.5 rounded-lg border border-neutral-300 font-semibold text-xs hover:border-neutral-900"
                >
                  Edit your listing
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Image Gallery (1 Large + 4 Small Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-3xl overflow-hidden mb-10 max-h-[500px]">
          {/* Main Large Photo */}
          <div className="md:col-span-2 relative group overflow-hidden bg-neutral-100 h-72 md:h-[480px]">
            <img
              src={images[0]}
              alt={property.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Additional Photos Grid */}
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-[480px]">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="relative group overflow-hidden bg-neutral-100 h-[236px]">
                <img
                  src={images[idx] || images[0]}
                  alt={`${property.title} photo ${idx + 1}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details & Interactive Booking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Property & Host Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">
                  Entire {property.propertyType} hosted by {property.host?.name || 'Superhost'}
                </h2>
                <p className="text-sm text-neutral-500">
                  {property.maxGuests} guests • {property.bedrooms} bedrooms • {property.beds} beds •{' '}
                  {property.bathrooms} baths
                </p>
              </div>
              <img
                src={property.host?.profileImage}
                alt={property.host?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-neutral-200 shadow-sm"
              />
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-3">About this space</h3>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="pb-6 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities?.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity] || Sparkles;
                  return (
                    <div key={amenity} className="flex items-center gap-3 text-sm text-neutral-700">
                      <Icon className="w-5 h-5 text-neutral-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 fill-neutral-900 text-neutral-900" />
                <h3 className="text-xl font-bold text-neutral-900">
                  {property.ratingAverage > 0 ? property.ratingAverage.toFixed(2) : 'New'} •{' '}
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </h3>
              </div>

              {/* Review Submission Form */}
              {isAuthenticated && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="mb-8 p-5 rounded-2xl bg-neutral-50 border border-neutral-200"
                >
                  <h4 className="text-sm font-bold text-neutral-900 mb-3">
                    Leave a review for this property
                  </h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-neutral-700">Rating:</span>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(e.target.value)}
                      className="border border-neutral-300 rounded-lg p-1.5 text-xs font-semibold bg-white"
                    >
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Disappointing</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>

                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your stay experience, the neighborhood, amenities, or communication with the host..."
                    className="w-full text-sm p-3 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 mb-3 bg-white"
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-sm text-neutral-500 italic">
                  No guest reviews yet. Be the first to book and share your review!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-2xl border border-neutral-100 bg-white shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={rev.author?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={rev.author?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-neutral-900">{rev.author?.name}</p>
                          <div className="flex items-center gap-1 text-xs text-neutral-500">
                            <div className="flex">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span>•</span>
                            <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-5">
              {/* Price per night */}
              <div className="flex items-baseline justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-neutral-900">
                    ₹{property.pricePerNight?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-normal text-neutral-500">night</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700">
                  <Star className="w-3.5 h-3.5 fill-neutral-900 text-neutral-900" />
                  <span>{property.ratingAverage > 0 ? property.ratingAverage.toFixed(2) : 'New'}</span>
                </div>
              </div>

              {/* Reservation Dates & Guests Form */}
              <form onSubmit={handleReserve} className="space-y-4">
                <div className="border border-neutral-300 rounded-2xl overflow-hidden divide-y divide-neutral-200">
                  <div className="grid grid-cols-2 divide-x divide-neutral-200">
                    <div className="p-3">
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-700">
                        Check-in
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full text-xs font-semibold focus:outline-none mt-1"
                        required
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-700">
                        Checkout
                      </label>
                      <input
                        type="date"
                        min={checkIn || todayStr}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-xs font-semibold focus:outline-none mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-3">
                    <label className="block text-[10px] font-extrabold uppercase text-neutral-700">
                      Guests
                    </label>
                    <select
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                      className="w-full text-xs font-semibold focus:outline-none mt-1 bg-white"
                    >
                      {Array.from({ length: property.maxGuests }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reserve Action Button */}
                <button
                  type="submit"
                  disabled={isOwner}
                  className="w-full py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all active:scale-[0.98]"
                >
                  {isOwner ? 'You own this listing' : 'Reserve'}
                </button>
              </form>

              <p className="text-center text-xs text-neutral-500">
                You won't be charged yet • Instant reservation
              </p>

              {/* Real-time calculated price breakdown */}
              {numberOfNights > 0 && (
                <div className="pt-4 border-t border-neutral-100 space-y-2.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span className="underline">
                      ₹{property.pricePerNight?.toLocaleString('en-IN')} × {numberOfNights} nights
                    </span>
                    <span className="font-semibold text-neutral-900">
                      ₹{basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {cleaningFee > 0 && (
                    <div className="flex justify-between">
                      <span className="underline">Cleaning fee</span>
                      <span className="font-semibold text-neutral-900">
                        ₹{cleaningFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="underline">StayNest service fee (12%)</span>
                    <span className="font-semibold text-neutral-900">
                      ₹{serviceFee.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm font-extrabold text-neutral-900">
                    <span>Total before taxes</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetailsPage;
