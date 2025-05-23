import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

//Router is a mini express application
//What this does is create a new router object that can be used to define routes
const router = express.Router();

router.post(
  '/api/users/signin',
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
      return res.status(400).send(errors.array());
    }

    const { email, password } = req.body; //We get the email and password from the request body
    console.log('Creating a user...');

    res.send({});
  }
);

export { router as signInRouter };
//This is a named export, so we can import it in the index.ts file
