import mongoose from 'mongoose';
import { app } from './app'; //import app declatration

//This is the function that will start the application and connect to the MongoDB database
//We are using mongoose to connect to the MongoDB database
const start = async () => {
  //This is where we check if the JWT_KEY is defined
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined'); //We throw an error if the JWT_KEY is not defined
  }

  //auth-mongo-srv is the name of the service
  //We are using the service name to connect to the MongoDB database
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Auth service listening on port 3000!!!');
  });
};
//This is the function that will start the application
start();
