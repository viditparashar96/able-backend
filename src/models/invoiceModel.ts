import mongoose from "mongoose";

const invoiceModel = new mongoose.Schema(
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
    status: {
      type: String,
    },
    date: {
      type: String,
    },
    dueDate: {
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

    invoice_detail: [
      {
        name: {
          type: String,
        },
        description: {
          type: String,
        },
        qty: {
          type: String,
        },
        price: {
          type: String,
        },
      },
    ],
    discount: {
      type: Number,
    },
    tax: {
      type: Number,
    },
    grandTotal: {
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

const invoicemodel = mongoose.model("invoice", invoiceModel);

module.exports = invoicemodel;
