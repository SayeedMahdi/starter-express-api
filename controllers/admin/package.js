import asyncHandler from "express-async-handler";
import Package from "../../models/Package.js";
import mongoose from "mongoose";
import Category from "../../models/Category.js";

const PackageController = {
  // @desc    Get all packages
  // @route   GET /api/v1/admin/packages
  // @access  private
  getPackages: asyncHandler(async (req, res, next) => {
    req.database = {
      model: Package,
      populate: [
        { path: "category", select: "name slug _id" },
      ]
    };

    if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
      req.database.search = {
        $or: [
          { 'name.fa': { $regex: req.query["q"], $options: "i" } },
          { 'name.en': { $regex: req.query["q"], $options: "i" } },
          { 'name.ps': { $regex: req.query["q"], $options: "i" } },
        ],
      };
    }

    next();
  }),

  // @desc      Get single package
  // @route     GET /api/v1/admin/packages/:id
  // @access    private
  getPackage: asyncHandler(async ({ params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    const pack = await Package
      .findOne({ _id: id })
      .populate("category", "name slug _id");

    if (!pack) {
      res.status(404);
      throw new Error(t("not-found", { ns: 'validations', key: t("package") }))
    }

    res.json(pack);
  }),

  // @desc    Get all categories and provinces
  // @route   GET /api/v1/admin/packages/categories
  // @access  private
  getCategoriesAndProvinces: asyncHandler(async (req, res) => {
    const categories = await Category.find({ type: 'package' }).select("slug name").lean();
    res.json(categories);
  }),

  // @desc      Update package locals
  // @route     PUT api/v1/admin/packages/:id/update-locals
  // @access    private/admin
  updateLocals: asyncHandler(async ({ body, params, t }, res) => {
    let pack = await Package.findOne({ _id: params.id });

    if (!pack) {
      res.status(404);
      throw new Error(t("not-found", { ns: 'validations', key: t('package') }));
    }

    pack = await Package.findByIdAndUpdate(params.id, {
      name: {
        fa: body['name-fa'],
        ps: body['name-ps'],
        en: body['name-en'],
      },
      description: {
        fa: body['description-fa'],
        ps: body['description-ps'],
        en: body['description-en'],
      },
      properties: body.properties,
      marker: {
        fa: body['marker-fa'],
        ps: body['marker-ps'],
        en: body['marker-en']
      }
    }, {
      new: true,
      runValidators: true,
    });

    res.json(pack);
  }),

  // @desc    Create a package
  // @route   POST /api/v1/admin/packages
  // @access  private && superAdmin
  createPackage: asyncHandler(async ({ body, user }, res) => {

    const newPackage = await Package.create({
      name: {
        fa: body.name
      },
      type: body.type,
      description: {
        fa: body.description
      },
      province: body.province,
      marker: {
        fa: body.marker
      },
      dailySpeed: body.dailySpeed,
      nightlySpeed: body?.nightlySpeed,
      priority: body.priority,
      duration: body.duration,
      category: body.category,
      slug: body.slug,
      properties: body.properties?.map(prop => ({ fa: prop })),
      isPlus: body["is-package-plus"],
      isHybrid: body["is-package-hybrid"],
      capacity: body["capacity"],
      price: {
        main: body.price,
        plus: body['plus-price']
      },
      bandwidth: {
        type: body['bandwidth-type'],
        amount: body.bandwidth,
      },
      creatorId: user.id
    });

    res.status(201).json(newPackage);
  }),

  // @desc    Update package
  // @route   PUT /api/v1/admin/packages/:id
  // @access  Private && superAdmin
  updatePackage: asyncHandler(async ({ body, user, params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    let pack = await Package.findOne({ _id: id });

    if (!pack) {
      res.status(404);
      throw new Error(t("not-found", { ns: 'validations', key: t('package') }));
    }
    const properties = body.properties?.map((prop, index) => ({
      ...pack?.properties[index]?._doc,
      fa: prop
    }));
    pack = await Package.findByIdAndUpdate({ _id: id }, {
      $set: {
        'name.fa': body.name,
        'description.fa': body.description,
        'marker.fa': body.marker,
      },
      type: body.type,
      slug: body.slug,
      province: body.province,
      priority: body.priority,
      duration: body.duration,
      category: body.category,
      isPlus: body["is-package-plus"],
      isHybrid: body["is-package-hybrid"],
      capacity: body["capacity"],
      price: {
        main: body.price,
        plus: body['plus-price']
      },
      bandwidth: {
        type: body['bandwidth-type'],
        amount: body.bandwidth
      },
      updatorId: user.id,
      properties,
    }, {
      new: true,
      runValidators: true,
    });

    res.json(pack);
  }),

  // @desc    Delete package
  // @route   DELETE /api/v1/admin/packages/:id
  // @access  Private && superAdmin
  deletePackage: asyncHandler(async ({ user, params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    const pack = await Package.findOne({ _id: id }).accessibleBy(user.ability);

    if (!pack) {
      res.status(404);
      throw new Error(t("not-found", { ns: 'validations', key: t('package') }));
    }

    await pack.delete(user._id);

    res.json({});
  }
  )
}


export default PackageController
