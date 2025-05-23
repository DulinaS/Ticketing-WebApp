import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req); //We use the validationResult function to get the errors from the request

    //If there are errors, we send a 400 response with the errors
    if (!errors.isEmpty()) {
      //This will be picked up by the error handler middleware
      throw new RequestValidationError(errors.array()); //We throw an error if there are errors
    }

    console.log('Creating a user...');
    throw new DatabaseConnectionError(); //We throw an error if there are error

    res.send({});
  }
);

export { router as signUpRouter };
//This is a named export, so we can import it in the index.ts file
