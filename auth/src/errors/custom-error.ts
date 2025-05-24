export abstract class CustomError extends Error {
  abstract statusCode: number;
  //This is the status code that will be sent in the response

  constructor() {
    super();

    //Only because we are extending a built in class
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  //This returns an array of errors that will be sent in the response
  //Array will contain objects with a message and an optional field
  abstract serializeErrors(): { message: string; field?: string }[];
  //This method will be implemented by the subclasses to return the errors
}
