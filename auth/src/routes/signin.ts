import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';

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
  //This is a middleware that will validate the request body
  validateRequest,
  (req: Request, res: Response) => {}
);

export { router as signInRouter };
//This is a named export, so we can import it in the index.ts file
