//This is a General Error class for bad requests in the application
import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
  statusCode = 400; //HTTP status code for Bad Request

  constructor(public message: string) {
    super(); //Call the parent class constructor with the message
    Object.setPrototypeOf(this, BadRequestError.prototype); //Set the prototype explicitly to maintain the correct prototype chain
  }

  serializeErrors() {
    return [{ message: this.message }]; //Return an array of error objects with the message
  }
}
