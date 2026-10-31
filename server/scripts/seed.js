require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Property.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Creating demo users...');
    // Create Host
    const hostUser = await User.create({
      name: 'Aditya Varma',
      email: 'host@staynest.com',
      password: 'password123',
      role: 'host',
      phone: '+91 98765 43210',
      bio: 'Architect & passionate host welcoming travelers to luxurious, design-forward spaces across India.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    });

    // Create Guest
    const guestUser = await User.create({
      name: 'Priya Sharma',
      email: 'guest@staynest.com',
      password: 'password123',
      role: 'guest',
      phone: '+91 91234 56789',
      bio: 'Travel enthusiast exploring authentic homestays and weekend getaways.',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    });

    console.log('[Seed] Creating realistic property listings...');

    const sampleProperties = [
      // 1. Hyderabad - Jubilee Hills
      {
        title: 'The Glass Pavilion — Luxury Villa with Private Pool',
        description: 'Set amidst the lush rocky boulders of Jubilee Hills, this architectural masterpiece features floor-to-ceiling glass walls, a private infinity plunge pool, designer Italian furnishings, and serene skyline vistas.',
        location: 'Road No. 36, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        propertyType: 'Villa',
        category: 'Luxury',
        pricePerNight: 12500,
        cleaningFee: 1500,
        serviceFee: 1500,
        bedrooms: 3,
        bathrooms: 3,
        beds: 3,
        maxGuests: 6,
        amenities: ['Wifi', 'Private pool', 'Air conditioning', 'Kitchen', 'Free parking', 'Dedicated workspace', 'TV', 'Balcony', 'Gym'],
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        ],
        host: hostUser._id,
        ratingAverage: 4.95,
        reviewCount: 28,
      },
      // 2. Hyderabad - Hitec City
      {
        title: 'High-Rise Panoramic Penthouse near Cyber Towers',
        description: 'Contemporary 26th-floor luxury apartment with wraparound balcony overlooking Durgam Cheruvu and the Hitec City skyline. Ultra-fast 500Mbps fiber internet, ergonomic workstations, and automated smart-home lighting.',
        location: 'Madhapur, Hitec City',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        propertyType: 'Apartment',
        category: 'Iconic Cities',
        pricePerNight: 4800,
        cleaningFee: 600,
        serviceFee: 550,
        bedrooms: 2,
        bathrooms: 2,
        beds: 2,
        maxGuests: 4,
        amenities: ['Wifi', 'Air conditioning', 'Kitchen', 'Dedicated workspace', 'Elevator', 'Free parking', 'TV', 'Washer'],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        ],
        host: hostUser._id,
        ratingAverage: 4.88,
        reviewCount: 42,
      },
      // 3. Hyderabad - Banjara Hills
      {
        title: 'Heritage Courtyard Suite at Banjara Hills',
        description: 'Immerse yourself in traditional Deccan courtyard living with hand-carved teak pillars, brass accents, lush tropical frangipani trees, and contemporary en-suite comfort.',
        location: 'Road No. 12, Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        propertyType: 'House',
        category: 'Trending',
        pricePerNight: 6200,
        cleaningFee: 800,
        serviceFee: 700,
        bedrooms: 2,
        bathrooms: 2,
        beds: 2,
        maxGuests: 4,
        amenities: ['Wifi', 'Air conditioning', 'Kitchen', 'Free parking', 'Patio or balcony', 'Garden', 'Security cameras'],
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        ],
        host: hostUser._id,
        ratingAverage: 4.92,
        reviewCount: 19,
      },
      // 4. Hyderabad - Gachibowli Financial District
      {
        title: 'The Urban Studio @ Financial District',
        description: 'Cozy and impeccably styled studio apartment designed for modern professionals and travelers. Steps away from top tech parks, US Consulate, and fine dining restaurants.',
        location: 'Nanakramguda, Financial District',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        propertyType: 'Studio',
        category: 'Iconic Cities',
        pricePerNight: 3200,
        cleaningFee: 400,
        serviceFee: 380,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        maxGuests: 2,
        amenities: ['Wifi', 'Air conditioning', 'Kitchen', 'Elevator', 'Dedicated workspace', 'TV', 'Free parking'],
        images: [
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
        ],
        host: hostUser._id,
        ratingAverage: 4.79,
        reviewCount: 35,
      },
      // 5. Goa - Candolim
      {
        title: 'Villa Azul — Portuguese Coastal Haven with Pool',
        description: 'Restored 19th-century Portuguese villa with an azure courtyard pool, palm-shaded verandas, and a private path leading to Candolim beach.',
        location: 'Candolim Beach Road',
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        propertyType: 'Villa',
        category: 'Beachfront',
        pricePerNight: 16500,
        cleaningFee: 2000,
        serviceFee: 1900,
        bedrooms: 4,
        bathrooms: 4,
        beds: 4,
        maxGuests: 8,
        amenities: ['Wifi', 'Private pool', 'Beach access', 'Air conditioning', 'Kitchen', 'Free parking', 'BBQ grill', 'Balcony'],
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        ],
        host: hostUser._id,
        ratingAverage: 4.97,
        reviewCount: 51,
      },
      // 6. Manali - Himachal Pradesh
      {
        title: 'Cedar Crest Pine Chalet with Himalayan Views',
        description: 'Cozy wooden alpine cabin surrounded by ancient deodar forests. Features a stone fireplace, heated wooden floors, panoramic glass terrace, and mountain sunrise views.',
        location: 'Old Manali Hills',
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        propertyType: 'Cabin',
        category: 'Cabins',
        pricePerNight: 7500,
        cleaningFee: 900,
        serviceFee: 850,
        bedrooms: 2,
        bathrooms: 2,
        beds: 3,
        maxGuests: 5,
        amenities: ['Wifi', 'Indoor fireplace', 'Mountain view', 'Kitchen', 'Heater', 'Free parking', 'Balcony'],
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
        ],
        host: hostUser._id,
        ratingAverage: 4.94,
        reviewCount: 64,
      },
      // 7. Jaipur - Rajasthan
      {
        title: 'Royal Sandstone Haveli & Rooftop Jharokha',
        description: 'Step into royal Rajputana elegance in the historic Pink City. Handcrafted marble inlays, carved sandstone jharokhas, and a rooftop terrace overlooking Nahargarh Fort.',
        location: 'C-Scheme, Civil Lines',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        propertyType: 'House',
        category: 'Mansions',
        pricePerNight: 8900,
        cleaningFee: 1000,
        serviceFee: 950,
        bedrooms: 3,
        bathrooms: 3,
        beds: 3,
        maxGuests: 6,
        amenities: ['Wifi', 'Air conditioning', 'Kitchen', 'Rooftop terrace', 'Free parking', 'Breakfast included', 'Courtyard'],
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        ],
        host: hostUser._id,
        ratingAverage: 4.91,
        reviewCount: 38,
      },
      // 8. Pondicherry - White Town
      {
        title: 'Villa La Boheme — French Colonial Villa',
        description: 'Quaint yellow-and-white French colonial townhouse nestled in the heart of White Town. High ceilings, vintage louvered windows, bougainvillea terrace, and 3 minutes walk to Promenade Beach.',
        location: 'Rue Suffren, White Town',
        city: 'Pondicherry',
        state: 'Puducherry',
        country: 'India',
        propertyType: 'Cottage',
        category: 'Beachfront',
        pricePerNight: 5500,
        cleaningFee: 700,
        serviceFee: 600,
        bedrooms: 2,
        bathrooms: 2,
        beds: 2,
        maxGuests: 4,
        amenities: ['Wifi', 'Air conditioning', 'Kitchen', 'Terrace', 'Near beach', 'Free street parking'],
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        ],
        host: hostUser._id,
        ratingAverage: 4.86,
        reviewCount: 29,
      },
    ];

    const createdProperties = await Property.insertMany(sampleProperties);
    console.log(`[Seed] Seeded ${createdProperties.length} premier properties!`);

    // Create a demonstration past booking for the guest
    console.log('[Seed] Creating demo reservation...');
    const sampleProperty = createdProperties[0];
    const demoBooking = await Booking.create({
      property: sampleProperty._id,
      guest: guestUser._id,
      host: hostUser._id,
      checkIn: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      checkOut: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      numberOfGuests: 2,
      numberOfNights: 3,
      pricePerNightAtBooking: sampleProperty.pricePerNight,
      basePrice: sampleProperty.pricePerNight * 3,
      cleaningFee: sampleProperty.cleaningFee,
      serviceFee: Math.round(sampleProperty.pricePerNight * 3 * 0.12),
      totalPrice: sampleProperty.pricePerNight * 3 + sampleProperty.cleaningFee + Math.round(sampleProperty.pricePerNight * 3 * 0.12),
      status: 'confirmed',
      specialRequests: 'Late evening check-in requested.',
    });

    // Create review
    await Review.create({
      property: sampleProperty._id,
      author: guestUser._id,
      rating: 5,
      comment: 'An absolutely breathtaking stay! The glass pavilion and pool are even more stunning in person than in the photos. Aditya was an exceptional host.',
    });

    console.log('========================================================');
    console.log(' StayNest Database Seed Complete!');
    console.log('========================================================');
    console.log(' Demo Accounts Created:');
    console.log('  1. Host:  host@staynest.com  / password123');
    console.log('  2. Guest: guest@staynest.com / password123');
    console.log(` Seeded ${createdProperties.length} properties across Hyderabad, Goa, Manali, Jaipur, etc.`);
    console.log('========================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
