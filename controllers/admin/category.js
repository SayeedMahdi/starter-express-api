import asyncHandler from "express-async-handler";
import Category from "../../models/Category.js";
import mongoose from "mongoose";

// @desc    Get all categories
// @route   GET /api/v1/admin/blog/categories
// @access  private/admin
const getCategories = (req, res, next) => {
  req.database = {
    model: Category
  }

  if (req.query.hasOwnProperty('q') && req.query.q.length > 0) {
    req.database.search = {
      '$or': [
        { 'name': { $regex: req.query['q'], $options: 'i' } },
        { 'slug': { $regex: req.query['q'], $options: 'i' } },
      ]
    }
  }

  next();
};

// @desc    Get single category
// @route   GET /api/v1/admin/category/:id
// @access  private/admin
const getCategory = asyncHandler(async ({ params: { id }, t }, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return next();

  const category = await Category.findOne({ _id: id });

  if (!category) {
    res.status(400);
    throw new Error(t("not-found", { ns: 'validations', key: t("category") }));
  }

  res.json(category);
});

// @desc    Create an  category
// @route   POST /api/v1/admin/category
// @access  private/admin
// @validator createSchema middleware/validators/category
const createCategory = asyncHandler(async (req, res) => {
  req.body.creatorId = req.user.id;

  const category = await Category.create({
    ...req.body,
    name: {
      fa: req.body.name
    }
  });

  res.status(201).json(category);
});

// @desc    Update an existing  category
// @route   PUT /api/v1/admin/category/:id
// @access  private/admin
// @validator updateSchema middleware/validators/category
const updateCategory = asyncHandler(async ({ params: { id }, body, user, t }, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return next();

  const category = await Category.findOneAndUpdate({ _id: id }, {
    type: body.type,
    slug: body.slug,
    $set: { 'name.fa': body.name },
    updatorId: user.id
  });

  if (!category) {
    res.status(400);
    throw new Error(t("not-found", { ns: 'validations', key: t("category") }));
  }

  res.json(category);
});

// @desc    Delete an existing  category
// @route   DELETE /api/v1/admin/category/:id
// @access  private/admin
// @validator deleteSchema middleware/validators/category
const deleteCategory = asyncHandler(async ({ user, params: { id }, t }, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return next();

  const category = await Category.findOne({ _id: id });

  if (!category) {
    res.status(400);
    throw new Error(t("not-found", { ns: 'validations', key: t("category") }));
  }

  await category.delete(user.id);

  res.json({});
});

// @desc      Update category locals
// @route     PUT api/v1/admin/categories/:id/update-locals
// @access    private/admin
const updateLocals = asyncHandler(async ({ body, params: { id }, t }, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(id)) return next();

  let category = await Category.findOne({ _id: id });

  if (!category) {
    res.status(404);
    throw new Error(t("not-found", { ns: 'validations', key: t("category") }));
  }

  category = await Category.findOneAndUpdate({ _id: id }, {
    name: {
      fa: body['name-fa'],
      ps: body['name-ps'],
      en: body['name-en'],
    }
  }, {
    new: true,
    runValidators: true,
  });

  res.json(category);
});


export default { getCategories, getCategory, createCategory, updateCategory, deleteCategory, updateLocals };