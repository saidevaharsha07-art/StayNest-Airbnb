require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const demoProperties = require('../data/demoProperties');

const seedData = async () => {
  try {
    const isReset = process.argv.includes('--reset');
    console.log(`[Seed] Connecting to database... (Reset mode: ${isReset ? 'ENABLED' : 'SAFE UPSERT'})`);
    await connectDB();

    // 1. Find or create Demo Host
    let hostUser = await User.findOne({ email: 'host@staynest.com' });
    if (!hostUser) {
      console.log('[Seed] Creating demo host account (host@staynest.com)...');
      hostUser = await User.create({
        name: 'Aditya Varma',
        email: 'host@staynest.com',
        password: 'password123',
        role: 'host',
        phone: '+91 98765 43210',
        bio: 'Architect & passionate host welcoming travelers to luxurious, design-forward spaces across India.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      });
    } else {
      console.log('[Seed] Reusing existing demo host account (host@staynest.com).');
    }

    // 2. Find or create Demo Guest
    let guestUser = await User.findOne({ email: 'guest@staynest.com' });
    if (!guestUser) {
      console.log('[Seed] Creating demo guest account (guest@staynest.com)...');
      guestUser = await User.create({
        name: 'Priya Sharma',
        email: 'guest@staynest.com',
        password: 'password123',
        role: 'guest',
        phone: '+91 91234 56789',
        bio: 'Travel enthusiast exploring authentic homestays and weekend getaways.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      });
    } else {
      console.log('[Seed] Reusing existing demo guest account (guest@staynest.com).');
    }

    // 3. Handle Property Seeding safely
    if (isReset) {
      console.log('[Seed] Reset mode requested: Removing previous demo properties...');
      await Property.deleteMany({ isDemo: true });
    }

    console.log(`[Seed] Seeding/upserting ${demoProperties.length} premier properties...`);
    const seededProperties = [];

    for (const propData of demoProperties) {
      // Upsert by title to avoid duplicates if re-run multiple times
      const savedProp = await Property.findOneAndUpdate(
        { title: propData.title },
        {
          ...propData,
          host: hostUser._id,
          isDemo: true,
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededProperties.push(savedProp);
    }

    console.log(`[Seed] Successfully processed ${seededProperties.length} demonstration properties across 9 categories!`);

    // 4. Ensure demo booking exists without overwriting real bookings
    const firstProperty = seededProperties[0];
    const existingDemoBooking = await Booking.findOne({
      property: firstProperty._id,
      guest: guestUser._id,
    });

    if (!existingDemoBooking) {
      console.log('[Seed] Creating initial sample reservation for demo guest...');
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

    // 5. Ensure demo review exists without overwriting real reviews
    const existingDemoReview = await Review.findOne({
      property: firstProperty._id,
      author: guestUser._id,
    });

    if (!existingDemoReview) {
      console.log('[Seed] Creating initial sample review for demo guest...');
      await Review.create({
        property: firstProperty._id,
        author: guestUser._id,
        rating: 5,
        comment:
          'An absolutely breathtaking stay! The courtyard, ambiance, and location are even more stunning in person. Aditya was an exceptional host.',
      });
    }

    // Compute category counts for reporting
    const categoryCounts = {};
    for (const p of seededProperties) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }

    console.log('========================================================');
    console.log(' StayNest Safe Database Seeding Complete!');
    console.log('========================================================');
    console.log(` Total Properties Seeded: ${seededProperties.length}`);
    console.log(' Category Breakdown:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   - ${cat.padEnd(16)} : ${count} properties`);
    });
    console.log(' Demo Accounts:');
    console.log('   - Host : host@staynest.com  / password123');
    console.log('   - Guest: guest@staynest.com / password123');
    console.log('========================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
