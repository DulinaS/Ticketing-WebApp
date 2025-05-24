import express from 'express';
import 'express-async-errors'; //This is a middleware that will handle async errors in the application
import { json } from 'body-parser';
import mongoose from 'mongoose';

//This is a named import, so we can import it in the index.ts file
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { signUpRouter } from './routes/signup';
import { errorHandler } from './middlewares/error_handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.use(json());

//Routes from the routes folder
app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

//This is a catch-all route that will handle any requests that don't match the above routes'
//We have to throw a new NotFoundError here because we want to handle the error in the error handler middleware
//async will allow us to use await inside the function, but we don't need it here
app.all('*', async (req, res) => {
  throw new NotFoundError();
});

//Error handler middleware
app.use(errorHandler);
//This is a middleware that will handle any errors that occur in the application

//This is the function that will start the application and connect to the MongoDB database
//We are using mongoose to connect to the MongoDB database
const start = async () => {
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
