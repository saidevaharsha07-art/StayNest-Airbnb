const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getHostProperties,
} = require('../controllers/propertyController');
const {
  createReview,
  getPropertyReviews,
} = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public listing & search, private creation
router.route('/')
  .get(getProperties)
  .post(protect, createProperty);

// Host-specific listings
router.get('/host/my-listings', protect, getHostProperties);

// Specific property operations
router.route('/:id')
  .get(optionalAuth, getPropertyById)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

// Review routes nested on property
router.route('/:id/reviews')
  .get(getPropertyReviews)
  .post(protect, createReview);

module.exports = router;
