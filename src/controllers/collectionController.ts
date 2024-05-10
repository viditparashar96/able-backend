const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const collectionModel = require("../models/collectionModel");
const userModel = require("../models/userModels");
const adminModel = require("../models/adminModel");
const customermodel = require("../models/customerModel");

import moment from "moment";

export const createCollection = async (req: any, res: any, next: any) => {
  try {
    const { invoice_id, customerInfo, cashierInfo, date, amount, notes } =
      req.body;

    if (!cashierInfo || !cashierInfo.email) {
      return res.status(400).json({ error: "Cashier email is required" });
    }
    const { name, address, phone, email, _id } = customerInfo;

    const collection = new collectionModel({
      invoice_id,
      customerInfo: { name, address, phone, email },
      cashierInfo,
      date,
      amount,
      notes,
      customer_id: _id,
    });

    // Save the collection record to the database
    await collection.save();

    const isUser = await userModel.findOne({ email: cashierInfo.email });
    const isAdmin = await adminModel.findOne({ email: cashierInfo.email });

    // Modify the user/admin model and collection accordingly
    if (isUser) {
      isUser.collection.push(collection._id);
      collection.ifcreatedByUser = isUser._id;
      await isUser.save();
    }

    if (isAdmin) {
      isAdmin.collection.push(collection._id);
      collection.ifCreatedByAdmin = isAdmin._id;
      await isAdmin.save();
    }

    await collection.save();

    res
      .status(201)
      .json({ message: "Collection created successfully", collection });
  } catch (error) {
    console.error("Error creating collection:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCollections = async (req: any, res: any, next: any) => {
  try {
    const collections = await collectionModel.find();
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Function to get a single collection record by ID
exports.getCollectionById = async (req: any, res: any, next: any) => {
  try {
    const collection = await collectionModel.findOne({
      invoice_id: req.params.id,
    });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Function to update a collection record by ID
exports.updateCollection = async (req: any, res: any, next: any) => {
  try {
    const collection = await collectionModel.findOne({
      invoice_id: req.params.id,
    });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    Object.assign(collection, req.body);
    await collection.save();
    res.json(collection);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

exports.deleteCollection = async (
  req: { params: { id: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { message: string }): void; new (): any };
    };
    json: (arg0: { message: string }) => void;
  },
  next: any
) => {
  try {
    const collection = await collectionModel.findOneAndDelete({
      invoice_id: req.params.id,
    });
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    res.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.collectionsOfUser = async (req: any, res: any, next: any) => {
  try {
    const collections = await userModel
      .findOne({ _id: req.Userid })
      .populate("collection");

    res.json(collections.collection);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const monthlyUserRevenueTotal = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();

      const startDate = new Date(currentYear, currentMonth, 1); // First day of the current month
      const endDate = new Date(currentYear, currentMonth + 1, 1); // First day of the next month

      const foundCollections = await collectionModel.find({
        userId: req.userId, // Assuming userId is a property in the collection model
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      let totalRevenue = 0;

      foundCollections.forEach((collection: any) => {
        totalRevenue += collection.amount;
      });

      res.json({
        TotalMonthlyUserRevenue: totalRevenue,
      });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const getWeeklyUserRevenueTotal = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      const endDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      ); // End of today
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Start of 7 days ago

      const foundCollections = await collectionModel.find({
        ifcreatedByUser: req.Userid, // Assuming userId is a property in the collection model
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      let totalRevenue = 0;

      foundCollections.forEach((collection: any) => {
        totalRevenue += collection.amount;
      });

      res.json({ TotalWeeklyUserRevenue: totalRevenue });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const getLast30DaysCollectionData = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.Userid; // Assuming you're using JWT for authentication

    // Calculate the start date for 30 days ago
    const startDate = moment().subtract(30, "days").startOf("day");

    const dates = [];
    const totals = [];

    // Loop through each day of the last 30 days
    for (let i = 0; i < 31; i++) {
      // Changed loop to iterate over 31 days to include today
      const currentDate = moment(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database

      // Find collections for the current day and user
      const foundCollections = await collectionModel.find({
        ifcreatedByUser: userId,
        date: currentDate,
      });

      // Calculate total money collected for the day
      let totalMoneyCollected = 0;
      foundCollections.forEach((collection: any) => {
        totalMoneyCollected += collection.amount;
      });

      // Push the formatted date and total to arrays
      dates.push(currentDate);
      totals.push(totalMoneyCollected);
    }

    const response = {
      date: dates,
      total: totals,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getdailyUserRevenueTotal = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      const today = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const foundCollections = await collectionModel.find({
        ifcreatedByUser: req.Userid, // Assuming userId is a property in the collection model
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      let totalRevenue = 0;
      foundCollections.forEach((collection: any) => {
        totalRevenue += collection.amount;
      });

      res.json({ TotalDailyUserRevenue: totalRevenue });
    } catch (error) {
      res.json({ error });
    }
  }
);

export const getDailyUserCollections = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      // Find collection records related to the user ID
      const collections = await collectionModel.find({
        $or: [
          { ifcreatedByUser: req.userId },
          { ifCreatedByAdmin: req.userId },
        ],
      });

      // Calculate total number of collections
      const totalCollections = collections.length;

      // Calculate total amount till date
      const totalAmount = collections.reduce(
        (total: any, collection: { amount: any }) =>
          total + (collection.amount || 0),
        0
      );

      // Send response with total collections and total amount
      res.json({
        totalCollections,
        totalAmount,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export const getLast7DaysCollectionData = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.Userid; // Assuming you're using JWT for authentication

    // Calculate the start date for 7 days ago
    const startDate = moment().subtract(7, "days").startOf("day");

    const dates = [];
    const totals = [];

    // Loop through each day of the last 7 days
    for (let i = 0; i < 8; i++) {
      // Changed loop to iterate over 7 days to include today
      const currentDate = moment(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database

      // Find collections for the current day and user
      const foundCollections = await collectionModel.find({
        ifcreatedByUser: userId,
        date: currentDate,
      });

      // Calculate total money collected for the day
      let totalMoneyCollected = 0;
      foundCollections.forEach((collection: any) => {
        totalMoneyCollected += collection.amount;
      });

      // Push the formatted date and total to arrays
      dates.push(currentDate);
      totals.push(totalMoneyCollected);
    }

    const response = {
      date: dates,
      total: totals,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//admin
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
      const today = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const foundCollections = await collectionModel.find({
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      let totalMoneyCollected = 0;
      foundCollections.forEach((collection: any) => {
        totalMoneyCollected += collection.amount;
      });

      res.json({ TotalDayCollection: totalMoneyCollected });
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

export const weeklyEachDayCollectionTotal = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const startDate = moment().subtract(7, "days").startOf("day");

    const dates = [];
    const totals = [];

    // Loop through each day of the last 7 days
    for (let i = 0; i < 8; i++) {
      // Changed loop to iterate over 7 days to include today
      const currentDate = moment(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database

      // Find collections for the current day and user
      const foundCollections = await collectionModel.find({
        date: currentDate,
      });

      // Calculate total money collected for the day
      let totalMoneyCollected = 0;
      foundCollections.forEach((collection: any) => {
        totalMoneyCollected += collection.amount;
      });

      // Push the formatted date and total to arrays
      dates.push(currentDate);
      totals.push(totalMoneyCollected);
    }

    const response = {
      date: dates,
      total: totals,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const last30DaysCollectionTotal = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    // Calculate the start date for 30 days ago
    const startDate = moment().subtract(30, "days").startOf("day");

    const dates = [];
    const totals = [];

    // Loop through each day of the last 30 days
    for (let i = 0; i < 31; i++) {
      // Changed loop to iterate over 31 days to include today
      const currentDate = moment(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database

      // Find collections for the current day
      const foundCollections = await collectionModel.find({
        date: currentDate,
      });

      // Calculate total money collected for the day
      let totalMoneyCollected = 0;
      foundCollections.forEach((collection: any) => {
        totalMoneyCollected += collection.amount;
      });

      // Push the formatted date and total to arrays
      dates.push(currentDate);
      totals.push(totalMoneyCollected);
    }

    const response = {
      date: dates,
      total: totals,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const weeklyCollectionTotal = catchAsyncErrors(
  async (req: any, res: any, next: any) => {
    try {
      const date = new Date();
      const endDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      ); // End of today
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Start of 7 days ago

      const foundCollections = await collectionModel.find({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      let totalMoneyCollected = 0;

      foundCollections.forEach((collection: any) => {
        totalMoneyCollected += collection.amount;
      });

      res.json({ TotalWeeklyCollection: totalMoneyCollected });
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
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();

      const startDate = new Date(currentYear, currentMonth, 1); // First day of the current month
      const endDate = new Date(currentYear, currentMonth + 1, 1); // First day of the next month

      const foundCollections = await collectionModel.find({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });

      let totalRevenue = 0;

      foundCollections.forEach((collection: any) => {
        totalRevenue += collection.amount;
      });

      const totalDepositor = await userModel.find({});

      const totalCustomer = await customermodel.find({});

      res.json({
        TotalMonthlyRevenue: totalRevenue,
        totalDepositor: totalDepositor.length,
        totalCustomer: totalCustomer.length,
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

//customer

exports.getCustomerStatistics = async (
  req: { customerId: any },
  res: {
    json: (arg0: {
      totalAmountLast30Days: any;
      totalAmountLast7Days: any;
      totalAmountToday: any;
    }) => void;
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { message: unknown }): void; new (): any };
    };
  },
  next: any
) => {
  try {
    // Fetch collections for the customer
    const collections = await collectionModel.find({
      customer_id: req.customerId,
    });

    // Calculate dates for the last 30 days, last 7 days, and today
    const today = moment();
    const last30Days = moment().subtract(30, "days");
    const last7Days = moment().subtract(7, "days");

    // Filter collections for the last 30 days
    const collectionsLast30Days = collections.filter(
      (collection: { date: moment.MomentInput }) =>
        moment(collection.date, "MM/DD/YYYY").isBetween(last30Days, today)
    );

    // Filter collections for the last 7 days
    const collectionsLast7Days = collections.filter(
      (collection: { date: moment.MomentInput }) =>
        moment(collection.date, "MM/DD/YYYY").isBetween(last7Days, today)
    );

    // Filter collections for today
    const collectionsToday = collections.filter(
      (collection: { date: moment.MomentInput }) =>
        moment(collection.date, "MM/DD/YYYY").isSame(today, "day")
    );

    // Calculate total amount for the last 30 days
    const totalAmountLast30Days = collectionsLast30Days.reduce(
      (total: any, collection: { amount: any }) => {
        return total + collection.amount;
      },
      0
    );

    // Calculate total amount deposited for the last 7 days
    const totalAmountLast7Days = collectionsLast7Days.reduce(
      (total: any, collection: { amount: any }) => {
        return total + collection.amount;
      },
      0
    );

    // Calculate total amount deposited today
    const totalAmountToday = collectionsToday.reduce(
      (total: any, collection: { amount: any }) => {
        return total + collection.amount;
      },
      0
    );

    // Prepare response object
    const statistics = {
      totalAmountLast30Days,
      totalAmountLast7Days,
      totalAmountToday,
    };

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.getCustomerCollection = async (req: any, res: any, next: any) => {
  try {
    const collections = await collectionModel.find({
      customer_id: req.customerId,
    });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getCustomerMonthlyArray = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const customerId = req.customerId; // Assuming customer id is obtained from request

    // Calculate the start date for 30 days ago
    const startDate = moment().subtract(30, "days").startOf("day");

    const dates = [];
    const totals = [];

    // Loop through each day of the last 30 days
    for (let i = 0; i < 31; i++) {
      // Changed loop to iterate over 31 days to include today
      const currentDate = moment(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database

      // Find collections for the current day and customer
      const foundCollections = await collectionModel.find({
        customer_id: customerId,
        date: currentDate,
      });

      // Calculate total money collected for the day
      let totalMoneyCollected = 0;
      foundCollections.forEach((collection: any) => {
        totalMoneyCollected += collection.amount;
      });

      // Push the formatted date and total to arrays
      dates.push(currentDate);
      totals.push(totalMoneyCollected);
    }

    const response = {
      date: dates,
      total: totals,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCustomerWeeklyArray = async (req: any, res: any, next: any) => {
  try {
    const customerId = req.customerId; // Assuming customer id is obtained from request

    const startDate = moment().subtract(7, "days").startOf("day");

    const dates = [];
    const totals = [];

    // Loop through each day of the last 7 days
    for (let i = 0; i < 8; i++) {
      // Changed loop to iterate over 7 days to include today
      const currentDate = moment(startDate).add(i, "days").format("MM/DD/YYYY"); // Format adjusted to match database

      // Find collections for the current day and customer
      const foundCollections = await collectionModel.find({
        customer_id: customerId,
        date: currentDate,
      });

      // Calculate total money collected for the day
      let totalMoneyCollected = 0;
      foundCollections.forEach((collection: any) => {
        totalMoneyCollected += collection.amount;
      });

      // Push the formatted date and total to arrays
      dates.push(currentDate);
      totals.push(totalMoneyCollected);
    }

    const response = {
      date: dates,
      total: totals,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
