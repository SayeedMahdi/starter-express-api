import asyncHandler from "express-async-handler";
import Client from "../../models/Client.js";
import OtpVerificationTemplate from "../../views/verification-otp.js";
import sendMail from "../../utils/sendMail.js";

const ProfileController = {
  /**
   *  @desc      Get single client
   *  @route     GET /api/v1/client/profile
   *  @access    private
   */
  getUserInfo: asyncHandler(async ({ user }, res) => {
    return res.json(user || {})
  }),

  /**
   *  @desc    Update a client/users
   *  @route   PUT /api/v1/client/profile
   *  @access  Private
   *  @validator validators/clients/profile.js
   */
  updateUser: asyncHandler(async (req, res, next) => {

    const { user, body, file } = req;
    body.id = user?._id;
    // body.image = file?.path;
    body.image = body?.cloudinary?.secure_url || null;
    body.publicId = body?.cloudinary?.public_id;

    const updateFields = {};

    for (const property in body) {
      if (property === "email" && body[property] !== user.email) {
        updateFields["new_email"] = body[property];
        continue;
      }
      if (body[property]) {
        updateFields[property] = body[property];
      }
    }

    const updatedUser = await Client.findOneAndUpdate({ _id: user.id }, {
      ...updateFields,
      profileStatus: "complete",
    }, { new: true }).select('-createdAt -updatedAt -__v');

    if (updatedUser.new_email) {
      return ProfileController.sendEmailUpdateToken(req, res, next);
    }

    return ProfileController.sendResponse(updatedUser, res);
  }),
  /**
   * @desc    Send Email Verification Token On email Update
   * @route   POST /api/v1/client/profile/email/verify
   * @access  Private/Client
   */
  verifyEmail: asyncHandler(async (req, res, next) => {
    const { body, t, user: reqUser } = req;

    const user = await Client.findById(reqUser._id).select("+update_secret").exec();

    const verify = user.verifyEmailVerificationToken(body.token);

    if (!verify) {
      throw new Error(t("validations:invalid", { key: t('token') }))
    }

    const updatedUser = await Client.findByIdAndUpdate(user._id, {
      email: user.new_email,
      new_email: null,
    }, { new: true });

    return ProfileController.sendResponse(updatedUser, res);
  }),
  /**
   * @desc    Send Email Verification Token On email Update
   * @route   POST /api/v1/client/profile/email/send-verification
   * @access  Private/Client
   */

  sendEmailUpdateToken: asyncHandler(async (req, res, next) => {
    const { headers, connection, t } = req;
    const user = await Client.findById(req.user._id).select('+update_secret').exec();

    if (!user.new_email) {
      throw new Error(t("already-verified", { ns: "messages" }))
    }

    const token = user.sendEmailVerificationToken()

    const ipAddress = headers['x-forwarded-for'] || connection.remoteAddress;

    const template = new OtpVerificationTemplate(token, user.new_email, ipAddress, t)

    await sendMail({
      to: user.new_email,
      subject: t("account-verification"),
      html: template.render(),
    });

    return res.json({ message: t("email-sent", { ns: "messages" }) });

  }),
  // @desc    Delete an admin
  // @route   POST /api/v1/client/profile/email/cancel-update
  // @access  Private/Client
  cancelEmailUpdate: asyncHandler(async (req, res, next) => {
    const { user, t } = req;
    if (!user.new_email) {
      throw new Error(t("messages:no-changes-found"))
    }

    const updatedUser = await Client.findByIdAndUpdate(user._id, {
      new_email: null
    }, { new: true });

    return ProfileController.sendResponse(user, res)
  }),
  // @desc    Delete an admin
  // @route   DELETE /api/v1/client/profile
  // @access  Private/Client
  deleteUser: asyncHandler(async ({ params: { id }, t }, res) => {
    const user = await Client.findOne({ _id: id });

    if (!user) {
      res.status(404);
      throw new Error(t("not-found", { ns: 'validations', key: t("user") }));
    }

    await user.delete()

    res.json({});
  }),

  sendResponse: (user, res) => {
    return res.json({
      id: user["_id"] || null,
      country: user["country"] || null,
      fullName: user["fullName"] || null,
      email: user["email"] || null,
      gender: user["gender"] || null,
      dateOfBirth: user["dateOfBirth"] || null,
      image: user["image"] || null,
      profileStatus: user["profileStatus"],
      new_email: user["new_email"] || null
      // accessToken: await user.getSignedJwtToken()
    })
  },

  otpVerification: asyncHandler(async (req, res, next) => {
    const { id, emailOTP, phoneNumberOTP } = req.body;
    // Get hashed token
    let user = await Client.findOne({ _id: id }).select("+secret");

    if (!user) throw new Error(req.t("invalid", { ns: 'validations', key: req.t("data") }));

    const emailVerify = await user.verifyOneTimePassword(emailOTP);
    const phoneNumberVerify = await user.verifyOneTimePassword(phoneNumberOTP);

    if (emailVerify || phoneNumberVerify) {
      user = await Client.findOneAndUpdate({ _id: user.id }, {
        ...req.body,
        profileStatus: "complete",
      }, { new: true }).select('-createdAt -updatedAt -__v');

      res.json({
        id: user["_id"] || null,
        country: user["country"] || null,
        fullName: user["fullName"] || null,
        email: user["email"] || null,
        gender: user["gender"] || null,
        dateOfBirth: user["dateOfBirth"] || null,
        image: user["image"] || null,
        profileStatus: user["profileStatus"]
      })

    } else {
      return next(new Error(req.t("invalid", { ns: 'validations', key: 'OTP' })));
    }
  }),

  /**
   * @desc  Change User Password
   * @route PUT /api/v1/client/change-password
   * @access Private/Client
   */
  changePassword: asyncHandler(async (req, res, next) => {
    const { body, user } = req;
    user.password = body.newPassword
    const updateUser = await user.save()
    res.json(updateUser);
  })
}

export default ProfileController
