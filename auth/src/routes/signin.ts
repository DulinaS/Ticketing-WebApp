import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password'; //Importing the Password service to handle password hashing and comparison
import jwt from 'jsonwebtoken';

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
  async (req: Request, res: Response) => {
    //After validation, we can handle the user sign-in logic
    const { email, password } = req.body;

    //Before creating a user, we should check if the user already exists using email
    //This retrieves the user from the database based on the email
    const exisitingUser = await User.findOne({ email });

    //If the user does not exist, we throw an error
    if (!exisitingUser) {
      throw new BadRequestError('Invalid credentials'); //We throw an error if the user does not exist
    }
    //If the user exists, we check if the password is correct
    const passwordsMatch = await Password.compare(
      exisitingUser.password,
      password
    );

    //If the password does not match, we throw an error
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials'); //We throw an error if the password does not match
    }
    //If the password matches, we create a JWT token
    const userJwt = jwt.sign(
      {
        id: exisitingUser.id,
        email: exisitingUser.email,
      },
      process.env.JWT_KEY! //We use the JWT_KEY from the environment variables, the exclamation mark tells TypeScript that this will not be undefined
    );

    // Put JWT inside the cookie session objecr
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(exisitingUser); //200 is the status code for request successful
  }
);

export { router as signInRouter };
//This is a named export, so we can import it in the index.ts file
