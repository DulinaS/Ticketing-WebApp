import { NextFunction, Request, Response } from 'express';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

//This is a middleware that will handle any errors that occur in the application
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Check the type of error
  if (err instanceof RequestValidationError) {
    console.log('Handling Request Validation Error...');
  }
  if (err instanceof DatabaseConnectionError) {
    console.log('Handling Database Connection Error...');
  }

  res.status(400).send({
    message: err.message,
  });
};
