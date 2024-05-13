"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAmountAndStatus = exports.getEditReqListAdmin = exports.deleteEditRequest = exports.getAllEditRequests = exports.createEditRequest = void 0;
const collectionModel = require("../models/collectionModel");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const EditRequest = require("../models/editRequestModel");
// Create
exports.createEditRequest = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const editRequest = yield EditRequest.create(req.body);
        editRequest.userId = req.Userid;
        editRequest.save();
        console.log(editRequest);
        res.status(201).json({ success: true, data: editRequest });
    }
    catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.invoice_id) {
            return res
                .status(400)
                .json({ success: false, message: "Invoice ID already exists" });
        }
        res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
}));
// Read all
exports.getAllEditRequests = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const editRequests = yield EditRequest.find({ userId: req.Userid });
    res.status(200).json({ success: true, data: editRequests });
}));
// Delete
exports.deleteEditRequest = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const editRequest = yield EditRequest.findByIdAndDelete(req.params.id);
    if (!editRequest) {
        return res
            .status(404)
            .json({ success: false, message: "Edit request not found" });
    }
    res
        .status(200)
        .json({ success: true, message: "Edit request deleted successfully" });
}));
// admin
exports.getEditReqListAdmin = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const editRequests = yield EditRequest.find({ status: "pending" });
    res.status(200).json({ success: true, data: editRequests });
}));
exports.updateAmountAndStatus = catchAsyncErrors((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { invoice_id, newAmount } = req.body;
    const editRequest = yield EditRequest.findOne({ invoice_id });
    if (!editRequest) {
        return res.status(404).json({ success: false, message: "Edit request not found" });
    }
    const collectionDocument = yield collectionModel.findOneAndUpdate({ invoice_id }, { $set: { amount: newAmount } }, { new: true });
    if (!collectionDocument) {
        return res.status(404).json({ success: false, message: "Collection document not found" });
    }
    editRequest.status = "accepted";
    yield editRequest.save();
    // Respond with success message
    res.status(200).json({ success: true, message: "Amount updated and status changed to accepted" });
}));
