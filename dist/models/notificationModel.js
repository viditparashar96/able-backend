"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationModel = new mongoose_1.default.Schema({
    notificationBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
const notificationmodel = mongoose_1.default.model("notification", notificationModel);
module.exports = notificationmodel;
