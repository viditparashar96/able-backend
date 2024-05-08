import express, { Express, Request, Response } from "express";
const app = express();
var cors = require("cors");

const corsOptions = {
  origin: ['http://localhost:3000','https://able-frontend-gouravshandilya69s-projects.vercel.app'], // Allow requests from all origins
  credentials: true // Allow credentials (e.g., cookies)
};

// Apply CORS middleware with options
app.use(cors(corsOptions));



//env
import dotenv from "dotenv";
dotenv.config();

//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//sessions and cookie
const session = require("express-session");
const cookieparser = require("cookie-parser");
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);
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
import { generatedErrors } from "./middleware/errors";
app.all("*", (req: any, res: any, next: any) => {
  next(new errorHandler(`requested url not found ${req.url}`), 404);
});
app.use(generatedErrors);

export { app };
