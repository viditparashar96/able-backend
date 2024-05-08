import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    invoice_id: {
      type: String,
      unique: true,
    },
    ifcreatedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    ifCreatedByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },
    date: {
      type: String,
    },

    cashierInfo: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    customerInfo: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },

    amount: {
      type: Number,
    },

    notes: {
      type: String,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
    },
  },
  { timestamps: true }
);

const CollectionModel = mongoose.model("collection", collectionSchema);

module.exports = CollectionModel;
