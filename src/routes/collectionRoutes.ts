import { isAdmin } from "../middleware/isAdmin";
import { isAuthenticated } from "../middleware/isAuthenticate";
import { isCustomer } from "../middleware/isCustomer";

const express = require("express");
const router = express.Router();
const {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  collectionsOfUser,
  getWeeklyUserRevenueTotal,
  getLast30DaysCollectionData,
  getLast7DaysCollectionData,
  getCustomerStatistics,
  getCustomerCollection,
  dayCollection,
  dayCollectionTotal,
  weeklyCollection,
  weeklyCollectionTotal,
  weeklyEachDayCollectionTotal,
  monthlyCollection,
  monthlyRevenueTotal,
  last30DaysCollectionTotal,
  allCollection,
  monthlyUserRevenueTotal,
  getdailyUserRevenueTotal,
  getDailyUserCollections,
  getCustomerMonthlyArray,
  getCustomerWeeklyArray
} = require("../controllers/collectionController");

router.post("/createCollection", createCollection);
router.get("/collections", getCollections);
router.get("/collections/:id", getCollectionById);
router.put("/collections/:id", updateCollection);
router.delete("/collections/:id", deleteCollection);

//for admin
router.get("/dayCollection", isAdmin, dayCollection);
router.get("/dayCollectionTotal", isAdmin, dayCollectionTotal);
router.get("/weeklyCollection", isAdmin, weeklyCollection);
router.get("/weeklyCollectionTotal", isAdmin, weeklyCollectionTotal);
router.get("/weeklyEachDayCollectionTotal", weeklyEachDayCollectionTotal);
router.get("/monthlyCollection", isAdmin, monthlyCollection);
router.get("/monthlyRevenueTotal", isAdmin, monthlyRevenueTotal);
router.get("/monthlyEachDayCollectionTotal", last30DaysCollectionTotal);
router.get("/allCollection", isAdmin, allCollection);

// for user
router.get("/collectionsOfUser", isAuthenticated, collectionsOfUser);
//to get total monthly revenue total of current user
router.get("/getmonthlyUserRevenueTotal",isAuthenticated,monthlyUserRevenueTotal);
//to get total weekly revenue total of current user
router.get("/getWeeklyUserRevenueTotal", isAuthenticated,getWeeklyUserRevenueTotal);
//to get total daily revenue total of current user
router.get("/getdailyUserRevenueTotal",isAuthenticated,getdailyUserRevenueTotal);
router.get("/getDailyUserCollections",isAuthenticated,getDailyUserCollections);
router.get("/getLast30DaysCollectionData",isAuthenticated,getLast30DaysCollectionData);
router.get("/getLast7DaysCollectionData",isAuthenticated,getLast7DaysCollectionData);

//for custommers
router.get("/getCustomerStatistics", isCustomer, getCustomerStatistics);
router.get("/getCustomerCollection", isCustomer, getCustomerCollection);
router.get("/getCustomerMonthlyArray", isCustomer, getCustomerMonthlyArray);
router.get("/getCustomerWeeklyArray", isCustomer, getCustomerWeeklyArray);



module.exports = router;
