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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceUser = exports.singleinvoiceUser = exports.deleteInvoiceUser = exports.createinvoiceUser = exports.getInvoicesUser = exports.updateInvoiceAdmin = exports.singleinvoiceAdmin = exports.deleteinvoiceAdmin = exports.getinvoiceAdmin = exports.createinvoiceAdmin = exports.invoiceHomepage = void 0;
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const adminmodel = require("../models/adminModel");
const UserModel = require("../models/userModels");
const customerModel = require("../models/customerModel");
const invoiceModel = require("../models/invoiceModel");
exports.invoiceHomepage = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ message: " Admin homepage" });
}));
exports.createinvoiceAdmin = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const { invoice_id, cashierInfo, customerInfo, invoice_detail, discount, tax, date, due_date, status, notes, } = data;
    try {
        let subtotal = 0;
        invoice_detail.forEach((item) => {
            subtotal += parseFloat(item.qty) * parseFloat(item.price);
        });
        const grandTotal = subtotal - parseFloat(discount) + parseFloat(tax);
        const invoice = yield new invoiceModel({
            invoice_id: invoice_id,
            ifCreatedByAdmin: req.id,
            status: status,
            date: date,
            dueDate: due_date,
            cashierInfo: cashierInfo,
            customerInfo: customerInfo,
            invoice_detail: invoice_detail,
            discount: discount,
            tax: tax,
            grandTotal: grandTotal.toFixed(2),
            notes: notes,
        }).save();
        const updatedAdmin = yield adminmodel.findOneAndUpdate({
            _id: req.id,
        }, {
            $push: {
                invoices: invoice._id,
            },
        }, {
            new: true,
        });
        const updatedcustomer = yield customerModel.findOneAndUpdate({
            _id: customerInfo._id,
        }, {
            $push: {
                invoice_id: invoice._id,
            },
        }, {
            new: true,
        });
        res.status(200).json({ message: "Invoice created successfully" });
    }
    catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.getinvoiceAdmin = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const invoices = yield invoiceModel.find({});
    res.json({ invoice: invoices });
}));
exports.deleteinvoiceAdmin = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const invoiceId = req.body.invoiceId;
    // Delete the invoice
    const deletedInvoice = yield invoiceModel.findOneAndDelete({
        invoice_id: invoiceId,
    });
    if (!deletedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
    }
    // Find the admin
    const admin = yield adminmodel
        .findOne({ _id: req.id })
        .populate("invoices");
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }
    admin.invoices = admin.invoices.filter((invoice) => {
        const isEqual = invoice._id.toString() === deletedInvoice._id.toString();
        console.log(`Comparing: ${invoice._id.toString()} === ${deletedInvoice._id.toString()}. Result: ${isEqual}`);
        return !isEqual;
    });
    try {
        yield admin.save();
        console.log("Admin invoices updated successfully.");
    }
    catch (error) {
        console.error("Error saving admin:", error);
        return res.status(500).json({ message: "Error saving admin" });
    }
    res.json({ message: "Invoice deleted successfully" });
}));
exports.singleinvoiceAdmin = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const invoiceId = req.body.invoiceId;
    const invoice = yield invoiceModel.findOne({ invoice_id: invoiceId });
    res.json({ invoice: invoice });
}));
exports.updateInvoiceAdmin = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newList = req.body.list;
    try {
        // Find the invoice by invoice_id
        const invoice = yield invoiceModel.findOne({
            invoice_id: newList.invoice_id,
        });
        // Check if the invoice exists
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        // Update the invoice fields
        invoice.status = newList.status;
        invoice.date = newList.date;
        invoice.dueDate = newList.dueDate;
        invoice.cashierInfo = newList.cashierInfo;
        invoice.customerInfo = newList.customerInfo;
        invoice.invoice_detail = newList.invoice_detail;
        invoice.discount = newList.discount;
        invoice.tax = newList.tax;
        invoice.grandTotal = newList.grandTotal;
        invoice.notes = newList.notes;
        // Save the updated invoice
        yield invoice.save();
        res.json({
            message: "Invoice updated successfully",
            updatedInvoice: invoice,
        });
    }
    catch (error) {
        console.error("Error updating invoice:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
//user controllers
exports.getInvoicesUser = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield UserModel.findOne({ _id: req.Userid }).populate("invoices");
    res.json({ invoice: user.invoices });
}));
exports.createinvoiceUser = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const { invoice_id, cashierInfo, customerInfo, invoice_detail, discount, tax, date, due_date, status, notes, } = data;
    try {
        let subtotal = 0;
        invoice_detail.forEach((item) => {
            subtotal += parseFloat(item.qty) * parseFloat(item.price);
        });
        const grandTotal = subtotal - parseFloat(discount) + parseFloat(tax);
        const invoice = yield new invoiceModel({
            invoice_id: invoice_id,
            ifcreatedByUser: req.Userid,
            status: status,
            date: date,
            dueDate: due_date,
            cashierInfo: cashierInfo,
            customerInfo: customerInfo,
            invoice_detail: invoice_detail,
            discount: discount,
            tax: tax,
            grandTotal: grandTotal.toFixed(2),
            notes: notes,
        }).save();
        const updatedAdmin = yield UserModel.findOneAndUpdate({
            _id: req.Userid,
        }, {
            $push: {
                invoices: invoice._id,
            },
        }, {
            new: true,
        });
        const updatedcustomer = yield customerModel.findOneAndUpdate({
            _id: customerInfo._id,
        }, {
            $push: {
                invoice_id: invoice._id,
            },
        }, {
            new: true,
        });
        res.status(200).json({ message: "Invoice created successfully" });
    }
    catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.deleteInvoiceUser = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const invoiceId = req.body.invoiceId;
    // Delete the invoice
    const deletedInvoice = yield invoiceModel.findOneAndDelete({
        invoice_id: invoiceId,
    });
    if (!deletedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
    }
    // Find the admin
    const admin = yield UserModel
        .findOne({ _id: req.Userid })
        .populate("invoices");
    if (!admin) {
        return res.status(404).json({ message: "User not found" });
    }
    admin.invoices = admin.invoices.filter((invoice) => {
        const isEqual = invoice._id.toString() === deletedInvoice._id.toString();
        console.log(`Comparing: ${invoice._id.toString()} === ${deletedInvoice._id.toString()}. Result: ${isEqual}`);
        return !isEqual;
    });
    try {
        yield admin.save();
        console.log("Admin invoices updated successfully.");
    }
    catch (error) {
        console.error("Error saving admin:", error);
        return res.status(500).json({ message: "Error saving admin" });
    }
    res.json({ message: "Invoice deleted successfully" });
}));
exports.singleinvoiceUser = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const invoiceId = req.body.invoiceId;
    const invoice = yield invoiceModel.findOne({ invoice_id: invoiceId });
    res.json({ invoice: invoice });
}));
exports.updateInvoiceUser = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newList = req.body.list;
    try {
        // Find the invoice by invoice_id
        const invoice = yield invoiceModel.findOne({
            invoice_id: newList.invoice_id,
        });
        // Check if the invoice exists
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        // Update the invoice fields
        invoice.status = newList.status;
        invoice.date = newList.date;
        invoice.dueDate = newList.dueDate;
        invoice.cashierInfo = newList.cashierInfo;
        invoice.customerInfo = newList.customerInfo;
        invoice.invoice_detail = newList.invoice_detail;
        invoice.discount = newList.discount;
        invoice.tax = newList.tax;
        invoice.grandTotal = newList.grandTotal;
        invoice.notes = newList.notes;
        // Save the updated invoice
        yield invoice.save();
        res.json({
            message: "Invoice updated successfully",
            updatedInvoice: invoice,
        });
    }
    catch (error) {
        console.error("Error updating invoice:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}));
