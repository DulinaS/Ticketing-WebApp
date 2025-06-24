import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;
  //This is the status code that will be sent in the response

  constructor(public errors: ValidationError[]) {
    super();

    //Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((error) => {
      if (error.type === 'field') {
        return {
          message: error.msg,
          field: error.path,
        };
      }
      return { message: error.msg };
    });
  }
}
