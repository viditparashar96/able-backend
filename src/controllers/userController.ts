const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const adminmodel = require("../models/adminModel");
const UserModel = require("../models/userModels");
import { errorHandler } from "../utils/errorHandler";
import { sendtoken } from "../utils/sendToken";
const collectionModel = require("../models/collectionModel");
const customerModel = require("../models/customerModel");
const { CompareUserPassword } = require("../models/userModels");

export const userHomepage = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    res.json({ message: "homepage" });
  }
);

export const loginUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const user = await UserModel.findOne({ email: req.body.email });
    const isMatch = user.CompareUserPassword(req.body.password);
    console.log(isMatch);
    if (!isMatch) return next(new errorHandler("wrong crediendials", 404));
    sendtoken(user, 201, res);
  }
);



export const signoutUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    res.clearCookie("token");

    res.json({ message: "Signed out" });
  }
);

export const currentUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const currentUser = await UserModel.findOne({ _id: req.Userid })?.populate(
      "collection"
    );

    res.json({
      message: "user found",

      user: currentUser,
    });
  }
);

export const addMoneyCollection = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayDay = daysOfWeek[dayOfWeek];

    const todayDate =
      date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

    const user = await UserModel.findOne({ _id: req.Userid }).populate(
      "revenue"
    );

    const collectionmodel = await new collectionModel({
      collectedBy: req.Userid,
      moneyCollectionDate: todayDate,
      moneyCollectionDay: todayDay,
      moneyCollection: req.body.moneyCollected,
    }).save();

    user.revenue.push(collectionmodel._id);
    await user.save();
    res.json({ user: user });
  }
);

export const Statistics = catchAsyncErrors(
  async (
    req: { Userid: any },
    res: {
      json: (arg0: {
        totalCollection: any;
        weeklyCollection: any;
        monthlyCollection: any;
        totalCustomers: any;
        totalInvoices: any;
      }) => void;
    },
    next: any
  ) => {
    // Get logged-in user's ID
    const userId = req.Userid;

    // Get current date
    const currentDate = new Date();

    // Calculate start and end dates for the current week
    const startDateOfWeek = new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay())
    );
    const endDateOfWeek = new Date(
      currentDate.setDate(currentDate.getDate() + 6)
    );

    // Calculate start and end dates for the current month
    const startDateOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endDateOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Aggregate queries
    const [
      totalCollection,
      weeklyCollection,
      monthlyCollection,
      totalCustomers,
      totalInvoices,
    ] = await Promise.all([
      // Total collection till date of the logged-in user
      collectionModel.aggregate([
        {
          $match: { collectedBy: userId },
        },
        {
          $group: {
            _id: null,
            totalCollection: { $sum: "$moneyCollection" },
          },
        },
      ]),

      // Weekly collection of the current user
      collectionModel.aggregate([
        {
          $match: {
            collectedBy: userId,
            moneyCollectionDate: {
              $gte: startDateOfWeek.toISOString(),
              $lte: endDateOfWeek.toISOString(),
            },
          },
        },
        {
          $group: {
            _id: null,
            weeklyCollection: { $sum: "$moneyCollection" },
          },
        },
      ]),

      // Monthly collection of the user till date
      collectionModel.aggregate([
        {
          $match: {
            collectedBy: userId,
            moneyCollectionDate: {
              $gte: startDateOfMonth.toISOString(),
              $lte: endDateOfMonth.toISOString(),
            },
          },
        },
        {
          $group: {
            _id: null,
            monthlyCollection: { $sum: "$moneyCollection" },
          },
        },
      ]),

      // Total customers registered till date
      customerModel.countDocuments({}),

      // Total invoices of the user
      UserModel.aggregate([
        {
          $match: { _id: userId },
        },
        {
          $project: {
            totalInvoices: { $size: "$invoices" },
          },
        },
      ]),
    ]);

    // Send response
    res.json({
      totalCollection:
        totalCollection.length > 0 ? totalCollection[0].totalCollection : 0,
      weeklyCollection:
        weeklyCollection.length > 0 ? weeklyCollection[0].weeklyCollection : 0,
      monthlyCollection:
        monthlyCollection.length > 0
          ? monthlyCollection[0].monthlyCollection
          : 0,
      totalCustomers,
      totalInvoices:
        totalInvoices.length > 0 ? totalInvoices[0].totalInvoices : 0,
    });
  }
);

export const updateUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const {
        fullname,
        email,
        dob,
        contact,
        address,
        country,
        state,
        zip_code,
      } = req.body;

      // Find the user by email
      let user = await UserModel.findOne({ email });

      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user fields
      user.full_name = fullname;
      user.dob = dob;
      user.mobile_number = contact;
      user.fullAddress = address;
      user.country = country;
      user.state = state;
      user.zip_code = zip_code;

      // Save updated user
      await user.save();

      // Send response
      res.json({ message: "User updated", user });
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ error: error });
    }
  }
);
