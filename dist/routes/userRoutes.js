"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const { userHomepage, loginUser, signoutUser, currentUser, addMoneyCollection, Statistics, updateUser, } = require("../controllers/userController");
const isAuthenticate_1 = require("../middleware/isAuthenticate");
router.get("/", userHomepage);
router.post("/login", loginUser);
router.get("/signout", isAuthenticate_1.isAuthenticated, signoutUser);
router.get("/currentUser", isAuthenticate_1.isAuthenticated, currentUser);
router.post("/addMoneyCollection", isAuthenticate_1.isAuthenticated, addMoneyCollection);
router.get("/getStatistics", isAuthenticate_1.isAuthenticated, Statistics);
router.post("/updateUser", isAuthenticate_1.isAuthenticated, updateUser);
module.exports = router;
