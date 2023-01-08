import asyncHandler from "express-async-handler";
import Blog from "../../models/Blog.js";
import mongoose from "mongoose";

const CommentController = {
  // @desc    Create Reply Comment
  // @route   POST /api/v1/admin/blog/:id/comment/:commentId/reply
  // @access  private
  replyComment: asyncHandler(async ({ body, user, params, t }, res, next) => {
    const blog = await Blog.findOne({ _id: params.id });

    if (!blog) {
      res.status(404);
      throw new Error(t("not-found", { ns: "validations", key: t("blog") }));
    }

    const replyComment = {
      author: user,
      authorType: user?.isSuperAdmin || user?.role ? "Admin" : "Client",
      content: body.content,
      replyTo: params.commentId,
    };

    blog.comments.push(replyComment);

    const newBlogComment = await blog.save();

    await newBlogComment.populate("comments.author", "fullName image");

    res.status(201).json(newBlogComment.comments.pop());
  }),

  // @desc    Update comment or Reply-Comment
  // @route   PUT /api/v1/blog/:id/comment/:commentId
  // @access  Private
  updateComment: asyncHandler(
    async ({ body, params: { id, commentId }, t }, res, next) => {
      if (!mongoose.Types.ObjectId.isValid(commentId)) return next();

      let blog = await Blog.findOne({ _id: id });

      if (!blog) {
        res.status(404);
        throw new Error(t("not-found", { ns: "validations", key: t("blog") }));
      }

      // Pull out comment
      let comment = blog.comments.id(commentId);

      if (!comment) {
        res.status(404);
        throw new Error(
          t("not-found", { ns: "validations", key: t("comment_one") })
        );
      }

      // Update specific comment
      const postUpdatedComment = await Blog.findOneAndUpdate(
        { "comments._id": commentId },
        {
          $set: {
            "comments.$.content": body.content,
            "comments.$.updatedAt": new Date(),
          },
        },
        {
          new: true,
          upsert: true,
          select: {
            comments: {
              $elemMatch: { _id: commentId },
            },
          },
        }
      ).populate("comments.author", "fullName image");

      res.json(postUpdatedComment.comments[0]);
    }
  ),

  // @desc    Delete comment or Reply-Comment
  // @route   PUT /api/v1/blog/:id/comment/:commentId
  // @access  Private
  deleteComment: asyncHandler(
    async ({ params: { id, commentId }, t }, res, next) => {
      if (!mongoose.Types.ObjectId.isValid(commentId)) next();

      let blog = await Blog.findOne({ _id: id })
        .populate("author", "fullName image") // Post Created by admin
        .populate("categories", "name")
        .populate("comments.author", "fullName image"); // comments by admin/client;

      if (!blog) {
        res.status(404);
        throw new Error(t("not-found", { ns: "validations", key: t("blog") }));
      }

      // Pull out comment
      const comment = blog.comments.id(commentId);

      if (!comment) {
        res.status(404);
        throw new Error(
          t("not-found", { ns: "validations", key: t("comment_one") })
        );
      }

      // Make sure users is owner
      // if (comment.author?.toString() !== user.id) {
      //   res.status(403);
      //   throw new Error("You are not authorized to delete this comment");
      // }

      // Remove specific comment
      blog.comments.pull(commentId);
      blog.findRemoveOrphanComments();

      await blog.save();

      res.json({});
    }
  ),
};
export default CommentController;
