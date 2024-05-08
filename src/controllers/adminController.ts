const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const adminmodel = require("../models/adminModel");
const UserModel = require("../models/userModels");
const collectionModel = require("../models/collectionModel");
import { errorHandler } from "../utils/errorHandler";
import { sendtoken } from "../utils/sendToken";

export const adminHomepage = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    res.json({ message: " Admin homepage" });
  }
);

export const loginAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const admin = await adminmodel.findOne({ email: req.body.email });
    if (!admin) return next(new errorHandler("User Not Found", 404));
    const isMatch = admin.compareAdminPassword(req.body.password);
    if (!isMatch) return next(new errorHandler("Wrong Crediendials", 404));
    sendtoken(admin, 201, res);
  }
);

export const signupAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const admin = await new adminmodel(req.body).save();
    sendtoken(admin, 201, res);
  }
);

export const updateAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const adminId = req.params.adminId;
    const updates = req.body;

    // Check if there are no updates sent
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No updates provided",
      });
    }

    try {
      const admin = await adminmodel.findByIdAndUpdate(adminId, updates, {
        new: true, // Return the modified document rather than the original
        runValidators: true, // Run validation on update
      });

      if (!admin) {
        return res.status(404).json({
          status: "fail",
          message: "Admin not found",
        });
      }

      res.status(200).json({
        status: "success",
        data: {
          admin,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
);

export const signoutAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    res.clearCookie("token");
    res.json({ message: "sign out successfully" });
  }
);

export const currentAdmin = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const currentUser = await adminmodel.findOne({ _id: req.id });

    res.json({ admin: currentUser });
  }
);

export const createUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      // Create the user document
      const createdUser = await new UserModel(req.body).save();

      // Send response
      res.json({ message: "User created", user: createdUser });
    } catch (error) {
      // Handle errors
      res.json({ err: error });
    }
  }
);

export const finduserbyarea = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const founduser = await UserModel.find({ area: req.query.area });

    if (founduser.length == 0)
      return res.json({
        message: "no user found",
      });
    else {
      res.json({
        users: founduser,
      });
    }
  }
);

export const finduserbyname = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const foundedUser = await UserModel.find({ full_name: req.query.name });

    res.json({ users: foundedUser });
  }
);

export const allUser = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    const foundedUser = await UserModel.find({})?.populate("collection");

    res.json({ users: foundedUser });
  }
);

export const deleteUser = catchAsyncErrors(
  async (
    req: { params: { userId: any } },
    res: {
      status: (arg0: number) => {
        (): any;
        new (): any;
        json: { (arg0: { error: string }): any; new (): any };
      };
      json: (arg0: { message: string }) => void;
    },
    next: any
  ) => {
    const userId = req.params.userId;

    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    await UserModel.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  }
);

export const dayCollection = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      const todayDate =
        date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

      const foundCollection = await collectionModel.find({
        moneyCollectionDate: todayDate,
      });

      res.json({
        collection: foundCollection,
      });
    } catch (error) {
      req.json({ error });
    }
  }
);

