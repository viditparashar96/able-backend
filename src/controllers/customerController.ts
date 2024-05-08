const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const adminmodel = require("../models/adminModel");
const UserModel = require("../models/userModels");

const customerModel = require("../models/customerModel");
import { errorHandler } from "../utils/errorHandler";
import { sendtoken } from "../utils/sendToken";

export const customerHomepage = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    res.json({ message: " Admin homepage" });
  }
);

export const addCustomer = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const customer = await customerModel(req.body).save();
    res.json({ customer: customer });
  }
);

export const loginCustomer = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const customer = await customerModel.findOne({ email: req.body.email });
    if (!customer) return next(new errorHandler("User Not Found", 404));
    const isMatch = customer.compareCustomerPassword(req.body.password);
    if (!isMatch) return next(new errorHandler("Wrong Crediendials", 404));
    sendtoken(customer, 201, res);
  }
);

export const currentCustomer = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const customer = await customerModel.findOne({ _id: req.customerId });
    if (!customer) return next(new errorHandler("User Not Found", 404));
    sendtoken(customer, 201, res);
  }
);

export const getAllCustomer = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const customer = await customerModel.find({});

    res.json({ customers: customer });
  }
);

export const deleteCustomer = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const customer = await customerModel.findOne({ _id: req.params.id });

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      await customerModel.deleteOne({ _id: req.params.id });

      res.json({ message: "Customer deleted", customer });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
