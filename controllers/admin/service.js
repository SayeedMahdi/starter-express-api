import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Service from "../../models/Service.js";
import path from "path";

const ServiceController = {
  // @desc    Get all Services
  // @route   GET /api/v1/admin/services
  // @access  public
  getServices: asyncHandler(async (req, res, next) => {
    req.database = {
      model: Service,
      search: {},
    };

    if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
      req.database.search["$text"] = { $search: `/${req.query["q"]}/i` };
    }

    next();
  }),

  // @desc    Get a Service
  // @route   GET /api/v1/admin/services/:id
  // @access  Private
  getService: asyncHandler(async ({ params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    const service = await Service.findOne({ _id: id });

    if (!service) {
      res.status(404);
      throw new Error(t("not-found", { ns: "validations", key: t("service") }));
    }

    res.json(service);
  }),

  // @desc    Create a Service
  // @route   POST /api/v1/admin/services
  // @access  private && superAdmin
  createService: asyncHandler(async ({ body, user }, res) => {
    body.creatorId = user.id;

    body.name = {
      fa: body.name,
    };

    body.description = {
      fa: body.description,
    };

    const service = await Service.create(body);

    res.status(201).json(service);
  }),

  // @desc      Update services locals
  // @route     PUT api/v1/admin/services/:id/update-locals
  // @access    private/admin
  updateLocals: asyncHandler(async ({ body, params, t }, res) => {
    let service = await Service.findOne({ _id: params.id });

    if (!service) {
      res.status(404);
      throw new Error(t("not-found", { ns: "validations", key: t("service") }));
    }

    service = await Service.findByIdAndUpdate(
      params.id,
      {
        $set: {
          "name.fa": body["name-fa"],
          "name.ps": body["name-ps"],
          "name.en": body["name-en"],
          "description.fa": body["description-fa"],
          "description.ps": body["description-ps"],
          "description.en": body["description-en"],
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(service);
  }),

  // @desc    Update Service
  // @route   PUT /api/v1/admin/services/:id
  // @access  Private && superAdmin
  updateService: asyncHandler(
    async ({ body, user, params: { id }, t }, res, next) => {
      if (!mongoose.Types.ObjectId.isValid(id)) return next();

      let service = await Service.findOne({ _id: id });

      if (!service) {
        res.status(404);
        throw new Error(
          t("not-found", { ns: "validations", key: t("service") })
        );
      }

      service = await Service.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            "name.fa": body.name,
            "description.fa": body.description,
          },
          icon: body.icon,
          updaterId: user.id,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.json(service);
    }
  ),

  // @desc    Delete Service
  // @route   DELETE /api/v1/admin/services/:id
  // @access  Private && superAdmin
  deleteService: asyncHandler(async ({ params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    let service = await Service.findOne({ _id: id });

    if (!service) {
      res.status(404);
      throw new Error(t("not-found", { ns: "validations", key: t("service") }));
    }

    await service.remove();

    res.json({});
  }),

  // @desc    Get Services Icon Options
  // @route   DELETE /api/v1/admin/services/icon-options
  // @access  Private && superAdmin
  getIconOptions: asyncHandler(async (req, res) => {
    const options = [
      {
        label: "Microwave",
        value: path.join("public", "svgs", "services", "Microwave.svg"),
      },
      {
        label: "Vsat",
        value: path.join("public", "svgs", "services", "Vsat.svg"),
      },
      {
        label: "Wifi",
        value: path.join("public", "svgs", "services", "Wifi.svg"),
      },
    ];

    res.json(options);
  }),
};

export default ServiceController;
