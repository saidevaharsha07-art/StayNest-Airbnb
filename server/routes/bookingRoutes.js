const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getHostBookings,
  getBookingById,
  cancelBooking,
  getPropertyBookedDates,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Public query for booked dates (for frontend calendar availability)
router.get('/property/:propertyId/booked-dates', getPropertyBookedDates);

// User and Host booking management (Protected)
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/host', protect, getHostBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
