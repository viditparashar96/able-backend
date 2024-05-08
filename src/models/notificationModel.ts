import mongoose from "mongoose";

const notificationModel = new mongoose.Schema({
  notificationBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  notification: [
    {
      notificationName: {
        type: String,
      },
      notificationTime: {
        type: String,
      },
    },
  ],
});

const notificationmodel = mongoose.model("notification", notificationModel);

module.exports = notificationmodel;
