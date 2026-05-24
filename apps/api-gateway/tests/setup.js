import mongoose from 'mongoose';
import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
jest.setTimeout(30000);

// Connect to a specific test database before tests
beforeAll(async () => {
  const uri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/financial-ai-test';
  
  // Close any existing connections to prevent issues
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });
});

// Drop database, close connection after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  }
});

// Clear all collections between individual tests to ensure isolation
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
