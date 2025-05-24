export class DatabaseConnectionError extends Error {
  statusCode = 500;
  //This is the status code that will be sent in the response
  reason = 'Error connecting to the database';
  //This is the reason that will be sent in the response

  constructor() {
    super();

    //Only because we are extending a built in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
