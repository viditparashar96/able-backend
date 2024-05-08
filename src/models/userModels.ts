import mongoose, { Collection } from "mongoose";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userModel = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    // select:false
  },
  full_name: {
    type: String,
    required: true,
  },
  collection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collection",
    },
  ],
  mobile_number: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: "India",
  },
  dob: {
    type: String,
    // required: true,
  },
  zip_code: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userModel.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }
  let salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

userModel.methods.CompareUserPassword = function (password: any) {
  return bcrypt.compareSync(password, this.password);
};

userModel.methods.getJwtToken = function () {
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

const usermodel = mongoose.model("user", userModel);

module.exports = usermodel;
