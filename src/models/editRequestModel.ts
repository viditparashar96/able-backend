import mongoose from "mongoose";

const editRequestSchema = new mongoose.Schema(
  {
    invoice_id: {
      type: String,
      unique: true,
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
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    newAmount: {
      type: Number,
    },
    oldAmount: {
      type: Number,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
  },
  { timestamps: true }
);

const EditRequest = mongoose.model("editRequest", editRequestSchema);

module.exports = EditRequest;
