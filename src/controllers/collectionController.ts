const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const collectionModel = require("../models/collectionModel");
const userModel = require("../models/userModels");
const adminModel = require("../models/adminModel");
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

export const Statistics = async (req: any, res: any, next: any) => {
  try {
    const userId = req.Userid; // Assuming you're using JWT for authentication

    // Total number of customers
    const totalCustomers = await userModel.countDocuments();

    // Todays collections
    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");
    const todayCollections = await collectionModel.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Total collections made today
    const todayTotalAmount = await collectionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Weekly collections
    const weekStart = moment().startOf("week");
    const weekEnd = moment().endOf("week");
    const weeklyCollections = await collectionModel.find({
      createdAt: { $gte: weekStart, $lte: weekEnd },
    });

    // Total collections made this week
    const weeklyTotalAmount = await collectionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Monthly collections
    const monthStart = moment().startOf("month");
    const monthEnd = moment().endOf("month");
    const monthlyCollections = await collectionModel.find({
      createdAt: { $gte: monthStart, $lte: monthEnd },
    });

    // Total collections made this month
    const monthlyTotalAmount = await collectionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Total collections made by the user
    const userCollections = await collectionModel.find({
      createdByUser: userId,
    });

    // Calculate total collections
    const totalCollections = await collectionModel.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      totalCustomers,
      todayCollections: todayCollections.length,
      todayTotalAmount:
        todayTotalAmount.length > 0 ? todayTotalAmount[0].totalAmount : 0,
      weeklyCollections: weeklyCollections.length,
      weeklyTotalAmount:
        weeklyTotalAmount.length > 0 ? weeklyTotalAmount[0].totalAmount : 0,
      monthlyCollections: monthlyCollections.length,
      monthlyTotalAmount:
        monthlyTotalAmount.length > 0 ? monthlyTotalAmount[0].totalAmount : 0,
      userCollections: userCollections.length,
      totalCollections:
        totalCollections.length > 0 ? totalCollections[0].totalAmount : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCollectionData = async (req: any, res: any, next: any) => {
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




exports.getCustomerStatistics = async (req: { customerId: any; }, res: { json: (arg0: { totalAmountLast30Days: any; totalAmountLast7Days: any; totalAmountToday: any; }) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: unknown; }): void; new(): any; }; }; }, next: any) => {
  try {
    // Fetch collections for the customer
    const collections = await collectionModel.find({
      customer_id: req.customerId,
    });

    // Calculate dates for the last 30 days, last 7 days, and today
    const today = moment();
    const last30Days = moment().subtract(30, 'days');
    const last7Days = moment().subtract(7, 'days');

    // Filter collections for the last 30 days
    const collectionsLast30Days = collections.filter((collection: { date: moment.MomentInput; }) =>
      moment(collection.date, 'MM/DD/YYYY').isBetween(last30Days, today)
    );

    // Filter collections for the last 7 days
    const collectionsLast7Days = collections.filter((collection: { date: moment.MomentInput; }) =>
      moment(collection.date, 'MM/DD/YYYY').isBetween(last7Days, today)
    );

    // Filter collections for today
    const collectionsToday = collections.filter((collection: { date: moment.MomentInput; }) =>
      moment(collection.date, 'MM/DD/YYYY').isSame(today, 'day')
    );

    // Calculate total amount for the last 30 days
    const totalAmountLast30Days = collectionsLast30Days.reduce((total: any, collection: { amount: any; }) => {
      return total + collection.amount;
    }, 0);

    // Calculate total amount deposited for the last 7 days
    const totalAmountLast7Days = collectionsLast7Days.reduce((total: any, collection: { amount: any; }) => {
      return total + collection.amount;
    }, 0);

    // Calculate total amount deposited today
    const totalAmountToday = collectionsToday.reduce((total: any, collection: { amount: any; }) => {
      return total + collection.amount;
    }, 0);

    // Prepare response object
    const statistics = {
      totalAmountLast30Days,
      totalAmountLast7Days,
      totalAmountToday
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