const jwt = require("jsonwebtoken");
import { errorHandler } from "../utils/errorHandler";
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");

export const isAuthenticated = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    // const { token } = req.cookies;
    const ServiceToken = req.headers.authorization;
    if (!ServiceToken) return next(new errorHandler("please login", 404));

    const { id } = jwt.verify(ServiceToken, process.env.JWT_SECRET);
    req.Userid = id;
    // res.json({ userServiceToken, id });
    next();
  }
);
