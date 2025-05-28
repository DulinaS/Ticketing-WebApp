import { Request, Response, NextFunction } from 'express';
//These are types we will use to define the request, response and next function in the middleware
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';

//This is a middleware that will validate the request body
//It will check if the request body has the required fields and if they are valid

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req); //We use the validationResult function to get the errors from the request

  //If there are errors, we send a 400 response with the errors
  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array()); //We throw an error if there are errors
  }

  next(); //If there are no errors, we call the next middleware
};
