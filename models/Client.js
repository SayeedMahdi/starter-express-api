import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import speakeasy from "speakeasy";
import { t } from "i18next"
import sendMail from "../utils/sendMail.js";
import bcrypt from "bcryptjs";
import EmailVerificationTemplate from "../views/verify-email.js";
import OtpVerificationTemplate from "../views/verification-otp.js";

const ClientSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      index: true,
      match: [
        /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    new_email: String,
    update_secret: {
      type: Object,
      select: false,
      default: speakeasy.generateSecret({ length: 32 })
    },
    publicId: {
      type: String
    },
    country: String,
    image: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    auth_secret: {
      type: Object,
      select: false,
      default: speakeasy.generateSecret({ length: 32 })
    },
    notifications: {
      type: Boolean,
      default: true
    },
    tokenIdentifier: {
      type: String,
      select: false
    },
    lastLogin: Date,
    profileStatus: {
      type: String,
      enum: ['complete', 'incomplete'],
      default: 'incomplete'
    },
    deletedAt: Date,
    suspendedAt: Date,
    resetPasswordToken: String,
    verifiedAt: {
      type: Date,
      default: null
    },
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt
ClientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match users entered password to hashed password in database
ClientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

ClientSchema.methods.generateAccessToken = async function () {
  let payload = { id: this._id }

  return jwt.sign(
    payload,
    process.env.JWT_CLIENT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  )
};

ClientSchema.methods.generateRefreshToken = async function () {
  let payload = { id: this._id }

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  )
};

ClientSchema.methods.getOneTimePassword = function () {
  return speakeasy.totp({
    secret: this.auth_secret.base32,
    algorithm: 'sha512',
    encoding: 'base32',
    step: process.env.OTP_STEP || 60
  });
}

ClientSchema.methods.verifyOneTimePassword = function (otp) {
  return speakeasy.totp.verify({
    secret: this.auth_secret.base32,
    algorithm: 'sha512',
    encoding: 'base32',
    token: otp,
    step: process.env.OTP_STEP || 60,
    window: 1,
  });
};

// Generate and hash password token
ClientSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};


ClientSchema.methods.sendOTP = function (method) {
  const OTP = this.getOneTimePassword();

  // const to = method === "email" ? this.email : this.phoneNumber

  // const message = t("otp-code", {ns: "messages", otp: OTP});
  const emailContent = new EmailVerificationTemplate(OTP, this, this.ipAddress, process.env.FRONT_BASEURL)

  // if (method === "phoneNumber") return sendSMS(to, message);

  // if (method === "email")
  return sendMail({
    to: this.email,
    subject: t("verification", { ns: "messages" }),
    html: emailContent.render(),
  });
};

ClientSchema.methods.sendEmailVerificationToken = function () {
  const token = speakeasy.totp({
    secret: this.update_secret.base32,
    algorithm: 'sha512',
    encoding: 'base32',
    step: process.env.OTP_STEP_EMAIL || 120
  });

  const emailContent = new OtpVerificationTemplate(token, this.email, process.env.FRONT_BASEURL, t)

  return sendMail({
    to: this.email,
    subject: `${t("verification", { ns: "messages" })} - ${token}`,
    html: emailContent.render()
  })
}

ClientSchema.methods.verifyEmailVerificationToken = function (otp) {
  return speakeasy.totp.verify({
    secret: this.update_secret.base32,
    algorithm: 'sha512',
    encoding: 'base32',
    token: otp,
    step: process.env.OTP_STEP_EMAIL || 120,
    window: 1,
  });
};

const Client = mongoose.model("Client", ClientSchema);

export default Client;
