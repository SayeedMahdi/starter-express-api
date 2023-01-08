import asyncHandler from "express-async-handler";
import Package from "../../models/Package.js";
import mongoose from "mongoose";

const PackageController = {
  // @desc    Get all packages
  // @route   GET /api/v1/packages
  // @access  public
  getPackages: asyncHandler(async (req, res, next) => {
    const province = req.query.province;

    const packages = await Package.find({ province }).populate('category', 'name slug');

    res.json(packages);
  }),

  // @desc      Get single package
  // @route     GET /api/v1/packages/:id
  // @access    private
  getPackage: asyncHandler(async ({ params: { id }, t }, res) => {
    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id }

    const pack = await Package
      .findOne(filter)
      .populate("category", "name slug _id");

    if (!pack) {
      res.status(404);
      throw new Error(t("not-found", { ns: 'validations', key: t("package") }))
    }

    res.json(pack);
  }),

  // @desc    Get all categories and provinces
  // @route   GET /api/v1/packages/categories/provinces
  // @access  public
  getCategoriesAndProvinces: asyncHandler(async (req, res) => {
    const result = await Package.aggregate([
      {
        $group: {
          _id: "$province",
          categories: {
            $addToSet: "$category"
          }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories"
        },
      },
      {
        $project: {
          categories: {
            name: true,
            slug: true,
            _id: true
          }
        }
      },
      {
        $sort: {
          "_id": 1
        }
      }
    ])
    res.json(result);
  })
}

export default PackageController
