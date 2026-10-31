const Property = require('../models/Property');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get all properties with filtering, searching, availability check & pagination
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      location,
      city,
      category,
      propertyType,
      minPrice,
      maxPrice,
      guests,
      checkIn,
      checkOut,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // 1. Text / Keyword Search across title, description, city, location
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { city: searchRegex },
        { location: searchRegex },
      ];
    }

    // 2. City / Location specific filter
    if (city && city.trim() !== '') {
      query.city = new RegExp(city.trim(), 'i');
    } else if (location && location.trim() !== '') {
      const locRegex = new RegExp(location.trim(), 'i');
      query.$or = [{ city: locRegex }, { location: locRegex }];
    }

    // 3. Category filter
    if (category && category !== 'All' && category !== '') {
      query.category = category;
    }

    // 4. Property Type filter
    if (propertyType && propertyType !== 'All' && propertyType !== '') {
      query.propertyType = propertyType;
    }

    // 5. Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.pricePerNight = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.pricePerNight.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.pricePerNight.$lte = Number(maxPrice);
      }
    }

    // 6. Guest capacity filter
    if (guests && !isNaN(Number(guests))) {
      query.maxGuests = { $gte: Number(guests) };
    }

    // 7. Date-availability check against active bookings
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
        // Find property IDs that have conflicting active bookings
        const conflictingBookings = await Booking.find({
          status: 'confirmed',
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        }).select('property');

        const unavailablePropertyIds = conflictingBookings.map((b) => b.property);
        if (unavailablePropertyIds.length > 0) {
          query._id = { $nin: unavailablePropertyIds };
        }
      }
    }

    // 8. Sorting options
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') {
      sortOption = { pricePerNight: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { pricePerNight: -1 };
    } else if (sort === 'rating') {
      sortOption = { ratingAverage: -1, reviewCount: -1 };
    }

    // 9. Pagination execution
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageSize;

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('host', 'name profileImage')
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
      properties,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'host',
      'name email profileImage bio createdAt'
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    if (!property.isActive) {
      // Allow host to view inactive listing, but not public
      if (!req.user || property.host._id.toString() !== req.user._id.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Property listing is currently inactive.',
        });
      }
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Private (Host)
const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      city,
      state,
      country,
      propertyType,
      category,
      pricePerNight,
      cleaningFee,
      serviceFee,
      bedrooms,
      bathrooms,
      beds,
      maxGuests,
      amenities,
      images,
    } = req.body;

    if (!title || !description || !location || !city || !pricePerNight || !maxGuests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, location, city, price, and guest capacity.',
      });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one property image is required.',
      });
    }

    const property = await Property.create({
      title,
      description,
      location,
      city,
      state: state || '',
      country: country || 'India',
      propertyType: propertyType || 'Apartment',
      category: category || 'Trending',
      pricePerNight: Number(pricePerNight),
      cleaningFee: Number(cleaningFee) || 0,
      serviceFee: Number(serviceFee) || 0,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      beds: Number(beds) || 1,
      maxGuests: Number(maxGuests) || 2,
      amenities: Array.isArray(amenities) ? amenities : ['Wifi'],
      images,
      host: req.user._id,
      isActive: true,
    });

    // Auto-promote user to host if currently a guest
    if (req.user.role === 'guest') {
      await User.findByIdAndUpdate(req.user._id, { role: 'host' });
    }

    res.status(201).json({
      success: true,
      message: 'Property listing created successfully.',
      property,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a property listing
// @route   PUT /api/properties/:id
// @access  Private (Host owner only)
const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Verify ownership
    if (property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit properties you own.',
      });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      property: updatedProperty,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a property listing
// @route   DELETE /api/properties/:id
// @access  Private (Host owner only)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Verify ownership
    if (property.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only delete properties you own.',
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get listings owned by the logged-in host
// @route   GET /api/properties/host/my-listings
// @access  Private
const getHostProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ host: req.user._id }).sort({ createdAt: -1 });

    // Attach active reservation counts for each property
    const propertyIds = properties.map((p) => p._id);
    const activeBookings = await Booking.find({
      property: { $in: propertyIds },
      status: 'confirmed',
    });

    const enriched = properties.map((prop) => {
      const propBookings = activeBookings.filter(
        (b) => b.property.toString() === prop._id.toString()
      );
      return {
        ...prop.toObject(),
        activeReservationsCount: propBookings.length,
      };
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties: enriched,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getHostProperties,
};
