"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendtoken = void 0;
const sendtoken = (user, statusCode, res) => {
    const token = user.getJwtToken();
    const options = {
        expires: new Date(Date.now() +
            //   process.env.COOKIE_EXPIRE
            1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // secure:true
    };
    res
        .status(statusCode)
        // .cookie("token", token, options)
        .json({ success: true, user: user, serviceToken: token });
};
exports.sendtoken = sendtoken;
