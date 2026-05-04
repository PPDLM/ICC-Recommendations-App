const request = require('supertest');

// 1. Create the mock function first
const mockQuery = jest.fn();

// 2. Mock 'mysql2/promise' before requiring the app
jest.mock('mysql2/promise', () => {
  return {
    createPool: jest.fn(() => ({
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
      // MySQL returns an array where the first element is the rows: [rows, fields]
      mockQuery.mockResolvedValueOnce([fakeRows, []]);

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
      mockQuery.mockResolvedValueOnce([{}]);

      const payload = {
        title: 'Test Movie',
        type: 'movie', // Note: Make sure this matches your ENUM ('movie' or 'series', lowercase)
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
        type: 'movie', 
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