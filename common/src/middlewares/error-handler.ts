import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../errors/custom-error';

//Is this a sync or async middleware?
//This is a sync middleware, so we don't need to use async/await
//If use async/await, we will have to use express-async-errors package in the index.ts file for it to work
//and handle async errors in the application when we use async/await in the routes
//This is a middleware that will handle any errors that occur in the application
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Check the type of error
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  //Shows the error
  console.error(err);

  //If above doesnt solve fowards to this
  res.status(400).send({
    errors: [{ message: 'Something went wrong' }],
  });
};
