const Review = require('../models/Review');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// @desc    Create a review for a property
// @route   POST /api/properties/:id/reviews
// @access  Private (Guests with completed or active stay)
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const propertyId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both a numeric rating (1-5) and a written comment.',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Check if user has an existing confirmed or completed reservation for this property
    const hasStayed = await Booking.findOne({
      property: propertyId,
      guest: req.user._id,
      status: { $in: ['confirmed', 'completed'] },
    });

    if (!hasStayed && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only guests who have booked and stayed at this property can submit a review.',
      });
    }

    // Check if user already submitted a review
    const existingReview = await Review.findOne({
      property: propertyId,
      author: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this property.',
      });
    }

    const review = await Review.create({
      property: propertyId,
      author: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Recalculate average rating for property
    const allReviews = await Review.find({ property: propertyId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingAverage = Number((totalRating / allReviews.length).toFixed(1));

    property.ratingAverage = ratingAverage;
    property.reviewCount = allReviews.length;
    await property.save();

    const populatedReview = await Review.findById(review._id).populate(
      'author',
      'name profileImage'
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review: populatedReview,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews for a property
// @route   GET /api/properties/:id/reviews
// @access  Public
const getPropertyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ property: req.params.id })
      .populate('author', 'name profileImage createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
};
