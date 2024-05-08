const express = require("express");
const router = express.Router();
const {
  userHomepage,
  loginUser,
  signoutUser,
  currentUser,
  addMoneyCollection,
  Statistics,
  updateUser,
} = require("../controllers/userController");
import { isAuthenticated } from "../middleware/isAuthenticate";

router.get("/", userHomepage);
router.post("/login", loginUser);
router.get("/signout", isAuthenticated, signoutUser);
router.get("/currentUser", isAuthenticated, currentUser);
router.post("/addMoneyCollection", isAuthenticated, addMoneyCollection);
router.get("/getStatistics", isAuthenticated, Statistics);
router.post("/updateUser", isAuthenticated, updateUser);



module.exports = router;
