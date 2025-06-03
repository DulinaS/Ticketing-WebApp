import { MongoMemoryServer } from 'mongodb-memory-server';
/*Starts a temporary MongoDB server in memory (RAM) without needing a real MongoDB instance installed.

This server runs only during your tests and is destroyed after tests complete.

Your tests can connect to this in-memory database like a normal MongoDB instance. */

import mongoose from 'mongoose';
import { app } from '../app'; //Import app declaration

let mongo: any;

//Runs before all tests run in
beforeAll(async () => {
  //define JWT key
  process.env.JWT_KEY = 'asdfasdf';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
