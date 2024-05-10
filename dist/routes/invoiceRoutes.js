"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isAdmin_1 = require("../middleware/isAdmin");
const isAuthenticate_1 = require("../middleware/isAuthenticate");
const express = require("express");
const router = express.Router();
const { invoiceHomepage, createinvoiceAdmin, getinvoiceAdmin, deleteinvoiceAdmin, singleinvoiceAdmin, updateInvoiceAdmin, createinvoiceUser, getInvoicesUser, deleteInvoiceUser, singleinvoiceUser, updateInvoiceUser } = require("../controllers/invoiceController");
router.get("/", invoiceHomepage);
router.post("/create_invoiceAdmin", isAdmin_1.isAdmin, createinvoiceAdmin);
router.get("/get_invoiceAdmin", getinvoiceAdmin);
router.post("/single_invoiceAdmin", isAdmin_1.isAdmin, singleinvoiceAdmin);
router.post("/delete_invoiceAdmin", isAdmin_1.isAdmin, deleteinvoiceAdmin);
router.post("/invoiceAdminupdate", updateInvoiceAdmin);
//user routes
//get invoices of users
router.get("/getInvoicesUser", isAuthenticate_1.isAuthenticated, getInvoicesUser);
router.post("/createInvoiceUser", isAuthenticate_1.isAuthenticated, createinvoiceUser);
router.post("/deleteInvoiceUser", isAuthenticate_1.isAuthenticated, deleteInvoiceUser);
router.post("/singleInvoiceAdmin", isAuthenticate_1.isAuthenticated, singleinvoiceUser);
router.post("/invoiceUserUpdate", updateInvoiceUser);
module.exports = router;
