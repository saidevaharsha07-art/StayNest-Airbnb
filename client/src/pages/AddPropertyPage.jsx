import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useToast } from '../context/ToastContext';
import {
  UploadCloud,
  X,
  Image,
  Check,
  PlusCircle,
  Building2,
  Sparkles,
} from 'lucide-react';

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

const SAMPLE_PHOTO_SETS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
];

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [category, setCategory] = useState('Trending');
  const [pricePerNight, setPricePerNight] = useState('');
  const [cleaningFee, setCleaningFee] = useState('500');
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [maxGuests, setMaxGuests] = useState(2);
  const [amenities, setAmenities] = useState(['Wifi', 'Air conditioning', 'Kitchen']);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Toggle amenities
  const handleToggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  // Upload files via backend /api/upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      setUploading(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newUrls = res.data.urls || [];
      setImages((prev) => [...prev, ...newUrls]);
      showToast(`${newUrls.length} image(s) uploaded successfully!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload images', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Add custom or sample image URL
  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  // Use curated sample photos
  const handleUseSamplePhotos = () => {
    setImages((prev) => [...new Set([...prev, ...SAMPLE_PHOTO_SETS])]);
    showToast('Curated high-resolution sample photos added!', 'success');
  };

  // Remove photo
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Submit Listing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim() || !city.trim() || !pricePerNight) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('Please upload or add at least one property photo', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/properties', {
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

      showToast('Property listed successfully!', 'success');
      navigate(`/properties/${res.data.property._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create listing', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 border-b border-neutral-200 pb-6">
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            List your place on StayNest
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Share the details, photos, and nightly rate of your home to start hosting guests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900">1. Property Overview</h2>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Glass Villa with Private Pool"
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your space, ambiance, surroundings, and neighborhood..."
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
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl bg-white focus:outline-none focus:border-neutral-900 font-medium"
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
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl bg-white focus:outline-none focus:border-neutral-900 font-medium"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="space-y-4 pt-6 border-t border-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900">2. Location</h2>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                Street Address / Neighborhood *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Road No. 36, Jubilee Hills"
                className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  State / Region
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Telangana"
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Capacity & Pricing */}
          <div className="space-y-4 pt-6 border-t border-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900">3. Capacity & Pricing</h2>

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
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
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
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
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
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
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
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Nightly Rate (₹ INR) *
                </label>
                <input
                  type="number"
                  min="100"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="e.g. 7500"
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900 font-bold"
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
                  placeholder="e.g. 500"
                  className="w-full text-sm p-3.5 border border-neutral-300 rounded-2xl focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Amenities */}
          <div className="space-y-4 pt-6 border-t border-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900">4. Amenities Offered</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_AMENITIES.map((amenity) => {
                const checked = amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      checked
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${checked ? 'text-white' : 'text-transparent'}`} />
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Property Photos */}
          <div className="space-y-4 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">5. Property Photos *</h2>
                <p className="text-xs text-neutral-500">
                  Upload photos via file selector or add photo web URLs.
                </p>
              </div>

              <button
                type="button"
                onClick={handleUseSamplePhotos}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-200 text-brand-600 bg-brand-50 hover:bg-brand-100 text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add Sample Photos</span>
              </button>
            </div>

            {/* File Drag / Select Box */}
            <label className="border-2 border-dashed border-neutral-300 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/20 transition-all text-center">
              <UploadCloud className="w-10 h-10 text-neutral-400 mb-2" />
              <span className="text-sm font-bold text-neutral-800">
                {uploading ? 'Uploading images to server...' : 'Click to upload property photos'}
              </span>
              <span className="text-xs text-neutral-400 mt-1">
                PNG, JPG, JPEG, WEBP up to 5MB each
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Direct URL Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Or paste an image URL (e.g. Unsplash URL)"
                className="flex-1 text-xs p-3 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
              >
                Add URL
              </button>
            </div>

            {/* Thumbnails Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group border border-neutral-200"
                  >
                    <img
                      src={imgUrl}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-neutral-900">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-neutral-200 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-2xl border border-neutral-300 text-neutral-700 text-sm font-bold hover:bg-neutral-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-8 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-brand-500/25 active:scale-95 transition-all"
            >
              {submitting ? 'Publishing Listing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default AddPropertyPage;
