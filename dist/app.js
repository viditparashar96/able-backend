"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
exports.app = app;
var cors = require("cors");
const corsOptions = {
    origin: ['http://localhost:3000', 'https://able-frontend.vercel.app'], // Allow requests from all origins
    credentials: true // Allow credentials (e.g., cookies)
};
// Apply CORS middleware with options
app.use(cors(corsOptions));
//env
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//body parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
//sessions and cookie
const session = require("express-session");
const cookieparser = require("cookie-parser");
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET,
}));
app.use(cookieparser());
//database
require("./models/database").connectDatabase();
//logger
const logger = require("morgan");
app.use(logger("tiny"));
//routes
app.use("/admin", require("./routes/adminRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/customer", require("./routes/customerRoutes"));
app.use("/invoice", require("./routes/invoiceRoutes"));
app.use("/collection", require("./routes/collectionRoutes"));
//error handling
const errorHandler = require("./utils/errorHandler");
const errors_1 = require("./middleware/errors");
app.all("*", (req, res, next) => {
    next(new errorHandler(`requested url not found ${req.url}`), 404);
});
app.use(errors_1.generatedErrors);
