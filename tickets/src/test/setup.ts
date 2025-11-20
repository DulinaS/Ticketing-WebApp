import { MongoMemoryServer } from 'mongodb-memory-server';
/*Starts a temporary MongoDB server in memory (RAM) without needing a real MongoDB instance installed.

This server runs only during your tests and is destroyed after tests complete.

Your tests  can connect to this in-memory database like a normal MongoDB instance. */

import mongoose from 'mongoose';
import { app } from '../app'; //Import app declaration
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Session } from 'inspector';
//Tell typescript there is a global property called signin()
declare global {
  var signin: () => string[];
}

let mongo: any;

//JEST will see we're trying to mock the real file
//Instead of the real file it will use nats-wrapper.ts in __mock__ directory
jest.mock('../nats-wrapper');

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

//Faking the authorization
global.signin = () => {
  //Build a JWT payload {id,email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(), //random user id everytime when global.signin used
    email: 'test@test.com',
  };

  //Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build session Object {jwt: MY_JWT}
  const session = { jwt: token };

  //Turn session into JSON
  const sessionJSON = JSON.stringify(session);

  //Take JSON and encode it as base 64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return a string thats a cookie with encoded data
  return [`session=${base64}`];
};
