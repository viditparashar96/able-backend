"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isAdmin_1 = require("../middleware/isAdmin");
const isAuthenticate_1 = require("../middleware/isAuthenticate");
const isCustomer_1 = require("../middleware/isCustomer");
const express = require("express");
const router = express.Router();
const { createCollection, getCollections, getCollectionById, updateCollection, deleteCollection, collectionsOfUser, getWeeklyUserRevenueTotal, getLast30DaysCollectionData, getLast7DaysCollectionData, getCustomerStatistics, getCustomerCollection, dayCollection, dayCollectionTotal, weeklyCollection, weeklyCollectionTotal, weeklyEachDayCollectionTotal, monthlyCollection, monthlyRevenueTotal, last30DaysCollectionTotal, allCollection, monthlyUserRevenueTotal, getdailyUserRevenueTotal, getDailyUserCollections, getCustomerMonthlyArray, getCustomerWeeklyArray } = require("../controllers/collectionController");
router.post("/createCollection", createCollection);
router.get("/collections", getCollections);
router.get("/collections/:id", getCollectionById);
router.put("/collections/:id", updateCollection);
router.delete("/collections/:id", deleteCollection);
//for admin
router.get("/dayCollection", isAdmin_1.isAdmin, dayCollection);
router.get("/dayCollectionTotal", isAdmin_1.isAdmin, dayCollectionTotal);
router.get("/weeklyCollection", isAdmin_1.isAdmin, weeklyCollection);
router.get("/weeklyCollectionTotal", isAdmin_1.isAdmin, weeklyCollectionTotal);
router.get("/weeklyEachDayCollectionTotal", weeklyEachDayCollectionTotal);
router.get("/monthlyCollection", isAdmin_1.isAdmin, monthlyCollection);
router.get("/monthlyRevenueTotal", isAdmin_1.isAdmin, monthlyRevenueTotal);
router.get("/monthlyEachDayCollectionTotal", last30DaysCollectionTotal);
router.get("/allCollection", isAdmin_1.isAdmin, allCollection);
// for user
router.get("/collectionsOfUser", isAuthenticate_1.isAuthenticated, collectionsOfUser);
//to get total monthly revenue total of current user
router.get("/getmonthlyUserRevenueTotal", isAuthenticate_1.isAuthenticated, monthlyUserRevenueTotal);
//to get total weekly revenue total of current user
router.get("/getWeeklyUserRevenueTotal", isAuthenticate_1.isAuthenticated, getWeeklyUserRevenueTotal);
//to get total daily revenue total of current user
router.get("/getdailyUserRevenueTotal", isAuthenticate_1.isAuthenticated, getdailyUserRevenueTotal);
router.get("/getDailyUserCollections", isAuthenticate_1.isAuthenticated, getDailyUserCollections);
router.get("/getLast30DaysCollectionData", isAuthenticate_1.isAuthenticated, getLast30DaysCollectionData);
router.get("/getLast7DaysCollectionData", isAuthenticate_1.isAuthenticated, getLast7DaysCollectionData);
//for custommers
router.get("/getCustomerStatistics", isCustomer_1.isCustomer, getCustomerStatistics);
router.get("/getCustomerCollection", isCustomer_1.isCustomer, getCustomerCollection);
router.get("/getCustomerMonthlyArray", isCustomer_1.isCustomer, getCustomerMonthlyArray);
router.get("/getCustomerWeeklyArray", isCustomer_1.isCustomer, getCustomerWeeklyArray);
module.exports = router;
