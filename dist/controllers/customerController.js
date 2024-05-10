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
exports.deleteCustomer = exports.getAllCustomer = exports.currentCustomer = exports.loginCustomer = exports.addCustomer = exports.customerHomepage = void 0;
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const adminmodel = require("../models/adminModel");
const UserModel = require("../models/userModels");
const customerModel = require("../models/customerModel");
const errorHandler_1 = require("../utils/errorHandler");
const sendToken_1 = require("../utils/sendToken");
exports.customerHomepage = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: " Admin homepage" });
}));
exports.addCustomer = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield customerModel(req.body).save();
    res.json({ customer: customer });
}));
exports.loginCustomer = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield customerModel.findOne({ email: req.body.email });
    if (!customer)
        return next(new errorHandler_1.errorHandler("User Not Found", 404));
    const isMatch = customer.compareCustomerPassword(req.body.password);
    if (!isMatch)
        return next(new errorHandler_1.errorHandler("Wrong Crediendials", 404));
    (0, sendToken_1.sendtoken)(customer, 201, res);
}));
exports.currentCustomer = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield customerModel.findOne({ _id: req.customerId });
    if (!customer)
        return next(new errorHandler_1.errorHandler("User Not Found", 404));
    (0, sendToken_1.sendtoken)(customer, 201, res);
}));
exports.getAllCustomer = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield customerModel.find({});
    res.json({ customers: customer });
}));
exports.deleteCustomer = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield customerModel.findOne({ _id: req.params.id });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        yield customerModel.deleteOne({ _id: req.params.id });
        res.json({ message: "Customer deleted", customer });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
