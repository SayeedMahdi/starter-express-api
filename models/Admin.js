import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { accessibleRecordsPlugin } from "@casl/mongoose";
import defineRole from "../config/roles/defineRole.js";
import softDelete from 'mongoose-delete'

const AdminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      index: {
        unique: true,
      },
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    username: {
      type: String,
      index: {
        unique: true,
      },
      required: [true, "username is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    image: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
      required: [true, "Gender is required"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    },
    publicId: {
      type: String
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    rememberToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    tokenIdentifier: String,
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    }
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match users entered password to hashed password in database
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
AdminSchema.methods.getSignedJwtToken = function () {
  this.tokenIdentifier = crypto.randomUUID();
  this.lastLogin = new Date();
  this.save();
  return {
    accessToken: jwt.sign({ id: this._id, tokenIdentifier: this.tokenIdentifier }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    }),
    refreshToken: jwt.sign(
      { id: this._id, tokenIdentifier: this.tokenIdentifier },
      process.env.JWT_REFRESH_SECRET.concat(this.password),
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    ),
  };
};

// Verify JWT token
AdminSchema.methods.verifyToken = function (token, type = "access") {
  const secret =
    type === "access"
      ? process.env.JWT_SECRET
      : process.env.JWT_REFRESH_SECRET.concat(this.password);
  return jwt.verify(token, secret);
};

// Generate and hash password token
AdminSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

AdminSchema.methods.getRoleAbilities = function () {
  if (this.isSuperAdmin) return defineRole("manage", "all");
  else if (this.role?.name === "media") return defineRole("manage", "Blog");
  else if (this.role?.name === "sales") return defineRole("privilege ", "model");
  else return [];
};

AdminSchema.plugin(accessibleRecordsPlugin);
AdminSchema.plugin(softDelete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: true,
});

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
