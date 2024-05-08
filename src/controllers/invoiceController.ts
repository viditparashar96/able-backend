const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const adminmodel = require("../models/adminModel");
const UserModel = require("../models/userModels");
const customerModel = require("../models/customerModel");
const invoiceModel = require("../models/invoiceModel");
import { errorHandler } from "../utils/errorHandler";

export const invoiceHomepage = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    res.json({ message: " Admin homepage" });
  }
);

export const createinvoiceAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const data = req.body;

    const {
      invoice_id,
      cashierInfo,
      customerInfo,
      invoice_detail,
      discount,
      tax,
      date,
      due_date,
      status,
      notes,
    } = data;

    try {
      let subtotal = 0;
      invoice_detail.forEach((item: { qty: string; price: string }) => {
        subtotal += parseFloat(item.qty) * parseFloat(item.price);
      });

      const grandTotal = subtotal - parseFloat(discount) + parseFloat(tax);

      const invoice = await new invoiceModel({
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

      const updatedAdmin = await adminmodel.findOneAndUpdate(
        {
          _id: req.id,
        },
        {
          $push: {
            invoices: invoice._id,
          },
        },
        {
          new: true,
        }
      );
      const updatedcustomer = await customerModel.findOneAndUpdate(
        {
          _id: customerInfo._id,
        },
        {
          $push: {
            invoice_id: invoice._id,
          },
        },
        {
          new: true,
        }
      );
      res.status(200).json({ message: "Invoice created successfully" });
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export const getinvoiceAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const invoices = await invoiceModel.find({});

    res.json({ invoice: invoices });
  }
);


export const deleteinvoiceAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const invoiceId = req.body.invoiceId;

    // Delete the invoice
    const deletedInvoice = await invoiceModel.findOneAndDelete({
      invoice_id: invoiceId,
    });

    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Find the admin
    const admin = await adminmodel
      .findOne({ _id: req.id })
      .populate("invoices");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.invoices = admin.invoices.filter(
      (invoice: { _id: { toString: () => any } }) => {
        const isEqual =
          invoice._id.toString() === deletedInvoice._id.toString();
        console.log(
          `Comparing: ${invoice._id.toString()} === ${deletedInvoice._id.toString()}. Result: ${isEqual}`
        );
        return !isEqual;
      }
    );

    try {
      await admin.save();
      console.log("Admin invoices updated successfully.");
    } catch (error) {
      console.error("Error saving admin:", error);
      return res.status(500).json({ message: "Error saving admin" });
    }

    res.json({ message: "Invoice deleted successfully" });
  }
);

export const singleinvoiceAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const invoiceId = req.body.invoiceId;

    const invoice = await invoiceModel.findOne({ invoice_id: invoiceId });

    res.json({ invoice: invoice });
  }
);

export const updateInvoiceAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const newList = req.body.list;

    try {
      // Find the invoice by invoice_id
      const invoice = await invoiceModel.findOne({
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
      await invoice.save();

      res.json({
        message: "Invoice updated successfully",
        updatedInvoice: invoice,
      });
    } catch (error) {
      console.error("Error updating invoice:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);




//user controllers

export const getInvoicesUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const user = await UserModel.findOne({ _id: req.Userid }).populate(
      "invoices"
    );

    res.json({ invoice: user.invoices });
  }
);




export const createinvoiceUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const data = req.body;

    const {
      invoice_id,
      cashierInfo,
      customerInfo,
      invoice_detail,
      discount,
      tax,
      date,
      due_date,
      status,
      notes,
    } = data;

    try {
      let subtotal = 0;
      invoice_detail.forEach((item: { qty: string; price: string }) => {
        subtotal += parseFloat(item.qty) * parseFloat(item.price);
      });

      const grandTotal = subtotal - parseFloat(discount) + parseFloat(tax);

      const invoice = await new invoiceModel({
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

      const updatedAdmin = await UserModel.findOneAndUpdate(
        {
          _id: req.Userid,
        },
        {
          $push: {
            invoices: invoice._id,
          },
        },
        {
          new: true,
        }
      );
      const updatedcustomer = await customerModel.findOneAndUpdate(
        {
          _id: customerInfo._id,
        },
        {
          $push: {
            invoice_id: invoice._id,
          },
        },
        {
          new: true,
        }
      );
      res.status(200).json({ message: "Invoice created successfully" });
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);





export const deleteInvoiceUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const invoiceId = req.body.invoiceId;

    // Delete the invoice
    const deletedInvoice = await invoiceModel.findOneAndDelete({
      invoice_id: invoiceId,
    });

    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Find the admin
    const admin = await UserModel
      .findOne({ _id: req.Userid })
      .populate("invoices");

    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    admin.invoices = admin.invoices.filter(
      (invoice: { _id: { toString: () => any } }) => {
        const isEqual =
          invoice._id.toString() === deletedInvoice._id.toString();
        console.log(
          `Comparing: ${invoice._id.toString()} === ${deletedInvoice._id.toString()}. Result: ${isEqual}`
        );
        return !isEqual;
      }
    );

    try {
      await admin.save();
      console.log("Admin invoices updated successfully.");
    } catch (error) {
      console.error("Error saving admin:", error);
      return res.status(500).json({ message: "Error saving admin" });
    }

    res.json({ message: "Invoice deleted successfully" });
  }
);



export const singleinvoiceUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const invoiceId = req.body.invoiceId;

    const invoice = await invoiceModel.findOne({ invoice_id: invoiceId });

    res.json({ invoice: invoice });
  }
);





export const updateInvoiceUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const newList = req.body.list;

    try {
      // Find the invoice by invoice_id
      const invoice = await invoiceModel.findOne({
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
      await invoice.save();

      res.json({
        message: "Invoice updated successfully",
        updatedInvoice: invoice,
      });
    } catch (error) {
      console.error("Error updating invoice:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
