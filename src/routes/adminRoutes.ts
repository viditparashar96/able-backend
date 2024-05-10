const express = require("express");
const router = express.Router();
const {
  adminHomepage,
  loginAdmin,
  signupAdmin,
  signoutAdmin,
  currentAdmin,
  createUser,
  finduserbyarea,
  finduserbyname,
  dayCollection,
  dayCollectionTotal,
  weeklyCollection,
  monthlyCollection,
  allCollection,
  weeklyCollectionTotal,
  monthlyRevenueTotal,
  weeklyEachDayCollectionTotal,
  last30DaysCollectionTotal,
  updateAdmin,
  allUser,
  deleteUser
} = require("../controllers/adminController");
import { isAuthenticated } from "../middleware/isAuthenticate";
import { isAdmin } from "../middleware/isAdmin";

// admin routes
router.get("/", adminHomepage);
router.post("/login", loginAdmin);
router.post("/signup", signupAdmin);
router.get("/signout", isAdmin, signoutAdmin);
router.get("/currentAdmin", isAdmin, currentAdmin);
router.patch("/updateAdmins/:adminId", isAdmin, updateAdmin);
router.post("/createUser", isAdmin, createUser);
router.get("/finduserbyarea", isAdmin, finduserbyarea);
router.get("/finduserbyname", isAdmin, finduserbyname);
router.get("/allUser", isAdmin, allUser);
router.get("/deleteUser/:userId", isAdmin, deleteUser);






module.exports = router;
