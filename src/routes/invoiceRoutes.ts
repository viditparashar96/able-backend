import { isAdmin } from "../middleware/isAdmin";
import { isAuthenticated } from "../middleware/isAuthenticate";

const express = require("express");
const router = express.Router();
const {
  invoiceHomepage,
  createinvoiceAdmin,
  getinvoiceAdmin,
  deleteinvoiceAdmin,
  singleinvoiceAdmin,
  updateInvoiceAdmin,
  createinvoiceUser,
  getInvoicesUser,
  deleteInvoiceUser,
  singleinvoiceUser,
  updateInvoiceUser
} = require("../controllers/invoiceController");

router.get("/", invoiceHomepage);
router.post("/create_invoiceAdmin", isAdmin, createinvoiceAdmin);
router.get("/get_invoiceAdmin", getinvoiceAdmin);
router.post("/single_invoiceAdmin", isAdmin, singleinvoiceAdmin);
router.post("/delete_invoiceAdmin", isAdmin, deleteinvoiceAdmin);
router.post("/invoiceAdminupdate", updateInvoiceAdmin);

//user routes
//get invoices of users
router.get("/getInvoicesUser", isAuthenticated, getInvoicesUser);
router.post("/createInvoiceUser", isAuthenticated, createinvoiceUser);
router.post("/deleteInvoiceUser", isAuthenticated, deleteInvoiceUser);
router.post("/singleInvoiceAdmin", isAuthenticated, singleinvoiceUser);
router.post("/invoiceUserUpdate", updateInvoiceUser);


module.exports = router;
