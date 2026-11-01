const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

let mongoServer;
let hostToken;
let guestToken;
let hostId;
let guestId;
let testPropertyId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clear database before each test suite execution
});

describe('=== StayNest API Test Suite ===', () => {
  // ==========================================
  // 1. AUTHENTICATION TESTS
  // ==========================================
  describe('Authentication Endpoints', () => {
    it('should register a new user successfully with hashed password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Host',
          email: 'testhost@staynest.com',
          password: 'password123',
          role: 'host',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('testhost@staynest.com');
      expect(res.body.user.password).toBeUndefined(); // Should never leak password

      hostToken = res.body.token;
      hostId = res.body.user._id;

      // Verify in DB that password is not plain text
      const dbUser = await User.findById(hostId).select('+password');
      expect(dbUser.password).not.toBe('password123');
      expect(dbUser.password.startsWith('$2')).toBe(true);
    });

    it('should reject registration with a duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Host',
          email: 'testhost@staynest.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should register a guest user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Guest',
          email: 'testguest@staynest.com',
          password: 'password123',
          role: 'guest',
        });

      expect(res.statusCode).toBe(201);
      guestToken = res.body.token;
      guestId = res.body.user._id;
    });

    it('should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testhost@staynest.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testhost@staynest.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should get current authenticated user profile via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${hostToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('testhost@staynest.com');
    });

    it('should reject access to protected route when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });

  // ==========================================
  // 2. PROPERTY ENDPOINTS TESTS
  // ==========================================
  describe('Property Endpoints', () => {
    it('should reject property creation by unauthenticated user', async () => {
      const res = await request(app)
        .post('/api/properties')
        .send({
          title: 'Unauthenticated Villa',
          description: 'A place created without login',
          location: 'Hyderabad',
          city: 'Hyderabad',
          pricePerNight: 5000,
          maxGuests: 4,
          images: ['https://example.com/image.jpg'],
        });

      expect(res.statusCode).toBe(401);
    });

    it('should create a property as an authenticated host', async () => {
      const res = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: 'Jubilee Hills Luxury Retreat',
          description: 'A magnificent villa in prime Jubilee Hills with pool and gardens.',
          location: 'Road 45, Jubilee Hills',
          city: 'Hyderabad',
          propertyType: 'Villa',
          category: 'Luxury',
          pricePerNight: 10000,
          cleaningFee: 1000,
          serviceFee: 1200,
          bedrooms: 3,
          bathrooms: 3,
          maxGuests: 6,
          amenities: ['Wifi', 'Pool', 'Air conditioning'],
          images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.property.title).toBe('Jubilee Hills Luxury Retreat');
      expect(res.body.property.host.toString()).toBe(hostId);

      testPropertyId = res.body.property._id;
    });

    it('should retrieve list of properties with pagination and filtering', async () => {
      const res = await request(app)
        .get('/api/properties?city=Hyderabad&category=Luxury')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.properties.length).toBeGreaterThanOrEqual(1);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });

    it('should get single property details by ID', async () => {
      const res = await request(app)
        .get(`/api/properties/${testPropertyId}`)
        .expect(200);

      expect(res.body.property.title).toBe('Jubilee Hills Luxury Retreat');
      expect(res.body.property.host.name).toBe('Test Host');
    });

    it('should reject property edit from unauthorized user (non-owner)', async () => {
      const res = await request(app)
        .put(`/api/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });

    it('should allow property owner to edit their listing', async () => {
      const res = await request(app)
        .put(`/api/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ pricePerNight: 11000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.property.pricePerNight).toBe(11000);
    });
  });

  // ==========================================
  // 3. BOOKING LOGIC AND CONCURRENCY TESTS
  // ==========================================
  describe('Booking Endpoints & Business Logic', () => {
    let bookingId;

    it('should reject host booking their own property', async () => {
      const checkIn = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      const checkOut = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          propertyId: testPropertyId,
          checkIn,
          checkOut,
          numberOfGuests: 2,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/cannot reserve their own/i);
    });

    it('should reject check-out date before or equal to check-in date', async () => {
      const checkIn = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      const checkOut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          propertyId: testPropertyId,
          checkIn,
          checkOut,
          numberOfGuests: 2,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/after check-in/i);
    });

    it('should reject bookings exceeding property max guest capacity', async () => {
      const checkIn = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const checkOut = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          propertyId: testPropertyId,
          checkIn,
          checkOut,
          numberOfGuests: 20, // Max is 6
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/maximum of 6 guests/i);
    });

    it('should create booking and calculate server-side price accurately', async () => {
      // 3 nights stay
      const checkIn = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
      const checkOut = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          propertyId: testPropertyId,
          checkIn,
          checkOut,
          numberOfGuests: 2,
          clientSuppliedPrice: 10, // Manipulated price that MUST be ignored
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);

      const booking = res.body.booking;
      expect(booking.numberOfNights).toBe(3);
      expect(booking.pricePerNightAtBooking).toBe(11000);
      expect(booking.basePrice).toBe(33000); // 3 * 11000
      expect(booking.cleaningFee).toBe(1000);
      expect(booking.serviceFee).toBe(Math.round(33000 * 0.12)); // 3960
      expect(booking.totalPrice).toBe(33000 + 1000 + 3960); // 37960
      expect(booking.status).toBe('confirmed');

      bookingId = booking._id;
    });

    it('should reject conflicting overlapping active booking for the same property', async () => {
      // Overlaps with day 16 to 17 (which falls inside day 15 to 18)
      const checkIn = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString();
      const checkOut = new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          propertyId: testPropertyId,
          checkIn,
          checkOut,
          numberOfGuests: 2,
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toMatch(/no longer available/i);
    });

    it('should retrieve guest bookings via /api/bookings/my', async () => {
      const res = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.bookings.length).toBeGreaterThanOrEqual(1);
      expect(res.body.bookings[0]._id).toBe(bookingId);
    });

    it('should retrieve host reservations via /api/bookings/host', async () => {
      const res = await request(app)
        .get('/api/bookings/host')
        .set('Authorization', `Bearer ${hostToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.bookings.length).toBeGreaterThanOrEqual(1);
    });

    it('should cancel booking and release dates', async () => {
      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ reason: 'Trip rescheduled' });

      expect(res.statusCode).toBe(200);
      expect(res.body.booking.status).toBe('cancelled');

      // Now the previously conflicting dates should be available again!
      const checkIn = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString();
      const checkOut = new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString();

      const retryRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          propertyId: testPropertyId,
          checkIn,
          checkOut,
          numberOfGuests: 2,
        });

      expect(retryRes.statusCode).toBe(201);
    });
  });
});
