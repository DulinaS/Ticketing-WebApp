import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';

//Router is a mini express application
//What this does is create a new router object that can be used to define routes
const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req); //We use the validationResult function to get the errors from the request

    //If there are errors, we send a 400 response with the errors
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array()); //We throw an error if there are errors
    }
  }
);

export { router as signInRouter };
//This is a named export, so we can import it in the index.ts file
