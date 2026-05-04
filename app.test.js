const request = require('supertest');

// 1. Create the mock function first
const mockQuery = jest.fn();

// 2. Mock 'pg' before requiring the app, returning our mockQuery
jest.mock('pg', () => {
  return {
    Pool: jest.fn(() => ({
      query: mockQuery,
    })),
  };
});

// Mock initDatabase
jest.mock('./db/init', () => jest.fn().mockResolvedValue(true));

const { app, setup } = require('./app');

beforeAll(async () => {
  await setup();
});

describe('API Endpoints', () => {
  
  beforeEach(() => {
    // Clear the mock before each test instead of recreating it
    mockQuery.mockClear();
  });

  describe('GET /api/recommendations', () => {
    it('should return recommendations', async () => {
      const fakeRows = [{ id: 1, title: 'Test Movie' }];
      mockQuery.mockResolvedValueOnce({ rows: fakeRows });

      const res = await request(app).get('/api/recommendations');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(fakeRows);
    });

    it('should handle DB errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/recommendations');
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/recommendations', () => {
    it('should insert a recommendation', async () => {
      mockQuery.mockResolvedValueOnce({});

      const payload = {
        title: 'Test Movie',
        type: 'Movie',
        genre: 'Action',
        year: 2023,
        comment: 'Great!',
        rating: 5,
        image_url: 'http://example.com/image.jpg',
      };

      const res = await request(app).post('/api/recommendations').send(payload);
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'Created' });
    });

    it('should handle DB insert errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Insert error'));

      const payload = {
        title: 'Test Movie',
        type: 'Movie',
        genre: 'Action',
        year: 2023,
        comment: 'Great!',
        rating: 5,
        image_url: 'http://example.com/image.jpg',
      };

      const res = await request(app).post('/api/recommendations').send(payload);
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });
});