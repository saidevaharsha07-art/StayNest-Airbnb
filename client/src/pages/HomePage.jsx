import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import CategoryFilter from '../components/common/CategoryFilter';
import PropertyCard from '../components/common/PropertyCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import SearchModal from '../components/common/SearchModal';
import FilterModal from '../components/common/FilterModal';
import Footer from '../components/common/Footer';
import { X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const HomePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    minPrice: undefined,
    maxPrice: undefined,
    propertyType: '',
    guests: 1,
    checkIn: '',
    checkOut: '',
    sort: 'newest',
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Fetch properties from backend API
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
        category: category || undefined,
        location: filters.location || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        propertyType: filters.propertyType || undefined,
        guests: filters.guests > 1 ? filters.guests : undefined,
        checkIn: filters.checkIn || undefined,
        checkOut: filters.checkOut || undefined,
        sort: filters.sort,
      };

      const res = await api.get('/properties', { params });
      setProperties(res.data.properties || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('[HomePage] Fetch Error:', err);
      setError('Unable to load properties. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [page, category, filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Count active applied filters
  const activeFilterCount = [
    Boolean(filters.location),
    Boolean(filters.minPrice),
    Boolean(filters.maxPrice),
    Boolean(filters.propertyType),
    Boolean(filters.checkIn),
    Boolean(filters.checkOut),
    filters.guests > 1,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setCategory('');
    setFilters({
      location: '',
      minPrice: undefined,
      maxPrice: undefined,
      propertyType: '',
      guests: 1,
      checkIn: '',
      checkOut: '',
      sort: 'newest',
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Global Navigation Bar */}
      <Navbar onSearchClick={() => setSearchModalOpen(true)} />

      {/* 2. Interactive Category Filter Bar */}
      <CategoryFilter
        activeCategory={category}
        onSelectCategory={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
        onOpenFilterModal={() => setFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active Filter Tags */}
        {(activeFilterCount > 0 || category) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="font-bold text-neutral-600">Active Filters:</span>

            {category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 font-medium">
                Category: {category}
                <button
                  onClick={() => setCategory('')}
                  className="hover:text-neutral-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 font-medium">
                Location: {filters.location}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, location: '' }))}
                  className="hover:text-neutral-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 font-medium">
                Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || 'Any'}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, minPrice: undefined, maxPrice: undefined }))
                  }
                  className="hover:text-neutral-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.propertyType && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 font-medium">
                Type: {filters.propertyType}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, propertyType: '' }))}
                  className="hover:text-neutral-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="font-bold text-brand-600 hover:text-brand-700 underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Header */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm font-semibold text-neutral-500">
              Showing <span className="text-neutral-900 font-bold">{total}</span> stays
              {filters.location ? ` in "${filters.location}"` : ' worldwide'}
            </h1>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchProperties}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Property Grid or Loading / Empty States */}
        {loading ? (
          <LoadingSkeleton count={8} />
        ) : properties.length === 0 ? (
          <EmptyState
            title="No matching properties found"
            description="We couldn't find any listings matching your criteria. Try widening your dates, adjusting your price range, or clearing your filters."
            onReset={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 py-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-full border border-neutral-300 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-700" />
            </button>

            <span className="text-sm font-bold text-neutral-700 px-4">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 rounded-full border border-neutral-300 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-neutral-700" />
            </button>
          </div>
        )}
      </main>

      {/* 4. Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        currentFilters={filters}
        onSearch={(searchData) => {
          setFilters((prev) => ({ ...prev, ...searchData }));
          setPage(1);
        }}
      />

      {/* 5. Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        currentFilters={filters}
        onApply={(filterData) => {
          setFilters((prev) => ({ ...prev, ...filterData }));
          setPage(1);
        }}
      />

      {/* 6. Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
