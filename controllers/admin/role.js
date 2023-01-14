// import asyncHandler from "express-async-handler";
// import mongoose from "mongoose";
// import Role from "../../models/Role.js";

// const RoleController = {
//     // @desc      Get all roles
//     // @route     GET /api/v1/admin/roles
//     // @access    public
//     getRoles: asyncHandler(async (req, res, next) => {
//         req.database = {
//             model: Role,
//             search: {},
//         };

//         if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
//             req.database.search = { name: { $regex: req.query["q"], $options: "i" } };
//         }

//         next();
//     }),

//     // @desc      Get single role
//     // @route     GET /api/v1/admin/roles/:id
//     // @access    private
//     getRole: asyncHandler(async ({ params: { id }, t }, res, next) => {
//         if (!mongoose.Types.ObjectId.isValid(id)) return next();

//         const role = await Role.findOne({ _id: id });

//         if (!role) {
//             res.status(404);
//             return next(new Error(t("not-found", { ns: 'validations', key: t("role") })));
//         }

//         res.json(role);
//     }),

//     // @desc    Create a Role
//     // @route   POST /api/v1/admin/roles
//     // @access  private
//     createRole: asyncHandler(async ({ user, body, t }, res) => {
//         body.creatorId = user.id;
//         // body.permissions = JSON.parse(`${body?.permissions}`);

//         const role = await Role.create(body);

//         if (!role) {
//             res.status(500);
//             throw new Error(t("messages:failed"));
//         }

//         return res.status(201).json(role);
//     }),

//     // @desc    Update role
//     // @route   PUT /api/v1/admin/roles/:id
//     // @access  Private
//     updateRole: asyncHandler(
//         async ({ user, body, params, t }, res, next) => {
//             if (!mongoose.Types.ObjectId.isValid(params.id)) return next();

//             body.updaterId = user.id;
//             body.permissions = JSON.parse(`${body?.permissions}`);

//             const role = await Role.findOneAndUpdate({ _id: params.id }, body,
//                 {
//                     new: true,
//                     runValidators: true,
//                 });

//             if (!role) {
//                 res.status(404);
//                 throw new Error(t("not-found", { ns: 'validations', key: t("role") }))
//             }

//             res.json(role);
//         }
//     ),

//     // @desc    Delete a role
//     // @route   DELETE /api/v1/admin/roles/:id
//     // @access  Private
//     deleteRole: asyncHandler(async ({ params: { id }, t }, res, next) => {
//         if (!mongoose.Types.ObjectId.isValid(id)) return next();

//         const role = await Role.findOne({ _id: id });

//         if (!role) {
//             res.status(404);
//             return next(new Error(t("not-found", { ns: 'validations', key: t("role") })));
//         }

//         await role.remove()

//         res.json({});
//     }),
// }

// export default RoleController;
