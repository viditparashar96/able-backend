"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const collectionSchema = new mongoose_1.default.Schema({
    invoice_id: {
        type: String,
        unique: true,
    },
    ifcreatedByUser: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
    },
    ifCreatedByAdmin: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "customer",
    },
}, { timestamps: true });
const CollectionModel = mongoose_1.default.model("collection", collectionSchema);
module.exports = CollectionModel;
