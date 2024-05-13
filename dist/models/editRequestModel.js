"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const editRequestSchema = new mongoose_1.default.Schema({
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
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
const EditRequest = mongoose_1.default.model("editRequest", editRequestSchema);
module.exports = EditRequest;
