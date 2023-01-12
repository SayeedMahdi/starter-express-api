import asyncHandler from "express-async-handler";
import Client from "../../models/Client.js";
import ResetPasswordTemplate from "../../views/reset-password.js";
import sendMail from "../../utils/sendMail.js";
import speakeasy from "speakeasy";
import jwt from "jsonwebtoken";

// @desc    Signup users
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const image = req.body.cloudinary?.url
  const publicId = req.body.cloudinary?.public_id

  const user = await Client.create({ fullName, email, password, image, publicId });

  if (!user) {
    res.status(500);
    throw new Error(req.t("failed", { ns: 'messages', key: req.t("user") }));
  }

  const accessToken = await user.generateAccessToken();

  await user.sendEmailVerificationToken();

  res.json({
    email: user.email,
    accessToken
  });

})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Client
    .findOne({ email })
    .select('+password')
    .exec();

  if (!user || !await user.matchPassword(password)) {
    res.status(404);
    throw new Error(req.t("invalid", { ns: 'validations', key: req.t("credentials") }));
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  const options = {
    httpOnly: true, //accessible only by web server 
    secure: process.env.NODE_ENV === "production", //https 
    SameSite: 'Lax', //cross-site cookie  
    maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
  };

  res.status(200)
    .cookie("token", refreshToken, options)
    .json({
      id: user["_id"] || null,
      fullName: user["fullName"] || null,
      email: user["email"] || null,
      verifiedAt: user["verifiedAt"] || null,
      image: user["image"] || null,
      publicId: user["publicId"] || null,
      accessToken
    });
})

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies

  if (!cookies?.token) return res.status(401).json({ message: 'no cookie Unauthorized' })

  const refreshToken = cookies.token

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbidden' })

      const foundUser = await Client.findOne({ id: decoded.id }).exec()

      if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

      const accessToken = await foundUser.generateAccessToken();

      res.json({
        id: foundUser["_id"] || null,
        fullName: foundUser["fullName"] || null,
        email: foundUser["email"] || null,
        verifiedAt: foundUser["verifiedAt"] || null,
        image: foundUser["image"] || null,
        publicId: foundUser["publicId"] || null,
        accessToken
      });
    }
  )
}

const resendToken = asyncHandler(async (req, res) => {
  const { body, t } = req;
  const user = await Client.findOne({ email: body.email }).select('+update_secret').exec();

  if (user.verifiedAt) {
    throw new Error(t("already-activated"))
  }

  user.sendEmailVerificationToken();

  res.json({});
})

const verifyEmail = asyncHandler(async (req, res) => {
  const { body, t } = req;

  const user = await Client.findOne({ email: body.email }).select("+update_secret").exec();

  if (!user) {
    throw new Error(t('messages:not-found', { key: t("email") }));
  }

  if (user.verifiedAt) {
    throw new Error(t('messages:already-verified'));
  }

  const verify = user.verifyEmailVerificationToken(body.token);

  if (!verify) {
    throw new Error(t('validations:invalid', { key: t('token') }))
  }

  user.verifiedAt = new Date()

  await user.save();

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  const options = {
    httpOnly: true,                    //accessible only by web server  
    sameSite: 'None',                //cross-site cookie 
    maxAge: 5 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
  };

  // Create secure cookie with refresh token 
  res.cookie('jwt', refreshToken, options);

  if (process.env.NODE_ENV === "production") {
    options.secure = true; //https
  }

  return res.json({
    id: user["_id"] || null,
    fullName: user["fullName"] || null,
    email: user["email"] || null,
    verifiedAt: user["verifiedAt"] || null,
    image: user["image"] || null,
    publicId: user["publicId"] || null,
    accessToken
  });
})

// @desc      Forgot password
// @route     POST /api/v1/forgot-password
// @access    Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await Client.findOne({ email: req.body.email }).select("+update_secret").exec();

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
// @route     PUT /api/v1/reset-password
// @access    Public
const resetPassword = asyncHandler(async (req, res) => {
  const { otpCode, newPassword, email } = req.body;

  const user = await Client.findOne({ email: email, resetPasswordToken: otpCode }).select("+update_secret").exec();

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

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies
  if (!cookies?.token) return res.sendStatus(204) //No content

  res.clearCookie('token', {
    httpOnly: true, //accessible only by web server 
    secure: process.env.NODE_ENV === "production", //https 
    SameSite: 'Lax', //cross-site cookie  
  })

  res.json({ message: 'Cookie cleared' })
}

const AuthController = {
  login,
  logout,
  refresh,
  register,
  verifyEmail,
  resendToken,
  resetPassword,
  forgotPassword
}

export default AuthController