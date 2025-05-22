import express from "express";

//Router is a mini express application
//What this does is create a new router object that can be used to define routes
const router = express.Router();

router.post("/api/users/signin", (req, res) => {
  res.send("Signin");
  
});

export { router as signInRouter };
//This is a named export, so we can import it in the index.ts file