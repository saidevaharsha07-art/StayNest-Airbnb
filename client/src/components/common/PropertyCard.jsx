import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';

const PropertyCard = ({ property }) => {
  const [isFavorite, setIsFavorite] = useState(() => {
    const saved = localStorage.getItem(`fav_${property._id}`);
    return saved === 'true';
  });

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isFavorite;
    setIsFavorite(next);
    localStorage.setItem(`fav_${property._id}`, next ? 'true' : 'false');
  };

  const coverImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group flex flex-col gap-3 rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      {/* Image Container */}
      <div className="relative aspect-[20/19] w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
        <img
          src={coverImage}
          alt={property.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={toggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 active:scale-95 transition-transform text-white/90 drop-shadow-md z-10"
        >
          <Heart
            className={`w-6 h-6 stroke-[2] transition-colors ${
              isFavorite
                ? 'fill-brand-500 text-brand-500 stroke-brand-500'
                : 'fill-black/30 text-white stroke-white'
            }`}
          />
        </button>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[11px] font-bold text-neutral-800 shadow-sm">
          {property.propertyType} • {property.category}
        </div>
      </div>

      {/* Property Details */}
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center justify-between font-semibold text-neutral-900">
          <span className="truncate">
            {property.city}, {property.country}
          </span>
          <div className="flex items-center gap-1 shrink-0 font-medium text-xs">
            <Star className="w-3.5 h-3.5 fill-neutral-900 text-neutral-900" />
            <span>
              {property.ratingAverage > 0 ? property.ratingAverage.toFixed(2) : 'New'}
            </span>
          </div>
        </div>

        <p className="text-neutral-500 text-xs truncate">{property.title}</p>
        <p className="text-neutral-400 text-xs">
          {property.maxGuests} guests • {property.bedrooms} beds
        </p>

        {/* Price */}
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-bold text-neutral-900 text-base">
            ₹{property.pricePerNight?.toLocaleString('en-IN')}
          </span>
          <span className="text-neutral-500 text-xs font-normal">night</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
