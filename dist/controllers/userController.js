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
exports.updateUser = exports.Statistics = exports.addMoneyCollection = exports.currentUser = exports.signoutUser = exports.loginUser = exports.userHomepage = void 0;
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const adminmodel = require("../models/adminModel");
const UserModel = require("../models/userModels");
const errorHandler_1 = require("../utils/errorHandler");
const sendToken_1 = require("../utils/sendToken");
const collectionModel = require("../models/collectionModel");
const customerModel = require("../models/customerModel");
const { CompareUserPassword } = require("../models/userModels");
exports.userHomepage = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: "homepage" });
}));
exports.loginUser = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield UserModel.findOne({ email: req.body.email });
    const isMatch = user.CompareUserPassword(req.body.password);
    console.log(isMatch);
    if (!isMatch)
        return next(new errorHandler_1.errorHandler("wrong crediendials", 404));
    (0, sendToken_1.sendtoken)(user, 201, res);
}));
exports.signoutUser = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    res.json({ message: "Signed out" });
}));
exports.currentUser = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const currentUser = yield ((_a = UserModel.findOne({ _id: req.Userid })) === null || _a === void 0 ? void 0 : _a.populate("collection"));
    res.json({
        message: "user found",
        user: currentUser,
    });
}));
exports.addMoneyCollection = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const todayDay = daysOfWeek[dayOfWeek];
    const todayDate = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
    const user = yield UserModel.findOne({ _id: req.Userid }).populate("revenue");
    const collectionmodel = yield new collectionModel({
        collectedBy: req.Userid,
        moneyCollectionDate: todayDate,
        moneyCollectionDay: todayDay,
        moneyCollection: req.body.moneyCollected,
    }).save();
    user.revenue.push(collectionmodel._id);
    yield user.save();
    res.json({ user: user });
}));
exports.Statistics = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Get logged-in user's ID
    const userId = req.Userid;
    // Get current date
    const currentDate = new Date();
    // Calculate start and end dates for the current week
    const startDateOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    const endDateOfWeek = new Date(currentDate.setDate(currentDate.getDate() + 6));
    // Calculate start and end dates for the current month
    const startDateOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDateOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    // Aggregate queries
    const [totalCollection, weeklyCollection, monthlyCollection, totalCustomers, totalInvoices,] = yield Promise.all([
        // Total collection till date of the logged-in user
        collectionModel.aggregate([
            {
                $match: { collectedBy: userId },
            },
            {
                $group: {
                    _id: null,
                    totalCollection: { $sum: "$moneyCollection" },
                },
            },
        ]),
        // Weekly collection of the current user
        collectionModel.aggregate([
            {
                $match: {
                    collectedBy: userId,
                    moneyCollectionDate: {
                        $gte: startDateOfWeek.toISOString(),
                        $lte: endDateOfWeek.toISOString(),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    weeklyCollection: { $sum: "$moneyCollection" },
                },
            },
        ]),
        // Monthly collection of the user till date
        collectionModel.aggregate([
            {
                $match: {
                    collectedBy: userId,
                    moneyCollectionDate: {
                        $gte: startDateOfMonth.toISOString(),
                        $lte: endDateOfMonth.toISOString(),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    monthlyCollection: { $sum: "$moneyCollection" },
                },
            },
        ]),
        // Total customers registered till date
        customerModel.countDocuments({}),
        // Total invoices of the user
        UserModel.aggregate([
            {
                $match: { _id: userId },
            },
            {
                $project: {
                    totalInvoices: { $size: "$invoices" },
                },
            },
        ]),
    ]);
    // Send response
    res.json({
        totalCollection: totalCollection.length > 0 ? totalCollection[0].totalCollection : 0,
        weeklyCollection: weeklyCollection.length > 0 ? weeklyCollection[0].weeklyCollection : 0,
        monthlyCollection: monthlyCollection.length > 0
            ? monthlyCollection[0].monthlyCollection
            : 0,
        totalCustomers,
        totalInvoices: totalInvoices.length > 0 ? totalInvoices[0].totalInvoices : 0,
    });
}));
exports.updateUser = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, email, dob, contact, address, country, state, zip_code, } = req.body;
        // Find the user by email
        let user = yield UserModel.findOne({ email });
        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Update user fields
        user.full_name = fullname;
        user.dob = dob;
        user.mobile_number = contact;
        user.fullAddress = address;
        user.country = country;
        user.state = state;
        user.zip_code = zip_code;
        // Save updated user
        yield user.save();
        // Send response
        res.json({ message: "User updated", user });
    }
    catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: error });
    }
}));