export const dayCollectionTotal = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      // Format today's date as "dd/mm/yyyy"
      const todayDate =
        date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

      // Find collections for the current day
      const foundCollection = await collectionModel.find({
        moneyCollectionDate: todayDate,
      });

      // Calculate total money collected for the day
      let totalMoneyCollected = 0;
      foundCollection.forEach((collection: any) => {
        totalMoneyCollected += collection.moneyCollection;
      });

      res.json({
        TotalDayCollection: totalMoneyCollected,
      });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const weeklyCollection = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      // Calculate the start date for the week (7 days ago)
      const startDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
      // Format start date as "dd/mm/yyyy"
      const startDateFormatted =
        startDate.getDate() +
        "/" +
        startDate.getMonth() +
        "/" +
        startDate.getFullYear();

      // Format today's date as "dd/mm/yyyy"
      const todayDate =
        date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

      // Find collections within the last 7 days
      const foundCollection = await collectionModel.find({
        moneyCollectionDate: {
          $gte: startDateFormatted, // Greater than or equal to start date
          $lte: todayDate, // Less than or equal to today's date
        },
      });

      res.json({
        collection: foundCollection,
      });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const weeklyEachDayCollectionTotal = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      // Calculate the start date for the week (7 days ago)
      const startDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);

      const dayTotals = [];

      // Loop through each day of the last 7 days
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(
          startDate.getTime() + i * 24 * 60 * 60 * 1000
        );
        const formattedDate =
          currentDate.getDate() +
          "/" +
          currentDate.getMonth() +
          "/" +
          currentDate.getFullYear();

        // Find collections for the current day
        const foundCollection = await collectionModel.find({
          moneyCollectionDate: formattedDate,
        });

        // Calculate total money collected for the day
        let totalMoneyCollected = 0;
        foundCollection.forEach((collection: any) => {
          totalMoneyCollected += collection.moneyCollection;
        });

        // Store total for the current day in an object
        const dayTotal = {
          date: formattedDate,
          total: totalMoneyCollected,
        };

        // Push the day total to the array
        dayTotals.push(dayTotal);
      }

      res.json({
        weeklyDayTotals: dayTotals,
      });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const weeklyCollectionTotal = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      // Calculate the start date for the week (7 days ago)
      const startDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
      // Format start date as "dd/mm/yyyy"
      const startDateFormatted =
        startDate.getDate() +
        "/" +
        startDate.getMonth() +
        "/" +
        startDate.getFullYear();

      // Format today's date as "dd/mm/yyyy"
      const todayDate =
        date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

      // Find collections within the last 7 days
      const foundCollection = await collectionModel.find({
        moneyCollectionDate: {
          $gte: startDateFormatted, // Greater than or equal to start date
          $lte: todayDate, // Less than or equal to today's date
        },
      });

      // Calculate total money collected in the last 7 days
      let totalMoneyCollected = 0;
      foundCollection.forEach((collection: any) => {
        totalMoneyCollected += collection.moneyCollection;
      });

      res.json({
        TotalWeeklyCollection: totalMoneyCollected,
      });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const monthlyCollection = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      // Calculate the start date for the month (1st day of the current month)
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      // Format start date as "dd/mm/yyyy"
      const startDateFormatted =
        startDate.getDate() +
        "/" +
        startDate.getMonth() +
        "/" +
        startDate.getFullYear();

      // Format today's date as "dd/mm/yyyy"
      const todayDate =
        date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

      // Find collections within the current month
      const foundCollection = await collectionModel.find({
        moneyCollectionDate: {
          $gte: startDateFormatted, // Greater than or equal to start date
          $lte: todayDate, // Less than or equal to today's date
        },
      });

      res.json({
        collection: foundCollection,
      });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const monthlyRevenueTotal = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();

      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);

      const startDateFormatted =
        startDate.getDate() +
        "/" +
        startDate.getMonth() +
        "/" +
        startDate.getFullYear();

      const todayDate =
        date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

      // Find collections within the current month
      const foundCollection = await collectionModel.find({
        moneyCollectionDate: {
          $gte: startDateFormatted,
          $lte: todayDate,
        },
      });

      let totalRevenue = 0;
      foundCollection.forEach((collection: any) => {
        totalRevenue += collection.moneyCollection;
      });

      res.json({
        TotalMonthlyRevenue: totalRevenue,
      });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const last30DaysCollectionTotal = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      // Calculate the start date for 30 days ago
      const startDate = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000);

      const dayTotals = [];

      // Loop through each day of the last 30 days
      for (let i = 0; i < 30; i++) {
        const currentDate = new Date(
          startDate.getTime() + i * 24 * 60 * 60 * 1000
        );
        const formattedDate =
          currentDate.getDate() +
          "/" +
          currentDate.getMonth() +
          "/" +
          currentDate.getFullYear();

        // Find collections for the current day
        const foundCollection = await collectionModel.find({
          moneyCollectionDate: formattedDate,
        });

        // Calculate total money collected for the day
        let totalMoneyCollected = 0;
        foundCollection.forEach((collection: any) => {
          totalMoneyCollected += collection.moneyCollection;
        });

        // Store total for the current day in an object
        const dayTotal = {
          date: formattedDate,
          total: totalMoneyCollected,
        };

        // Push the day total to the array
        dayTotals.push(dayTotal);
      }

      res.json({
        last30DaysTotals: dayTotals,
      });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const allCollection = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      // Find collections within the current month
      const foundCollection = await collectionModel.find({});

      res.json({
        collection: foundCollection,
      });
    } catch (error) {
      res.json({ error });
    }
  }
);
