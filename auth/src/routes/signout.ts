import express from 'express';
import jwt from 'jsonwebtoken';

//Router is a mini express application
//What this does is create a new router object that can be used to define routes
//To delete session --> req.session= null
const router = express.Router();

//For signout we're going to tell to delete all info inside the COOKIE
//That means JWT will be deleted
router.post('/api/users/signout', (req, res) => {
  req.session = null;

  res.send({});
});

export { router as signOutRouter };
//This is a named export, so we can import it in the index.ts file
