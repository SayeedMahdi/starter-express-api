import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Admin from "../../models/Admin.js";
import sendMail from "../../utils/sendMail.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import ResetPasswordTemplate from "../../views/reset-password.js"
import { log } from "console";
import speakeasy from "speakeasy";

// @desc    Auth admin & get token
// @route   POST /api/v1/admin/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { emailUsername, password } = req.body;

  // Check for admin
  const admin = await Admin.findOne({
    $or: [{ email: emailUsername }, { username: emailUsername }],
  })
    .select("+password");

  if (!admin) {
    res.status(403);
    return next(new Error(req.t("invalid", { ns: 'validations', key: req.t("credentials") })));
  }

  if (!admin.isActive) {
    res.status(403);
    return next(new Error(
      req.t("admin-active", { ns: 'messages' })
    ));
  }

  // Check if password matches
  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return next(new Error(req.t("invalid", { ns: 'validations', key: req.t("credentials") })));
  }

  const accessToken = await admin.generateAccessToken();
  const refreshToken = await admin.generateRefreshToken();

  const options = {
    httpOnly: true, //accessible only by web server 
    secure: process.env.NODE_ENV === "production", //https 
    SameSite: 'Lax', //cross-site cookie  
    maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
  };

  res.status(200)
    .cookie("admin_token", refreshToken, options)
    .json({
      id: admin._id,
      fullName: admin.fullName,
      username: admin.username,
      email: admin.email,
      image: admin.image,
      publicId: admin.publicId,
      gender: admin.gender,
      superAdmin: admin.isSuperAdmin,
      isActive: admin.isActive,
      accessToken
    });
});

// @desc      Log admin out / clear cookie
// @route     GET /api/v1/admin/logout
// @access    Private
const logout = (req, res) => {
  const cookies = req.cookies
  if (!cookies?.admin_token) return res.sendStatus(204) //No content

  res.clearCookie('admin_token', {
    httpOnly: true, //accessible only by web server 
    secure: process.env.NODE_ENV === "production", //https 
    SameSite: 'Lax', //cross-site cookie  
  })

  res.json({ message: 'Cookie cleared' })
}

// @desc      Forgot password
// @route     POST /api/v1/admin/forgotpassword
// @access    Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await Admin.findOne({ email: req.body.email }).select("+update_secret").exec();

  if (!user) {
    res.statusCode = 400;
    throw new Error(req.t("not-found", { ns: 'validations', key: req.t("user") }));
  }

  const token = speakeasy.totp({
    secret: user.update_secret.base32,
    algorithm: 'sha512',
    encoding: 'base32',
    step: process.env.OTP_STEP_EMAIL || 120
  });

  user.resetPasswordToken = token;
  await user.save();
  // Create reset url
  const ipAddress = req.socket.remoteAddress;
  const recipient = { name: user.fullName, email: user.email };

  const template = new ResetPasswordTemplate(token, recipient, ipAddress)

  await sendMail({
    to: user.email,
    subject: `${req.t("reset-password")} - ${token}`,
    html: template.render(),
  });

  return res.json({ success: true, email: user.email });
})

// @desc      Reset password
// @route     PUT /api/v1/admin/reset-password/:token
// @access    Public
const resetPassword = asyncHandler(async (req, res) => {
  const { otpCode, newPassword, email } = req.body;

  const user = await Admin.findOne({ email: email, resetPasswordToken: otpCode }).select("+update_secret").exec();

  const verify = speakeasy.totp.verify({
    secret: user?.update_secret?.base32,
    algorithm: 'sha512',
    encoding: 'base32',
    token: otpCode,
    step: process.env.OTP_STEP_EMAIL || 120,
    window: 1,
  });

  if (!user || !verify) {
    res.statusCode = 400;
    throw new Error(req.t("invalid", { ns: 'validations', key: req.t("token") }));
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;

  await user.save();

  return res.json({ success: true });
})


const refreshToken = (req, res) => {
  const cookies = req.cookies

  if (!cookies?.admin_token) return res.status(401).json({ message: 'no cookie Unauthorized' })

  const refreshToken = cookies.admin_token

  jwt.verify(
    refreshToken,
    process.env.JWT_ADMIN_REFRESH_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden' })

      const foundUser = await Admin.findOne({ id: decoded.id }).exec()

      if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

      const accessToken = await foundUser.generateAccessToken();

      res.json({
        id: foundUser._id,
        fullName: foundUser.fullName,
        username: foundUser.username,
        email: foundUser.email,
        image: foundUser.image,
        publicId: foundUser.publicId,
        gender: foundUser.gender,
        superAdmin: foundUser.isSuperAdmin,
        isActive: foundUser.isActive,
        accessToken
      });
    }
  )
}


export default { login, forgotPassword, resetPassword, refreshToken, logout };
