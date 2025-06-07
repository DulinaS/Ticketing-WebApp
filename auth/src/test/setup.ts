import { MongoMemoryServer } from 'mongodb-memory-server';
/*Starts a temporary MongoDB server in memory (RAM) without needing a real MongoDB instance installed.

This server runs only during your tests and is destroyed after tests complete.

Your tests  can connect to this in-memory database like a normal MongoDB instance. */

import mongoose from 'mongoose';
import { app } from '../app'; //Import app declaration
import request from 'supertest';

//Tell typescript there is a global property called signin()
declare global {
  var signin: () => Promise<string[]>;
}

let mongo: any;

//Runs before all tests run in
beforeAll(async () => {
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

global.signin = async () => {
  const email = 'test@test.com'; //email we're trying to authenticate
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
    })
    .expect(201);

  //Pull authentication cookie
  const cookie = response.get('Set-Cookie');

  if (!cookie) {
    throw new Error('Expected cookie but got undefined.');
  }

  return cookie;
};
