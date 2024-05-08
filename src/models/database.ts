const mongoose = require("mongoose");

exports.connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.db);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};
