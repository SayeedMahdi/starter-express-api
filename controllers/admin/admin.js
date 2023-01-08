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
    body.creatorId = user.id;
    // body.image = file?.path || null;
    body.image = body?.cloudinary?.secure_url || null;
    body.publicId = body?.cloudinary?.public_id;
    body.isSuperAdmin = true;

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

  // @desc    Delete admin permanently
  // @route   DELETE /api/v1/admin/admin-users/trash/delete/:id/permanent
  // @access  Private
  permanentDeleteAdmin: asyncHandler(
    async ({ params: { id }, t }, res, next) => {
      if (!mongoose.Types.ObjectId.isValid(id)) return next();

      const admin = await Admin.findOneDeleted({ _id: id });

      if (!admin) {
        res.status(404);
        return next(
          new Error(t("not-found", { ns: "validations", key: t("admin") }))
        );
      }

      await Admin.findByIdAndDelete(id);

      res.json({});
    }
  ),

  // @desc      Get all trash admin
  // @route     GET /api/v1/admin/admin-users/trash
  // @access    private
  getTrash: asyncHandler(async (req, res, next) => {
    req.database = {
      model: Admin,
      deleted: true,
    };

    if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
      req.database.search = {
        ...req.database.search,
        title: { $regex: req.query.q, $options: "i" },
      };
    }

    next();
  }),

  // @desc      Restore Admin from trash
  // @route     POST /api/v1/admin/admin-users/trash/restore
  // @access    private
  restoreAdmin: asyncHandler(async ({ params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    const admin = await Admin.findOneDeleted({ _id: id });

    if (!admin) {
      res.status(404);
      return next(
        new Error(t("not-found", { ns: "validations", key: t("admin") }))
      );
    }

    await admin.restore();

    res.json(admin);
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

  // @desc    Get Current Admin roles
  // @route   GET /api/v1/admin/admin-users/roles
  // @access  Private/superAdmin
  getRoles: asyncHandler(async (req, res) => {
    res.json((await import("../../config/global.js")).adminRoles);
  }),

  /**
   * @desc Change current user preferences of theme
   * @route POST /api/v1/admin/admin-users/change-theme
   * @access Private/admin
   * @validator changeThemeSchema /middleware/validators/admin/admin
   */
  changeTheme: asyncHandler(async (req, res) => {
    const { user, body } = req;
    const updateResult = await Admin.updateOne(
      { _id: user.id },
      { theme: body.theme },
      { new: true }
    ).exec();
    return res.json(updateResult);
  }),
};

export default AdminController;
