import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/not-authorized-error';

//Reject access if user not logged in
//We should check whether there is a current user.
//This middleware should be run after currentUser middleware
//currentUser middleware sets the data to req.currentUser
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //If user is not logged in/ doesn't have a current user
  if (!req.currentUser) {
    throw new NotAuthorizedError(); //Custom Error for un-authorized access
  }

  //Go to the next middleware/Actual Route Hopefully
  next();
};
