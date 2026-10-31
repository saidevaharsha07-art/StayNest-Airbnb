const Booking = require('../models/Booking');
const Property = require('../models/Property');

// Helper to normalize dates to UTC midnight to avoid timezone drift issues
const normalizeDate = (d) => {
  const date = new Date(d);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

// @desc    Create a new booking reservation
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { propertyId, checkIn, checkOut, numberOfGuests, specialRequests } = req.body;

    if (!propertyId || !checkIn || !checkOut || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide property ID, check-in date, check-out date, and number of guests.',
      });
    }

    const checkInDate = normalizeDate(checkIn);
    const checkOutDate = normalizeDate(checkOut);
    const today = normalizeDate(new Date());

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date format.',
      });
    }

    // 1. Check-in must not be in the past
    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past.',
      });
    }

    // 2. Check-out must be strictly later than check-in
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be at least one day after check-in date.',
      });
    }

    // 3. Guest count must be a positive integer
    const parsedGuests = parseInt(numberOfGuests, 10);
    if (isNaN(parsedGuests) || parsedGuests < 1) {
      return res.status(400).json({
        success: false,
        message: 'Number of guests must be a positive integer.',
      });
    }

    // 4. Verify property exists and is active
    const property = await Property.findById(propertyId);
    if (!property || !property.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or is currently not available for bookings.',
      });
    }

    // 5. User cannot book their own property
    if (property.host.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Hosts cannot reserve their own property listings.',
      });
    }

    // 6. Guest count cannot exceed capacity
    if (parsedGuests > property.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `This property can accommodate a maximum of ${property.maxGuests} guests.`,
      });
    }

    // 7. Check for conflicting active reservations (status: 'confirmed')
    // Overlap condition: existingCheckIn < newCheckOut && existingCheckOut > newCheckIn
    const conflictingBooking = await Booking.findOne({
      property: property._id,
      status: 'confirmed',
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'The selected dates are unfortunately no longer available for this property.',
      });
    }

    // 8. Calculate total on the server side (NEVER trust client-provided amounts)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const numberOfNights = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (numberOfNights < 1) {
      return res.status(400).json({
        success: false,
        message: 'Booking must be for at least one night.',
      });
    }

    const pricePerNightAtBooking = property.pricePerNight;
    const basePrice = numberOfNights * pricePerNightAtBooking;
    const cleaningFee = property.cleaningFee || 0;
    // Standard 12% platform service fee
    const serviceFee = Math.round(basePrice * 0.12);
    const totalPrice = basePrice + cleaningFee + serviceFee;

    // 9. Create booking
    const booking = await Booking.create({
      property: property._id,
      guest: req.user._id,
      host: property.host,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests: parsedGuests,
      numberOfNights,
      pricePerNightAtBooking,
      basePrice,
      cleaningFee,
      serviceFee,
      totalPrice,
      status: 'confirmed',
      specialRequests: specialRequests || '',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title location city images propertyType pricePerNight')
      .populate('host', 'name email profileImage phone')
      .populate('guest', 'name email profileImage');

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed successfully.',
      booking: populatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get bookings for the logged-in guest
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate('property', 'title location city images propertyType pricePerNight')
      .populate('host', 'name email profileImage phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reservations received for host's properties
// @route   GET /api/bookings/host
// @access  Private (Host)
const getHostBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ host: req.user._id })
      .populate('property', 'title location city images propertyType pricePerNight')
      .populate('guest', 'name email profileImage phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title location city images propertyType pricePerNight amenities')
      .populate('host', 'name email profileImage phone')
      .populate('guest', 'name email profileImage phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Verify authorized party: must be either guest or host
    const isGuest = booking.guest._id.toString() === req.user._id.toString();
    const isHost = booking.host._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not have permission to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Verify authorized party: must be either guest or host
    const isGuest = booking.guest.toString() === req.user._id.toString();
    const isHost = booking.host.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You do not have permission to cancel this booking.',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || (isGuest ? 'Cancelled by guest' : 'Cancelled by host');
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Dates are now available for booking.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get booked date ranges for a property to disable in UI calendar
// @route   GET /api/bookings/property/:propertyId/booked-dates
// @access  Public
const getPropertyBookedDates = async (req, res, next) => {
  try {
    const today = normalizeDate(new Date());

    const activeBookings = await Booking.find({
      property: req.params.propertyId,
      status: 'confirmed',
      checkOut: { $gte: today },
    }).select('checkIn checkOut');

    const bookedRanges = activeBookings.map((b) => ({
      checkIn: b.checkIn,
      checkOut: b.checkOut,
    }));

    res.status(200).json({
      success: true,
      count: bookedRanges.length,
      bookedRanges,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  cancelBooking,
  getPropertyBookedDates,
};
