import express from 'express';

//Router is a mini express application
//What this does is create a new router object that can be used to define routes
const router = express.Router();

//For signout we're going to tell to delete all info inside the COOKIE
//That means JWT will be deleted
router.post('/api/users/signout', (req, res) => {});

export { router as signOutRouter };
//This is a named export, so we can import it in the index.ts file
