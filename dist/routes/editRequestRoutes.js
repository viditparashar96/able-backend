"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isAdmin_1 = require("../middleware/isAdmin");
const express = require("express");
const router = express.Router();
const { createEditRequest, getAllEditRequests, getEditReqListAdmin, deleteEditRequest, } = require("../controllers/editRequest");
const { isAuthenticated } = require("../middleware/isAuthenticate");
//user routes
router.post("/createEditRequest", isAuthenticated, createEditRequest); // Route to create a new edit request
router.get("/getEditReqList", isAuthenticated, getAllEditRequests); // Route to get all edit requests
router.delete("/:id", isAuthenticated, deleteEditRequest); // Route to delete a specific edit request by ID
//admin
router.get("/getEditReqListAdmin", isAdmin_1.isAdmin, getEditReqListAdmin); // Route to get all edit requests
router.post("/AcceptEditAdmin", isAdmin_1.isAdmin, getEditReqListAdmin); // Route to get all edit requests
module.exports = router;
