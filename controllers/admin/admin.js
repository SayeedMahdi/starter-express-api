import asyncHandler from "express-async-handler";
import Admin from "../../models/Admin.js";
import mongoose from "mongoose";

const AdminController = {
  // @desc    Get all admins
  // @route   GET /api/v1/admin/admin-users
  // @access  private/superAdmin
  getAdmins: asyncHandler(async (req, res, next) => {
    req.database = {
      model: Admin,
      populate: [{ path: "role", select: "name" }],
    };

    if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
      req.database.search = {
        $or: [
          { fullName: { $regex: req.query["q"], $options: "i" } },
          { username: { $regex: req.query["q"], $options: "i" } },
          { email: { $regex: req.query["q"], $options: "i" } },
        ],
      };
    }

    next();
  }),

  // @desc      Get single admin
  // @route     POST /api/v1/admin/admin-users/:id
  // @access    private/superAdmin
  getAdmin: asyncHandler(async ({ user, params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next();
    }

    const admin = await Admin.findOne({ _id: id }).accessibleBy(user.ability);

    if (!admin) {
      res.status(400);
      throw new Error(t("not-found", { ns: "validations", key: t("admin") }));
    }

    res.json(admin);
  }),

  // @desc    Create an admin by SuperAdmin
  // @route   POST /api/v1/admin/admin-users
  // @access  private/superAdmin
  createAdmin: asyncHandler(async ({ user, body, file }, res) => {
    body.creatorId = user?.id;
    body.image = body.cloudinary.url;
    body.publicId = body.cloudinary.public_id;


    const admin = await Admin.create(body);

    res.status(201).json(admin);
  }),

  // @desc    Update an admin
  // @route   PUT /api/v1/admin/admin-users/:id
  // @access  Private/superAdmin
  updateAdmin: asyncHandler(
    async ({ user, body, file, params: { id }, t }, res, next) => {
      if (!mongoose.Types.ObjectId.isValid(id)) return next();

      body.updaterId = user.id;
      // body.image = file?.path || undefined;
      body.image = body?.cloudinary?.secure_url || undefined;
      body.publicId = body?.cloudinary?.public_id;

      const admin = await Admin.findOneAndUpdate({ _id: id }, body, {
        new: true,
        upsert: true,
      });

      if (!admin) {
        res.status(400);
        throw new Error(t("not-found", { ns: "validations", key: t("admin") }));
      }

      res.json(admin);
    }
  ),

  // @desc    Delete an admin
  // @route   DELETE /api/v1/admin/admin-users/:id
  // @access  Private/superAdmin
  deleteAdmin: asyncHandler(async ({ user, params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    const admin = await Admin.findOne({ _id: id }).accessibleBy(user.ability);

    if (!admin) {
      res.status(404);
      throw new Error(t("not-found", { ns: "validations", key: t("admin") }));
    }

    await admin.delete(user._id);

    res.status(200).json({});
  }),

  // @desc    Change password of admin
  // @route   PUT /api/v1/admin/admin-users/:id/changePassword
  // @access  Private/superAdmin
  // @validator updateSchema middleware/validators/admin/admin
  changePassword: asyncHandler(async ({ body, params: { id }, t }, res) => {
    const { password } = body;

    const admin = await Admin.findOne({ _id: id });
    admin.password = password;
    await admin.save();

    return res.json({
      message: t("success", { ns: "validation", key: t("password") }),
    });
  }),
};

export default AdminController;
