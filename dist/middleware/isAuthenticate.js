"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jwt = require("jsonwebtoken");
const errorHandler_1 = require("../utils/errorHandler");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
exports.isAuthenticated = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const { token } = req.cookies;
    const ServiceToken = req.headers.authorization;
    if (!ServiceToken)
        return next(new errorHandler_1.errorHandler("please login", 404));
    const { id } = jwt.verify(ServiceToken, process.env.JWT_SECRET);
    req.Userid = id;
    // res.json({ userServiceToken, id });
    next();
}));
