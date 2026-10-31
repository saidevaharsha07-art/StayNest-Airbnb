import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UploadCloud, X, Check, Trash2, ArrowLeft } from 'lucide-react';

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'House',
  'Cottage',
  'Cabin',
  'Studio',
  'Private Room',
  'Hotel Room',
];

const CATEGORIES = [
  'Trending',
  'Iconic Cities',
  'Beachfront',
  'Luxury',
  'Cabins',
  'Mansions',
  'Countryside',
  'Lakefront',
  'Amazing Views',
];

const ALL_AMENITIES = [
  'Wifi',
  'Air conditioning',
  'Kitchen',
  'Free parking',
  'Private pool',
  'TV',
  'Dedicated workspace',
  'Washer',
  'Gym',
  'Balcony',
  'Indoor fireplace',
  'Mountain view',
];

const EditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [category, setCategory] = useState('Trending');
  const [pricePerNight, setPricePerNight] = useState('');
  const [cleaningFee, setCleaningFee] = useState('0');
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [maxGuests, setMaxGuests] = useState(2);
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/properties/${id}`);
        const prop = res.data.property;

        // Check ownership
        if (prop.host?._id !== user?._id && user?.role !== 'admin') {
          showToast('You do not have permission to edit this property', 'error');
          navigate('/');
          return;
        }

        setTitle(prop.title || '');
        setDescription(prop.description || '');
        setLocation(prop.location || '');
        setCity(prop.city || '');
        setState(prop.state || '');
        setCountry(prop.country || 'India');
        setPropertyType(prop.propertyType || 'Apartment');
        setCategory(prop.category || 'Trending');
        setPricePerNight(prop.pricePerNight?.toString() || '');
        setCleaningFee(prop.cleaningFee?.toString() || '0');
        setBedrooms(prop.bedrooms || 1);
        setBathrooms(prop.bathrooms || 1);
        setBeds(prop.beds || 1);
        setMaxGuests(prop.maxGuests || 2);
        setAmenities(prop.amenities || []);
        setImages(prop.images || []);
      } catch (err) {
        showToast('Failed to load property details', 'error');
        navigate('/host/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, user, navigate]);

  const handleToggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim() || !city.trim() || !pricePerNight) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('At least one property image is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/properties/${id}`, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        propertyType,
        category,
        pricePerNight: Number(pricePerNight),
        cleaningFee: Number(cleaningFee) || 0,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        beds: Number(beds),
        maxGuests: Number(maxGuests),
        amenities,
        images,
      });

      showToast('Property updated successfully!', 'success');
      navigate(`/properties/${id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update property', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this property listing?')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/properties/${id}`);
      showToast('Property listing deleted successfully', 'success');
      navigate('/host/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete property', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto w-full px-4 py-12">
          <div className="h-8 w-1/3 rounded skeleton-shimmer mb-6" />
          <div className="h-96 rounded-3xl skeleton-shimmer" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8 border-b border-neutral-200 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-neutral-100"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Edit Property Listing
            </h1>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Deleting...' : 'Delete Listing'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl bg-white"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Max Guests
              </label>
              <input
                type="number"
                min="1"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min="1"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Beds
              </label>
              <input
                type="number"
                min="1"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                min="1"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Nightly Rate (₹ INR) *
              </label>
              <input
                type="number"
                min="100"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Cleaning Fee (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-700 mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_AMENITIES.map((amenity) => {
                const checked = amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold text-left ${
                      checked
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-200'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${checked ? 'text-white' : 'text-transparent'}`} />
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-700 mb-2">
              Photos
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Paste an image URL to add"
                className="flex-1 text-xs p-3 border border-neutral-300 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
              >
                Add URL
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border">
                  <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/host/dashboard')}
              className="px-6 py-3 rounded-2xl border text-sm font-bold hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-brand-500/25"
            >
              {submitting ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default EditPropertyPage;
