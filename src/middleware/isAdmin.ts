const jwt = require("jsonwebtoken");
import { errorHandler } from "../utils/errorHandler";
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const adminModel = require("../models/adminModel");

export const isAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const serviceToken = req.headers.authorization;

    if (!serviceToken)
      return next(new errorHandler("please login as a admin", 404));

    const { id } = jwt.verify(serviceToken, process.env.JWT_SECRET);
    req.id = id;

    const admin = await adminModel.findOne({ _id: id });

    if (admin.isAdmin) {
      return next();
    } else {
      next(new errorHandler("You are not a admin", 404));
    }
  }
);
