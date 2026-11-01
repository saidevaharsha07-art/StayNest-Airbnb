const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Property = require('../models/Property');
const demoProperties = require('../data/demoProperties');

let mongoServer;

const CATEGORIES = [
  'Trending',
  'Iconic Cities',
  'Beachfront',
  'Luxury',
  'Cabins',
  'Mansions',
  'Countryside',
  'Lakefront',
  'Amazing Views',
];

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create demo host
  const host = await User.create({
    name: 'Test Host',
    email: 'test_filter_host@staynest.com',
    password: 'password123',
    role: 'host',
  });

  // Seed the 28 demo properties
  for (const prop of demoProperties) {
    await Property.create({
      ...prop,
      host: host._id,
      isDemo: true,
      isActive: true,
    });
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('=== Category & Advanced Filter Verification Suite ===', () => {
  // Test 1: Baseline All Properties query
  it('should return all properties with pagination when no category filter is applied', async () => {
    const res = await request(app)
      .get('/api/properties?page=1&limit=12')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(demoProperties.length);
    expect(res.body.properties.length).toBe(12);
    expect(res.body.totalPages).toBe(Math.ceil(demoProperties.length / 12));
  });

  // Test 2: Test EVERY SINGLE CATEGORY INDIVIDUALLY
  test.each(CATEGORIES)('Category filter: "%s" should return matching properties', async (category) => {
    const res = await request(app)
      .get(`/api/properties?category=${encodeURIComponent(category)}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
    expect(res.body.properties.length).toBeGreaterThanOrEqual(2);

    // Verify every returned property belongs to this category
    res.body.properties.forEach((property) => {
      expect(property.category.toLowerCase()).toBe(category.toLowerCase());
    });
  });

  // Test 3: Location search filter (e.g. Hyderabad, Goa, Mumbai, Bangalore, Kerala)
  test.each(['Hyderabad', 'Goa', 'Manali', 'Jaipur', 'Pondicherry', 'Bangalore', 'Mumbai', 'Kerala'])(
    'Location filter for "%s" should return properties located in that city',
    async (city) => {
      const res = await request(app)
        .get(`/api/properties?location=${encodeURIComponent(city)}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);

      res.body.properties.forEach((property) => {
        const matchesCity = property.city.toLowerCase().includes(city.toLowerCase());
        const matchesLocation = property.location.toLowerCase().includes(city.toLowerCase());
        expect(matchesCity || matchesLocation).toBe(true);
      });
    }
  );

  // Test 4: Combined Filter (Category + Location)
  it('should filter by Category AND Location simultaneously without conflicts', async () => {
    const res = await request(app)
      .get('/api/properties?category=Beachfront&location=Goa')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);

    res.body.properties.forEach((property) => {
      expect(property.category).toBe('Beachfront');
      expect(property.city).toBe('Goa');
    });
  });

  // Test 5: Combined Filter (Category + Price Range)
  it('should filter by Category AND Price Range', async () => {
    const res = await request(app)
      .get('/api/properties?category=Luxury&minPrice=10000&maxPrice=30000')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);

    res.body.properties.forEach((property) => {
      expect(property.category).toBe('Luxury');
      expect(property.pricePerNight).toBeGreaterThanOrEqual(10000);
      expect(property.pricePerNight).toBeLessThanOrEqual(30000);
    });
  });

  // Test 6: Text search combined with Category filter
  it('should perform text search within a specific category', async () => {
    const res = await request(app)
      .get('/api/properties?search=Pool&category=Luxury')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);

    res.body.properties.forEach((property) => {
      expect(property.category).toBe('Luxury');
      const textCorpus = `${property.title} ${property.description}`.toLowerCase();
      expect(textCorpus).toMatch(/pool/i);
    });
  });

  // Test 7: Clearing filters restores all 28 properties
  it('clearing category filter returns full property catalog', async () => {
    const filteredRes = await request(app)
      .get('/api/properties?category=Lakefront')
      .expect(200);

    expect(filteredRes.body.total).toBe(3);

    const clearedRes = await request(app)
      .get('/api/properties?category=')
      .expect(200);

    expect(clearedRes.body.total).toBe(demoProperties.length);
  });

  // Test 8: Empty state detection
  it('returns empty list gracefully when no properties match criteria', async () => {
    const res = await request(app)
      .get('/api/properties?category=Beachfront&location=HimalayasNonExistent')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(0);
    expect(res.body.properties).toEqual([]);
  });
});
