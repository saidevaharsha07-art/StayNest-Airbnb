import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

const EmptyState = ({
  title = 'No properties found',
  description = 'Try adjusting your search criteria, clearing your filters, or exploring a different destination.',
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-md mb-6">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear all filters</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
