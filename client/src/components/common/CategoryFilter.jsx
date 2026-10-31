import React from 'react';
import {
  Compass,
  Flame,
  Building2,
  Palmtree,
  Crown,
  Home,
  Castle,
  Trees,
  Waves,
  Mountain,
  SlidersHorizontal,
} from 'lucide-react';

export const CATEGORIES = [
  { label: 'All', icon: Compass, value: '' },
  { label: 'Trending', icon: Flame, value: 'Trending' },
  { label: 'Iconic Cities', icon: Building2, value: 'Iconic Cities' },
  { label: 'Beachfront', icon: Palmtree, value: 'Beachfront' },
  { label: 'Luxury', icon: Crown, value: 'Luxury' },
  { label: 'Cabins', icon: Home, value: 'Cabins' },
  { label: 'Mansions', icon: Castle, value: 'Mansions' },
  { label: 'Countryside', icon: Trees, value: 'Countryside' },
  { label: 'Lakefront', icon: Waves, value: 'Lakefront' },
  { label: 'Amazing Views', icon: Mountain, value: 'Amazing Views' },
];

const CategoryFilter = ({
  activeCategory,
  onSelectCategory,
  onOpenFilterModal,
  activeFilterCount = 0,
}) => {
  return (
    <div className="bg-white border-b border-neutral-200 sticky top-20 z-30 shadow-sm/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Scrollable Categories List */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected =
                activeCategory === cat.value || (!activeCategory && cat.value === '');

              return (
                <button
                  key={cat.label}
                  onClick={() => onSelectCategory(cat.value)}
                  className={`flex flex-col items-center gap-1.5 pb-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-all group shrink-0 ${
                    isSelected
                      ? 'border-neutral-900 text-neutral-900'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                      isSelected ? 'text-neutral-900' : 'text-neutral-500'
                    }`}
                  />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Advanced Filters Button */}
          <button
            onClick={onOpenFilterModal}
            className="flex items-center gap-2 border border-neutral-300 hover:border-neutral-900 rounded-xl px-4 py-2.5 text-xs font-bold shrink-0 shadow-sm hover:shadow transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-brand-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
