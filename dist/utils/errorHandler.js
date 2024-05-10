"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
class errorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.message = message;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.errorHandler = errorHandler;
