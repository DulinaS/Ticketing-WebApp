//This is the declaration of our express app
import express from 'express';
import 'express-async-errors'; //This is a middleware that will handle async errors in the application
import { json } from 'body-parser';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session'; //This is a middleware that will handle cookies in the application

//This is a named import, so we can import it in the index.ts file
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { signUpRouter } from './routes/signup';
import { errorHandler } from '@dulinatickets/common';
import { NotFoundError } from '@dulinatickets/common';

const app = express();
app.set('trust proxy', true); //This is used to trust the proxy headers, which is necessary when running behind a reverse proxy like Nginx or Heroku
app.use(json());

app.use(
  cookieSession({
    signed: false, //This means that the cookie will not be signed
    secure: process.env.NODE_ENV !== 'test', //If environment is 'test' ---> secure = false otherwise secure :true
  })
);
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

export { app }; //This is a named export
