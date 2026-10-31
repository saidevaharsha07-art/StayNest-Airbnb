const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a property title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed property description'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please provide an address or neighborhood description'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please specify the city'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      required: [true, 'Please specify the country'],
      trim: true,
      default: 'India',
    },
    propertyType: {
      type: String,
      required: [true, 'Please specify the property type'],
      enum: [
        'Apartment',
        'Villa',
        'House',
        'Cottage',
        'Cabin',
        'Studio',
        'Private Room',
        'Hotel Room',
        'Unique Space',
      ],
      default: 'Apartment',
    },
    category: {
      type: String,
      enum: [
        'Trending',
        'Iconic Cities',
        'Beachfront',
        'Countryside',
        'Luxury',
        'Cabins',
        'Mansions',
        'Lakefront',
        'Amazing Views',
        'Castles',
      ],
      default: 'Trending',
      index: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please specify the nightly price'],
      min: [1, 'Price per night must be at least 1'],
    },
    cleaningFee: {
      type: Number,
      default: 0,
      min: [0, 'Cleaning fee cannot be negative'],
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: [0, 'Service fee cannot be negative'],
    },
    bedrooms: {
      type: Number,
      required: [true, 'Please specify the number of bedrooms'],
      min: [1, 'Must have at least 1 bedroom'],
      default: 1,
    },
    bathrooms: {
      type: Number,
      required: [true, 'Please specify the number of bathrooms'],
      min: [1, 'Must have at least 1 bathroom'],
      default: 1,
    },
    beds: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 bed'],
    },
    maxGuests: {
      type: Number,
      required: [true, 'Please specify maximum guest capacity'],
      min: [1, 'Must accommodate at least 1 guest'],
      default: 2,
    },
    amenities: {
      type: [String],
      default: ['Wifi', 'Air conditioning', 'Kitchen'],
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A property must have at least one image',
      },
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Property must belong to a host'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
propertySchema.index({ city: 1, pricePerNight: 1 });
propertySchema.index({ category: 1, isActive: 1 });
propertySchema.index({
  title: 'text',
  description: 'text',
  city: 'text',
  location: 'text',
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
