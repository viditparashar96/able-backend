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
exports.isAdmin = void 0;
const jwt = require("jsonwebtoken");
const errorHandler_1 = require("../utils/errorHandler");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const adminModel = require("../models/adminModel");
exports.isAdmin = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceToken = req.headers.authorization;
    if (!serviceToken)
        return next(new errorHandler_1.errorHandler("please login as a admin", 404));
    const { id } = jwt.verify(serviceToken, process.env.JWT_SECRET);
    req.id = id;
    const admin = yield adminModel.findOne({ _id: id });
    if (admin.isAdmin) {
        return next();
    }
    else {
        next(new errorHandler_1.errorHandler("You are not a admin", 404));
    }
}));
