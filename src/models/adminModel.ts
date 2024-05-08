import mongoose from "mongoose";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminModel = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      // select: false,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    mobile_number: {
      type: String,
      minLength: 10,
      maxLength: 11,
      required: true,
    },
    dob: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
      default: "IN",
    },
    designation:{
      type:String,
      default:"Admin"
    },
    note:{
      type:String
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usermodel",
      },
    ],
    collection:[
      {
       type: mongoose.Schema.Types.ObjectId,
       ref: "collection",
      }
     ]
  },
  { timestamps: true }
);

adminModel.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }
  let salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

adminModel.methods.compareAdminPassword = function (password: any) {
  return bcrypt.compareSync(password, this.password);
};

adminModel.methods.getJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

const adminmodel = mongoose.model("admin", adminModel);

module.exports = adminmodel;
