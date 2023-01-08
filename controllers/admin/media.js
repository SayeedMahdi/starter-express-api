import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Media from "../../models/Media.js";

const MediaController = {
  // @desc      Get all media
  // @route     GET /api/v1/admin/media
  // @access    public
  getMedia: asyncHandler(async (req, res, next) => {
    req.database = {
      model: Media,
      search: {},
    };

    if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
      req.database.search["name"] = { $regex: req.query["q"], $options: "i" }
    }

    next();
  }),

  // @desc      Get single Media
  // @route     GET /api/v1/admin/media/:id
  // @access    private
  getSingleMedia: asyncHandler(async ({ params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    const media = await Media.findOne({ _id: id });

    if (!media) {
      res.status(404);
      return next(new Error(t("not-found", { ns: 'validations', key: t("image") })));
    }

    res.json(media);
  }),

  // @desc    Create a media
  // @route   POST /api/v1/admin/media
  // @access  private
  createMedia: asyncHandler(async ({ user, body, t }, res) => {
    console.log(body, body.images);
    const sizes = {};
    const originalName = {};

    body?.images?.map(img => {
      img.type === 'original' &&
        Object.keys(img).forEach(key => originalName[key] = img[key]);
      return sizes[`${img.type}`] = img.path;
    });

    const imageData = {
      ...originalName,
      sizes,
      // path: body?.cloudinary.secure_url || null,
      // publicId: body?.cloudinary.public_id,
      // creatorId: user?.id
      creatorId: '63ad5ecc5d78006d3581e6b6'
    };
    console.log(body?.images);

    const media = await Media.create(imageData);

    if (!media) {
      res.status(500);
      throw new Error(t("messages:failed"));
    }

    res.status(201).json(media);
  }),

  // @desc    Update media
  // @route   PUT /api/v1/admin/media/:id
  // @access  Private
  updateMedia: asyncHandler(
    async ({ user, body, params, t }, res, next) => {
      if (!mongoose.Types.ObjectId.isValid(params.id)) return next();

      // const sizes = {};
      // const originalName = {};

      // body?.images?.map(img => {
      //   img.type === 'original' &&
      //     Object.keys(img).forEach(key => originalName[key] = img[key]);
      //   return sizes[`${img.type}`] = img.path;
      // });

      const imageData = {
        // ...originalName,
        // sizes,
        path: body?.cloudinary.secure_url || null,
        creatorId: user?.id
      };

      const media = await Media.findOneAndUpdate({ _id: params.id }, imageData,
        {
          new: true,
          runValidators: true,
        });

      if (!media) {
        res.status(404);
        throw new Error(t("not-found", { ns: 'validations', key: t("media") }))
      }

      res.json(media);
    }
  ),

  // @desc    Delete a media
  // @route   DELETE /api/v1/admin/media/:id
  // @access  Private
  deleteMedia: asyncHandler(async ({ params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    console.log('media', id);

    const media = await Media.findOne({ _id: id });

    if (!media) {
      res.status(404);
      return next(new Error(t("not-found", { ns: 'validations', key: t("image") })));
    }

    await media.remove();

    res.json({});
  }),
}

export default MediaController;