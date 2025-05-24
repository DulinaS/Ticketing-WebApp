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
    const formattedErrors = err.errors.map((error) => {
      if (error.type === 'field') {
        return {
          message: error.msg,
          field: error.path,
        };
      }
    });
    return res.status(400).send({ errors: formattedErrors });
  }
  if (err instanceof DatabaseConnectionError) {
    return res.status(500).send({ errors: [{ message: err.reason }] });
  }

  res.status(400).send({
    errors: [{ message: 'Something went wrong' }],
  });
};
