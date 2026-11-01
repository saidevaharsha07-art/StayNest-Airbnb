import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';

const PROPERTY_TYPES = [
  'All',
  'Apartment',
  'Villa',
  'House',
  'Cottage',
  'Cabin',
  'Studio',
  'Private Room',
];

const FilterModal = ({ isOpen, onClose, onApply, currentFilters = {} }) => {
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
  const [propertyType, setPropertyType] = useState(currentFilters.propertyType || 'All');
  const [sort, setSort] = useState(currentFilters.sort || 'newest');

  useEffect(() => {
    if (isOpen) {
      setMinPrice(currentFilters.minPrice || '');
      setMaxPrice(currentFilters.maxPrice || '');
      setPropertyType(currentFilters.propertyType || 'All');
      setSort(currentFilters.sort || 'newest');
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleApply = (e) => {
    e.preventDefault();
    onApply({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      propertyType: propertyType === 'All' ? '' : propertyType,
      sort,
    });
    onClose();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setPropertyType('All');
    setSort('newest');
    onApply({ minPrice: undefined, maxPrice: undefined, propertyType: '', sort: 'newest' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-neutral-100">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-500" />
            <h2 className="text-lg font-bold text-neutral-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="py-4 space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-2">Price Range (per night)</h3>
            <p className="text-xs text-neutral-500 mb-3">Nightly prices before taxes and fees</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-neutral-200 rounded-xl p-3 focus-within:border-neutral-900">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase">
                  Minimum
                </label>
                <div className="flex items-center">
                  <span className="text-neutral-500 text-sm font-medium mr-1">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="border border-neutral-200 rounded-xl p-3 focus-within:border-neutral-900">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase">
                  Maximum
                </label>
                <div className="flex items-center">
                  <span className="text-neutral-500 text-sm font-medium mr-1">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="50,000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-3">Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => {
                const isSelected = propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-2">Sort Results</h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl p-3 text-sm font-medium bg-white focus:outline-none focus:border-neutral-900"
            >
              <option value="newest">Newest listings first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top guest ratings</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Show Stays
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterModal;
