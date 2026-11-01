import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, X } from 'lucide-react';

const SearchModal = ({ isOpen, onClose, onSearch, currentFilters = {} }) => {
  const [location, setLocation] = useState(currentFilters.location || '');
  const [checkIn, setCheckIn] = useState(currentFilters.checkIn || '');
  const [checkOut, setCheckOut] = useState(currentFilters.checkOut || '');
  const [guests, setGuests] = useState(currentFilters.guests || 1);

  useEffect(() => {
    if (isOpen) {
      setLocation(currentFilters.location || '');
      setCheckIn(currentFilters.checkIn || '');
      setCheckOut(currentFilters.checkOut || '');
      setGuests(currentFilters.guests || 1);
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      location: location.trim(),
      checkIn,
      checkOut,
      guests: Number(guests),
    });
    onClose();
  };

  const handleClear = () => {
    setLocation('');
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
    onSearch({ location: '', checkIn: '', checkOut: '', guests: 1 });
    onClose();
  };

  // Min dates
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-neutral-100">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">Search Stays</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Location */}
          <div className="border border-neutral-200 rounded-2xl p-3.5 hover:border-neutral-900 focus-within:border-neutral-900 transition-colors">
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
              Where
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search destinations (e.g., Hyderabad, Goa, Manali)"
                className="w-full text-sm font-medium focus:outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-neutral-200 rounded-2xl p-3.5 hover:border-neutral-900 focus-within:border-neutral-900 transition-colors">
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Check in
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="date"
                  min={todayStr}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-neutral-200 rounded-2xl p-3.5 hover:border-neutral-900 focus-within:border-neutral-900 transition-colors">
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Check out
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-sm font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="border border-neutral-200 rounded-2xl p-3.5 hover:border-neutral-900 focus-within:border-neutral-900 transition-colors">
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
              Who
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-sm font-medium text-neutral-700">
                  {guests} {guests === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-sm font-bold hover:border-neutral-800 active:scale-95 disabled:opacity-30"
                  disabled={guests <= 1}
                >
                  -
                </button>
                <span className="font-bold text-sm w-4 text-center">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(16, g + 1))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-sm font-bold hover:border-neutral-800 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 mt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-bold text-neutral-600 hover:text-neutral-900 underline"
            >
              Clear
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Search properties</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchModal;
