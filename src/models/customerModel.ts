import mongoose, { Collection } from "mongoose";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const customerSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
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
  zip_code: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  Collection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collection",
    },
  ],
});



customerSchema.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }
  let salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});


customerSchema.methods.compareCustomerPassword = function (password: any) {
  return bcrypt.compareSync(password, this.password);
};

customerSchema.methods.getJwtToken = function () {
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


const customermodel = mongoose.model("customer", customerSchema);

module.exports = customermodel;
