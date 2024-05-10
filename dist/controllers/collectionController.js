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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerWeeklyArray = exports.getCustomerMonthlyArray = exports.allCollection = exports.monthlyRevenueTotal = exports.monthlyCollection = exports.weeklyCollectionTotal = exports.last30DaysCollectionTotal = exports.weeklyEachDayCollectionTotal = exports.weeklyCollection = exports.dayCollectionTotal = exports.dayCollection = exports.getLast7DaysCollectionData = exports.getDailyUserCollections = exports.getdailyUserRevenueTotal = exports.getLast30DaysCollectionData = exports.getWeeklyUserRevenueTotal = exports.monthlyUserRevenueTotal = exports.createCollection = void 0;
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const collectionModel = require("../models/collectionModel");
const userModel = require("../models/userModels");
const adminModel = require("../models/adminModel");
const customermodel = require("../models/customerModel");
const moment_1 = __importDefault(require("moment"));
const createCollection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { invoice_id, customerInfo, cashierInfo, date, amount, notes } = req.body;
        if (!cashierInfo || !cashierInfo.email) {
            return res.status(400).json({ error: "Cashier email is required" });
        }
        const { name, address, phone, email, _id } = customerInfo;
        const collection = new collectionModel({
            invoice_id,
            customerInfo: { name, address, phone, email },
            cashierInfo,
            date,
            amount,
            notes,
            customer_id: _id,
        });
        // Save the collection record to the database
        yield collection.save();
        const isUser = yield userModel.findOne({ email: cashierInfo.email });
        const isAdmin = yield adminModel.findOne({ email: cashierInfo.email });
        // Modify the user/admin model and collection accordingly
        if (isUser) {
            isUser.collection.push(collection._id);
            collection.ifcreatedByUser = isUser._id;
            yield isUser.save();
        }
        if (isAdmin) {
            isAdmin.collection.push(collection._id);
            collection.ifCreatedByAdmin = isAdmin._id;
            yield isAdmin.save();
        }
        yield collection.save();
        res
            .status(201)
            .json({ message: "Collection created successfully", collection });
    }
    catch (error) {
        console.error("Error creating collection:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.createCollection = createCollection;
exports.getCollections = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collections = yield collectionModel.find();
        res.json(collections);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
// Function to get a single collection record by ID
exports.getCollectionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection = yield collectionModel.findOne({
            invoice_id: req.params.id,
        });
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.json(collection);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
// Function to update a collection record by ID
exports.updateCollection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection = yield collectionModel.findOne({
            invoice_id: req.params.id,
        });
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        Object.assign(collection, req.body);
        yield collection.save();
        res.json(collection);
    }
    catch (error) {
        res.status(400).json({ message: error });
    }
});
exports.deleteCollection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection = yield collectionModel.findOneAndDelete({
            invoice_id: req.params.id,
        });
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        res.json({ message: "Collection deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting collection:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.collectionsOfUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collections = yield userModel
            .findOne({ _id: req.Userid })
            .populate("collection");
        res.json(collections.collection);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.monthlyUserRevenueTotal = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        const startDate = new Date(currentYear, currentMonth, 1); // First day of the current month
        const endDate = new Date(currentYear, currentMonth + 1, 1); // First day of the next month
        const foundCollections = yield collectionModel.find({
            userId: req.userId, // Assuming userId is a property in the collection model
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            },
        });
        let totalRevenue = 0;
        foundCollections.forEach((collection) => {
            totalRevenue += collection.amount;
        });
        res.json({
            TotalMonthlyUserRevenue: totalRevenue,
        });
    }
    catch (error) {
        res.json({ error });
    }
}));
exports.getWeeklyUserRevenueTotal = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); // End of today
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Start of 7 days ago
        const foundCollections = yield collectionModel.find({
            ifcreatedByUser: req.Userid, // Assuming userId is a property in the collection model
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            },
        });
        let totalRevenue = 0;
        foundCollections.forEach((collection) => {
            totalRevenue += collection.amount;
        });
        res.json({ TotalWeeklyUserRevenue: totalRevenue });
    }
    catch (error) {
        res.json({ error });
    }
}));
const getLast30DaysCollectionData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.Userid; // Assuming you're using JWT for authentication
        // Calculate the start date for 30 days ago
        const startDate = (0, moment_1.default)().subtract(30, "days").startOf("day");
        const dates = [];
        const totals = [];
        // Loop through each day of the last 30 days
        for (let i = 0; i < 31; i++) {
            // Changed loop to iterate over 31 days to include today
            const currentDate = (0, moment_1.default)(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database
            // Find collections for the current day and user
            const foundCollections = yield collectionModel.find({
                ifcreatedByUser: userId,
                date: currentDate,
            });
            // Calculate total money collected for the day
            let totalMoneyCollected = 0;
            foundCollections.forEach((collection) => {
                totalMoneyCollected += collection.amount;
            });
            // Push the formatted date and total to arrays
            dates.push(currentDate);
            totals.push(totalMoneyCollected);
        }
        const response = {
            date: dates,
            total: totals,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getLast30DaysCollectionData = getLast30DaysCollectionData;
exports.getdailyUserRevenueTotal = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const foundCollections = yield collectionModel.find({
            ifcreatedByUser: req.Userid, // Assuming userId is a property in the collection model
            createdAt: {
                $gte: today,
                $lt: tomorrow,
            },
        });
        let totalRevenue = 0;
        foundCollections.forEach((collection) => {
            totalRevenue += collection.amount;
        });
        res.json({ TotalDailyUserRevenue: totalRevenue });
    }
    catch (error) {
        res.json({ error });
    }
}));
exports.getDailyUserCollections = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find collection records related to the user ID
        const collections = yield collectionModel.find({
            $or: [
                { ifcreatedByUser: req.userId },
                { ifCreatedByAdmin: req.userId },
            ],
        });
        // Calculate total number of collections
        const totalCollections = collections.length;
        // Calculate total amount till date
        const totalAmount = collections.reduce((total, collection) => total + (collection.amount || 0), 0);
        // Send response with total collections and total amount
        res.json({
            totalCollections,
            totalAmount,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
const getLast7DaysCollectionData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.Userid; // Assuming you're using JWT for authentication
        // Calculate the start date for 7 days ago
        const startDate = (0, moment_1.default)().subtract(7, "days").startOf("day");
        const dates = [];
        const totals = [];
        // Loop through each day of the last 7 days
        for (let i = 0; i < 8; i++) {
            // Changed loop to iterate over 7 days to include today
            const currentDate = (0, moment_1.default)(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database
            // Find collections for the current day and user
            const foundCollections = yield collectionModel.find({
                ifcreatedByUser: userId,
                date: currentDate,
            });
            // Calculate total money collected for the day
            let totalMoneyCollected = 0;
            foundCollections.forEach((collection) => {
                totalMoneyCollected += collection.amount;
            });
            // Push the formatted date and total to arrays
            dates.push(currentDate);
            totals.push(totalMoneyCollected);
        }
        const response = {
            date: dates,
            total: totals,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getLast7DaysCollectionData = getLast7DaysCollectionData;
//admin
exports.dayCollection = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const todayDate = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
        const foundCollection = yield collectionModel.find({
            moneyCollectionDate: todayDate,
        });
        res.json({
            collection: foundCollection,
        });
    }
    catch (error) {
        req.json({ error });
    }
}));
exports.dayCollectionTotal = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const foundCollections = yield collectionModel.find({
            createdAt: {
                $gte: today,
                $lt: tomorrow,
            },
        });
        let totalMoneyCollected = 0;
        foundCollections.forEach((collection) => {
            totalMoneyCollected += collection.amount;
        });
        res.json({ TotalDayCollection: totalMoneyCollected });
    }
    catch (error) {
        res.json({ error });
    }
}));
exports.weeklyCollection = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        // Calculate the start date for the week (7 days ago)
        const startDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
        // Format start date as "dd/mm/yyyy"
        const startDateFormatted = startDate.getDate() +
            "/" +
            startDate.getMonth() +
            "/" +
            startDate.getFullYear();
        // Format today's date as "dd/mm/yyyy"
        const todayDate = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
        // Find collections within the last 7 days
        const foundCollection = yield collectionModel.find({
            moneyCollectionDate: {
                $gte: startDateFormatted, // Greater than or equal to start date
                $lte: todayDate, // Less than or equal to today's date
            },
        });
        res.json({
            collection: foundCollection,
        });
    }
    catch (error) {
        res.json({ error });
    }
}));
const weeklyEachDayCollectionTotal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startDate = (0, moment_1.default)().subtract(7, "days").startOf("day");
        const dates = [];
        const totals = [];
        // Loop through each day of the last 7 days
        for (let i = 0; i < 8; i++) {
            // Changed loop to iterate over 7 days to include today
            const currentDate = (0, moment_1.default)(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database
            // Find collections for the current day and user
            const foundCollections = yield collectionModel.find({
                date: currentDate,
            });
            // Calculate total money collected for the day
            let totalMoneyCollected = 0;
            foundCollections.forEach((collection) => {
                totalMoneyCollected += collection.amount;
            });
            // Push the formatted date and total to arrays
            dates.push(currentDate);
            totals.push(totalMoneyCollected);
        }
        const response = {
            date: dates,
            total: totals,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.weeklyEachDayCollectionTotal = weeklyEachDayCollectionTotal;
const last30DaysCollectionTotal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Calculate the start date for 30 days ago
        const startDate = (0, moment_1.default)().subtract(30, "days").startOf("day");
        const dates = [];
        const totals = [];
        // Loop through each day of the last 30 days
        for (let i = 0; i < 31; i++) {
            // Changed loop to iterate over 31 days to include today
            const currentDate = (0, moment_1.default)(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database
            // Find collections for the current day
            const foundCollections = yield collectionModel.find({
                date: currentDate,
            });
            // Calculate total money collected for the day
            let totalMoneyCollected = 0;
            foundCollections.forEach((collection) => {
                totalMoneyCollected += collection.amount;
            });
            // Push the formatted date and total to arrays
            dates.push(currentDate);
            totals.push(totalMoneyCollected);
        }
        const response = {
            date: dates,
            total: totals,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.last30DaysCollectionTotal = last30DaysCollectionTotal;
exports.weeklyCollectionTotal = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); // End of today
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Start of 7 days ago
        const foundCollections = yield collectionModel.find({
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            },
        });
        let totalMoneyCollected = 0;
        foundCollections.forEach((collection) => {
            totalMoneyCollected += collection.amount;
        });
        res.json({ TotalWeeklyCollection: totalMoneyCollected });
    }
    catch (error) {
        res.json({ error });
    }
}));
exports.monthlyCollection = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        // Calculate the start date for the month (1st day of the current month)
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        // Format start date as "dd/mm/yyyy"
        const startDateFormatted = startDate.getDate() +
            "/" +
            startDate.getMonth() +
            "/" +
            startDate.getFullYear();
        // Format today's date as "dd/mm/yyyy"
        const todayDate = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
        // Find collections within the current month
        const foundCollection = yield collectionModel.find({
            moneyCollectionDate: {
                $gte: startDateFormatted, // Greater than or equal to start date
                $lte: todayDate, // Less than or equal to today's date
            },
        });
        res.json({
            collection: foundCollection,
        });
    }
    catch (error) {
        res.json({ error });
    }
}));
exports.monthlyRevenueTotal = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        const startDate = new Date(currentYear, currentMonth, 1); // First day of the current month
        const endDate = new Date(currentYear, currentMonth + 1, 1); // First day of the next month
        const foundCollections = yield collectionModel.find({
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            },
        });
        let totalRevenue = 0;
        foundCollections.forEach((collection) => {
            totalRevenue += collection.amount;
        });
        const totalDepositor = yield userModel.find({});
        const totalCustomer = yield customermodel.find({});
        res.json({
            TotalMonthlyRevenue: totalRevenue,
            totalDepositor: totalDepositor.length,
            totalCustomer: totalCustomer.length,
        });
    }
    catch (error) {
        res.json({ error });
    }
}));
exports.allCollection = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find collections within the current month
        const foundCollection = yield collectionModel.find({});
        res.json({
            collection: foundCollection,
        });
    }
    catch (error) {
        res.json({ error });
    }
}));
//customer
exports.getCustomerStatistics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch collections for the customer
        const collections = yield collectionModel.find({
            customer_id: req.customerId,
        });
        // Calculate dates for the last 30 days, last 7 days, and today
        const today = (0, moment_1.default)();
        const last30Days = (0, moment_1.default)().subtract(30, "days");
        const last7Days = (0, moment_1.default)().subtract(7, "days");
        // Filter collections for the last 30 days
        const collectionsLast30Days = collections.filter((collection) => (0, moment_1.default)(collection.date, "MM/DD/YYYY").isBetween(last30Days, today));
        // Filter collections for the last 7 days
        const collectionsLast7Days = collections.filter((collection) => (0, moment_1.default)(collection.date, "MM/DD/YYYY").isBetween(last7Days, today));
        // Filter collections for today
        const collectionsToday = collections.filter((collection) => (0, moment_1.default)(collection.date, "MM/DD/YYYY").isSame(today, "day"));
        // Calculate total amount for the last 30 days
        const totalAmountLast30Days = collectionsLast30Days.reduce((total, collection) => {
            return total + collection.amount;
        }, 0);
        // Calculate total amount deposited for the last 7 days
        const totalAmountLast7Days = collectionsLast7Days.reduce((total, collection) => {
            return total + collection.amount;
        }, 0);
        // Calculate total amount deposited today
        const totalAmountToday = collectionsToday.reduce((total, collection) => {
            return total + collection.amount;
        }, 0);
        // Prepare response object
        const statistics = {
            totalAmountLast30Days,
            totalAmountLast7Days,
            totalAmountToday,
        };
        res.json(statistics);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
