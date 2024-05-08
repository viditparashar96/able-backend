export const generatedErrors = (err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500;

  // err handler for same email registration
  if (
    err.name === "Error" && err.message.includes("E11000 duplicate key error collection")
  ) {
    err.message = "Email already registered";
  }


  res.status(statusCode).json({
    errName: err.name,
    message: err.message,
    stack: err.stack,
  });
};
