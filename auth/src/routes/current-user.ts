import express from 'express';
import jwt from 'jsonwebtoken';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';

//Router is a mini express application
//What this does is create a new router object that can be used to define routes
const router = express.Router();

router.get('/api/users/currentuser', currentUser, requireAuth, (req, res) => {
  res.send({ currentUser: req.currentUser || null });

  //Now the middleware does all
  //Checks if user logged out then sends a current user null
  //it extract payload and set it to user

  //After that goes to requireAuth Middleware to check that user is successfully logged in
  //and Act as currentUser.
  //If not (req.currentUser == null) access isn't granted for the routes throws a error
});

export { router as currentUserRouter };
//This is a named export, so we can import it in the index.ts file
