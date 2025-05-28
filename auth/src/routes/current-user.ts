import express from 'express';
import jwt from 'jsonwebtoken';

//Router is a mini express application
//What this does is create a new router object that can be used to define routes
const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  //Checks if there's no JWT stored in the session
  //This means the user is not signed in or the session has expired.
  if (!req.session?.jwt) {
    return res.send({ currentUser: null });
  }
  //Extract data from JWT
  //extracts the current logged-in user's information from the JWT stored in the session cookie.
  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
    res.send({ currentUser: payload });
  } catch (err) {
    res.send({ currentUser: null });
  }
});

export { router as currentUserRouter };
//This is a named export, so we can import it in the index.ts file
