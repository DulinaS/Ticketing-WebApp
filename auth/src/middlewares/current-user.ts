import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

//What data has in payload
interface UserPayload {
  id: string;
  email: string;
}

//define a new type of currentUser and set its type to UserPayload
//Modify exsisting interface
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

//This extracts the JWT payload and set it into current user data
//This is done only if the user LOGGED IN
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // if User not logged in
  if (!req.session?.jwt) {
    return next(); //Go to next middleware if user isn't logged in
  }
  try {
    //Extract data from incoming request
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    //Set it to current user
    req.currentUser = payload;
  } catch (err) {}

  next();
};
