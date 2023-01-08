import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Admin from "../../models/Admin.js";
import sendMail from "../../utils/sendMail.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import ResetPasswordTemplate from "../../views/reset-password.js"

// @desc    Auth admin & get token
// @route   POST /api/v1/admin/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { emailUsername, password } = req.body;

  // Check for admin
  const admin = await Admin.findOne({
    $or: [{ email: emailUsername }, { username: emailUsername }],
  })
    .populate('role', 'name')
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

  admin.ability = admin.getRoleAbilities();

  req.user = admin;

  return res.json(getTokenResponse(req.user));
});

// @desc      Log admin out / clear cookie
// @route     GET /api/v1/admin/logout
// @access    Private
const logout = asyncHandler(async (req, res) => {
  req.user.tokenIdentifier = null;
  await req.user.save();
  res.json({});
});

// @desc      Forgot password
// @route     POST /api/v1/admin/forgotpassword
// @access    Public
const forgotPassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });

  if (!admin) {
    res.status(400);
    throw new Error(req.t("not-found", { ns: 'validations', key: req.t("user") }));
  }

  const resetToken = admin.getResetPasswordToken();
  await admin.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.FRONT_BASEURL}/reset-password/${resetToken}`;
  const ipAddress = req.socket.remoteAddress;
  const recipient = { name: admin.fullName, email: admin.email };

  const template = new ResetPasswordTemplate(resetUrl, recipient, ipAddress, process.env.FRONT_BASEURL)
  try {
    await sendMail({
      to: admin.email,
      subject: req.t("reset-password"),
      html: template.render(),
    });

    return res.json({ message: "Email sent" });
  } catch (err) {
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save({ validateBeforeSave: false });

    res.status(400);
    throw new Error(err);
  }
});

// @desc      Reset password
// @route     PUT /api/v1/admin/reset-password/:token
// @access    Public
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const admin = await Admin.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!admin) {
    res.status(400);
    throw new Error(req.t("invalid", { ns: 'validations', key: req.t("token") }));
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error(req.t("confirm-password", { ns: 'validations' }));

  } else {
    // Set new password
    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();
  }

  return res.send();
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error(req.t("invalid", { ns: 'validations', key: req.t("data") }));
  }

  const { id, tokenIdentifier } = jwt.decode(refreshToken);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(401);
    throw new Error(req.t("invalid", { ns: 'validations', key: "data" }));
  }

  const user = await Admin.findById(id).select("+password").populate('role', 'name');

  if (user.tokenIdentifier === tokenIdentifier && user.verifyToken(refreshToken, "refresh"))
    return res.json(getTokenResponse(user));

  res.status(401);
  throw new Error(req.t("invalid", { ns: 'validations', key: "data" }));
});

// Get token from model
const getTokenResponse = (user) => {
  const { accessToken, refreshToken } = user.getSignedJwtToken();
  return {
    userData: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      admin: user.role,
      image: user.image,
      gender: user.gender,
      superAdmin: user.isSuperAdmin,
      role: user.role?.name,
      ability: user.ability,
      theme: user.theme,
      publicId: user.publicId
    },
    accessToken,
    refreshToken,
  };
};

export default { login, forgotPassword, resetPassword, refreshToken, logout };
