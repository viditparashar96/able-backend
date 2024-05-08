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
  Statistics,
  getCollectionData,
  getLast7DaysCollectionData,
  getCustomerStatistics,
  getCustomerCollection
} = require("../controllers/collectionController");

router.post("/createCollection", createCollection);
router.get("/collections", getCollections);
router.get("/collections/:id", getCollectionById);
router.put("/collections/:id", updateCollection);
router.delete("/collections/:id", deleteCollection);

// for user
router.get("/collectionsOfUser", isAuthenticated, collectionsOfUser);
router.get("/getUserStatistics", isAuthenticated, Statistics);
router.get("/getCollectionData", isAuthenticated, getCollectionData);
router.get(
  "/getLast7DaysCollectionData",
  isAuthenticated,
  getLast7DaysCollectionData
);

//for custommers
router.get("/getCustomerStatistics", isCustomer, getCustomerStatistics);
router.get("/getCustomerCollection", isCustomer, getCustomerCollection);



module.exports = router;
