import asyncHandler from "express-async-handler";
import Blog from "../../models/Blog.js";
import Category from "../../models/Category.js";
import Media from "../../models/Media.js";
import mongoose from "mongoose";

const BlogController = {
  // @desc      Get all post
  // @route     GET /api/v1/admins/blog
  // @access    public
  getBlogs: asyncHandler(async (req, res, next) => {
    req.database = {
      model: Blog,
      search: {},
      populate: [
        { path: "categories", select: "name slug -_id" },
        { path: "author", select: "fullName image" },
        { path: "comments.author", select: "fullName image publicId" },
        { path: "image", select: "publicId path" }
      ],
    };

    req.query.sortColumn = req.query.sortColumn || "publishedAt";

    if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
      req.database.search["$or"] = [
        { "title.fa": { $regex: req.query["q"], $options: "i" } },
        { "title.ps": { $regex: req.query["q"], $options: "i" } },
        { "title.en": { $regex: req.query["q"], $options: "i" } }
      ]
    }

    if (req.query?.filter?.length > 0 && req.query?.date?.length > 0) {
      req.database.search['publishedAt'] = req.query.filter === '_new' ? { $gt: req.query.date } : { $lt: req.query.date }
    }

    next();
  }),

  // @desc      Get single post by id
  // @route     GET /api/v1/admin/blog/:id
  // @access    private
  getBlog: asyncHandler(async ({ params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    const blog = await Blog
      .findOneWithDeleted({ _id: id })
      .populate("author", "fullName image") // Post Created by admin
      .populate("categories", "name")
      .populate("image", "publicId path")
      .populate("comments.author", "fullName image publicId"); // comments by admin/client

    if (!blog) {
      res.status(404);
      return next(new Error(t("not-found", { ns: 'validation', key: "post" })));
    }

    res.json(blog);
  }),

  // @desc      Get blog Categories
  // @route     GET /api/v1/admin/blog/categories
  // @access    private
  getCategories: asyncHandler(async (req, res) => {
    const categories = await Category.find({ type: 'blog' })
    res.json(categories);
  }),

  // @desc    Create a post
  // @route   POST /api/v1/blog
  // @access  private
  createBlog: asyncHandler(async ({ body, user, file }, res, next) => {
    let media;
    let data = {
      ...body,
      author: user.id,
      title: {
        fa: body.title
      },
      content: {
        fa: body.content
      },
      excerpt: {
        fa: body.excerpt
      }
    }

    data.categories = body?.categories?.length > 0 ? body.categories.split(',').filter(categoryId => mongoose.Types.ObjectId.isValid(categoryId)) : []

    try {
      if ('image' in data) {
        delete data['image']
      }
      if (body.imageId?.length > 0 && mongoose.Types.ObjectId.isValid(body.imageId)) {
        data.image = body.imageId
      }

      if (body.images.length > 0) {
        const sizes = {};
        const originalName = {};

        body?.images?.map(img => {
          img.type === 'original' &&
            Object.keys(img).forEach(key => originalName[key] = img[key]);
          return sizes[`${img.type}`] = img.path;
        });

        media = await Media.create({
          ...originalName,
          sizes,
          creatorId: user?._id
        });

        data.image = media._id;

        if (!media) {
          throw new Error(t("messages:failed"));
        }
      }

      let blog = await Blog.create(data);
      blog = await blog.populate("image", "publicId  path");

      return res.status(201).json(blog);

    } catch (err) {
      res.status(500);
      if (media) {
        media.remove();
      }
      return next(err)
    }


  }),

  // @desc    Update a post
  // @route   PUT /api/v1/blog/:id
  // @access  Private
  updateBlog: asyncHandler(async ({ body, params, t, user }, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(params.id)) return next();

    if (!await Blog.findOne({ _id: params.id })) {
      res.status(404);
      throw new Error(t("not-found", { ns: 'validation', key: "post" }))
    }

    let media;
    let data = {};
    try {
      if (body.imageId?.length > 0 && mongoose.Types.ObjectId.isValid(body.imageId)) {
        data.image = body.imageId
      }

      // Create Different Sizes of Uploaded Media
      if (body.images.length > 0) {
        const sizes = {};
        const originalName = {};

        body?.images?.map(img => {
          img.type === 'original' &&
            Object.keys(img).forEach(key => originalName[key] = img[key]);
          return sizes[`${img.type}`] = img.path;
        });

        media = await Media.create({
          ...originalName,
          sizes,
          creatorId: user?._id
        });

        data.image = media._id;

        if (!media) {
          throw new Error(t("messages:failed"));
        }
      }

      data.categories = body.categories.length > 0 ? body.categories.split(',').filter(categoryId => mongoose.Types.ObjectId.isValid(categoryId)) : []

      const blog = await Blog.findOneAndUpdate({ _id: params.id }, {
        $set: {
          ...data,
          updaterId: user.id,
          "title.fa": body["title"],
          "content.fa": body["content"],
          "excerpt.fa": body["excerpt"],
          slug: body.slug,
          status: body.status,
        },
      }, {
        new: true,
        runValidators: true,
      }).populate("image", "publicId path");

      res.json(blog);

    } catch (err) {
      res.status(500);
      if (media) {
        media.remove();
      }
      return next(err)
    }


  }
  ),

  // @desc      Update blog locals
  // @route     PUT api/v1/admin/blog/:id/update-local-blog
  // @access    private/admin
  updateLocal: asyncHandler(async ({ body, params, t }, res) => {
    let blog = await Blog.findOne({ _id: params.id })

    if (!blog) {
      res.status(404);
      throw new Error(t("not-found", { ns: 'validation', key: "post" }));
    }
    blog = await Blog.findOneAndUpdate({ _id: params.id }, {
      $set: {
        "title.fa": body["title-fa"], "content.fa": body["content-fa"], "excerpt.fa": body["excerpt-fa"],
        "title.ps": body["title-ps"], "content.ps": body["content-ps"], "excerpt.ps": body["excerpt-ps"],
        "title.en": body["title-en"], "content.en": body["content-en"], "excerpt.en": body["excerpt-en"]
      },
    }, {
      new: true,
      runValidators: true,
    });

    res.json(blog);
  }),

  // @desc    Delete a post
  // @route   DELETE /api/v1/admin/blog/:id
  // @access  Private
  deleteBlog: asyncHandler(async ({ user, params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    const blog = await Blog.findOne({ _id: id });

    if (!blog) {
      res.status(404);
      return next(new Error(t("not-found", { ns: 'validation', key: "post" })));
    }

    await blog.delete(user._id);

    res.json({});
  }),

  // @desc    Post viewer
  // @route   Put On single Post
  // @access  Private
  blogViewer: asyncHandler(async ({ id, views }) => {
    await Blog.findByIdAndUpdate({ _id: id }, { $set: { "views": views + 1 } }, {
      new: true,
      runValidators: true,
    })
  }),

  // @desc    Delete a Blog permanently
  // @route   DELETE /api/v1/admin/blog/trash/:id/permanent
  // @access  Private
  permanentDeleteBlog: asyncHandler(
    async ({ params: { id }, t }, res, next) => {
      if (!mongoose.Types.ObjectId.isValid(id)) return next();

      const blog = await Blog.findOneDeleted({ _id: id });

      if (!blog) {
        res.status(404);
        return next(new Error(t("not-found", { ns: 'validation', key: "post" })));
      }
      await Blog.findByIdAndDelete(id);

      res.json({});
    }
  ),

  // @desc      Get all trash post
  // @route     GET /api/v1/posts/trash/
  // @access    private
  getTrash: asyncHandler(async (req, res, next) => {
    req.database = {
      model: Blog,
      deleted: true,
      populate: [
        { path: "categories", select: "name slug -_id" },
        { path: "author", select: "fullName image" },
        { path: "image", select: "name path sizes" },
        { path: "comments.author", select: "fullName image" },
      ],
    };

    if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
      req.database.search = {
        ...req.database.search,
        title: { $regex: req.query.q, $options: "i" },
      };
    }

    next();
  }),

  // @desc      Restore blog from trash
  // @route     POST /api/v1/posts/trash/restore
  // @access    private
  restoreBlog: asyncHandler(async ({ params: { id }, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    const blog = await Blog.findOneDeleted({ _id: id });

    if (!blog) {
      res.status(404);
      return next(new Error(t("not-found", { ns: 'validation', key: "post" })));
    }

    await blog.restore();

    res.json(blog);
  })
}


export default BlogController;
