import mongoose from 'mongoose';
import { app } from './app'; //import app declatration
import { natsWrapper } from './nats-wrapper';

//This is the function that will start the application and connect to the MongoDB database
//We are using mongoose to connect to the MongoDB database
const start = async () => {
  //This is where we check if the JWT_KEY is defined
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined'); //We throw an error if the JWT_KEY is not defined
  }

  //This is where we check if the MONGO_URI is defined
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    //Connect to NATS server
    await natsWrapper.connect(
      'ticketing', //Cluster ID
      'randomid', //Client ID
      'http://nats-srv:4222' //URL (prevously localhost:4222, now nats-srv:4222 because of k8s)
    );

    //Graceful shutdown for NATS connection
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    //Connect to MongoDB database - MONGO_URI is defined in k8s tickets-depl.yaml
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Tickets service listening on port 3000!!!');
  });
};
//This is the function that will start the application
start();
