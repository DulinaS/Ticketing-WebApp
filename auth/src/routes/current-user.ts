import express from 'express';
import jwt from 'jsonwebtoken';
import { currentUser } from '../middlewares/current-user';

//Router is a mini express application
//What this does is create a new router object that can be used to define routes
const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });

  //Now the middleware does all
  //Checks if user logged out then sends a current user null
  //it extract payload and set it to user
});

export { router as currentUserRouter };
//This is a named export, so we can import it in the index.ts file
