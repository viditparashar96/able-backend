export class errorHandler extends Error {
 public statusCode: any;
  constructor(public message: any, statusCode: any) {
   
    super(message);
    this.message = message
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
