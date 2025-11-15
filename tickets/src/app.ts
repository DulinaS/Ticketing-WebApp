//This is the declaration of our express app
import express from 'express';
import 'express-async-errors'; //This is a middleware that will handle async errors in the application
import { json } from 'body-parser';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session'; //This is a middleware that will handle cookies in the application

import { errorHandler } from '@dulinatickets/common';
import { NotFoundError } from '@dulinatickets/common';
import { currentUser } from '@dulinatickets/common';

import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';

const app = express();
app.set('trust proxy', true); //This is used to trust the proxy headers, which is necessary when running behind a reverse proxy like Nginx or Heroku
app.use(json());

app.use(
  cookieSession({
    signed: false, //This means that the cookie will not be signed
    secure: process.env.NODE_ENV !== 'test', //If environment is 'test' ---> secure = false otherwise secure :true
  })
);
//This middleware checks the whether user is logged in and inspects their JWT token
//After cookieSession this should be checked
app.use(currentUser);

//Routes from the route folder
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);

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
