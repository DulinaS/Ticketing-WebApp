//Any time user goes to a route that doesn't exist, we want to return this error
import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  statusCode = 404;
  //This is the status code that will be sent in the response
  reason = 'Route not found';
  //This is the reason that will be sent in the response

  constructor() {
    //Why we are calling super here? Because we are extending a built in class
    super();

    //Only because we are extending a built in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
