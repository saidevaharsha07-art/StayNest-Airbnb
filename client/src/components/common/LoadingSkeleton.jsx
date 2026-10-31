import React from 'react';

const LoadingSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          {/* Image skeleton */}
          <div className="aspect-[20/19] w-full rounded-2xl skeleton-shimmer" />
          {/* Title skeleton */}
          <div className="h-4 w-3/4 rounded skeleton-shimmer mt-1" />
          {/* Subtitle skeleton */}
          <div className="h-3 w-1/2 rounded skeleton-shimmer" />
          {/* Price skeleton */}
          <div className="h-4 w-1/3 rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
