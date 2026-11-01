const Property = require('../models/Property');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const demoProperties = require('../data/demoProperties');

const autoSeedIfEmpty = async () => {
  try {
    const propertyCount = await Property.countDocuments();
    if (propertyCount >= demoProperties.length) {
      return; // Already has full demonstration data
    }

    console.log(`[AutoSeed] Database has ${propertyCount} properties. Auto-populating full 28 demonstration listings & accounts...`);

    // 1. Find or create Host
    let hostUser = await User.findOne({ email: 'host@staynest.com' });
    if (!hostUser) {
      hostUser = await User.create({
        name: 'Aditya Varma',
        email: 'host@staynest.com',
        password: 'password123',
        role: 'host',
        phone: '+91 98765 43210',
        bio: 'Architect & passionate host welcoming travelers to luxurious, design-forward spaces across India.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      });
    }

    // 2. Find or create Guest
    let guestUser = await User.findOne({ email: 'guest@staynest.com' });
    if (!guestUser) {
      guestUser = await User.create({
        name: 'Priya Sharma',
        email: 'guest@staynest.com',
        password: 'password123',
        role: 'guest',
        phone: '+91 91234 56789',
        bio: 'Travel enthusiast exploring authentic homestays and weekend getaways.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      });
    }

    // 3. Upsert demo properties
    for (const propData of demoProperties) {
      await Property.findOneAndUpdate(
        { title: propData.title },
        {
          ...propData,
          host: hostUser._id,
          isDemo: true,
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // 4. Sample Booking & Review
    const firstProperty = await Property.findOne({ title: demoProperties[0].title });
    if (firstProperty) {
      const existingBooking = await Booking.findOne({
        property: firstProperty._id,
        guest: guestUser._id,
      });

      if (!existingBooking) {
        await Booking.create({
          property: firstProperty._id,
          guest: guestUser._id,
          host: hostUser._id,
          checkIn: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          checkOut: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          numberOfGuests: 2,
          numberOfNights: 3,
          pricePerNightAtBooking: firstProperty.pricePerNight,
          basePrice: firstProperty.pricePerNight * 3,
          cleaningFee: firstProperty.cleaningFee,
          serviceFee: Math.round(firstProperty.pricePerNight * 3 * 0.12),
          totalPrice:
            firstProperty.pricePerNight * 3 +
            firstProperty.cleaningFee +
            Math.round(firstProperty.pricePerNight * 3 * 0.12),
          status: 'confirmed',
          specialRequests: 'Late evening check-in requested.',
        });
      }

      const existingReview = await Review.findOne({
        property: firstProperty._id,
        author: guestUser._id,
      });

      if (!existingReview) {
        await Review.create({
          property: firstProperty._id,
          author: guestUser._id,
          rating: 5,
          comment:
            'An absolutely breathtaking stay! The courtyard, ambiance, and location are even more stunning in person. Aditya was an exceptional host.',
        });
      }
    }

    console.log(`[AutoSeed] Full demonstration dataset ready with ${demoProperties.length} listings!`);
  } catch (err) {
    console.error('[AutoSeed Error]:', err.message);
  }
};

module.exports = { autoSeedIfEmpty };