exports.getCustomerCollection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collections = yield collectionModel.find({
            customer_id: req.customerId,
        });
        res.json(collections);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
const getCustomerMonthlyArray = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerId = req.customerId; // Assuming customer id is obtained from request
        // Calculate the start date for 30 days ago
        const startDate = (0, moment_1.default)().subtract(30, "days").startOf("day");
        const dates = [];
        const totals = [];
        // Loop through each day of the last 30 days
        for (let i = 0; i < 31; i++) {
            // Changed loop to iterate over 31 days to include today
            const currentDate = (0, moment_1.default)(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database
            // Find collections for the current day and customer
            const foundCollections = yield collectionModel.find({
                customer_id: customerId,
                date: currentDate,
            });
            // Calculate total money collected for the day
            let totalMoneyCollected = 0;
            foundCollections.forEach((collection) => {
                totalMoneyCollected += collection.amount;
            });
            // Push the formatted date and total to arrays
            dates.push(currentDate);
            totals.push(totalMoneyCollected);
        }
        const response = {
            date: dates,
            total: totals,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getCustomerMonthlyArray = getCustomerMonthlyArray;
const getCustomerWeeklyArray = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerId = req.customerId; // Assuming customer id is obtained from request
        const startDate = (0, moment_1.default)().subtract(7, "days").startOf("day");
        const dates = [];
        const totals = [];
        // Loop through each day of the last 7 days
        for (let i = 0; i < 8; i++) {
            // Changed loop to iterate over 7 days to include today
            const currentDate = (0, moment_1.default)(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database
            // Find collections for the current day and customer
            const foundCollections = yield collectionModel.find({
                customer_id: customerId,
                date: currentDate,
            });
            // Calculate total money collected for the day
            let totalMoneyCollected = 0;
            foundCollections.forEach((collection) => {
                totalMoneyCollected += collection.amount;
            });
            // Push the formatted date and total to arrays
            dates.push(currentDate);
            totals.push(totalMoneyCollected);
        }
        const response = {
            date: dates,
            total: totals,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getCustomerWeeklyArray = getCustomerWeeklyArray;
