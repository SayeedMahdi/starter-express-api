import asyncHandler from "express-async-handler"
import Blog from "../../models/Blog.js"
import mongoose from "mongoose"

// @desc      Get all Blogs
// @route     GET /api/v1/blogs/
// @access    public
const getBlogs = asyncHandler(async (req, res, next) => {
	req.database = {
		model: Blog,
		search: {},
		populate: [
			{ path: "author", select: "fullName image" },
			{ path: "comments.author", select: "fullName image publicId" },
			{ path: "image", select: "path publicId" },
		],
	}

	req.query.sortColumn = req.query.sortColumn || "publishedAt"

	if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
		req.database.search["$text"] = { $search: `/${req.query["q"]}/i` }
	}

	if (req.query?.filter?.length > 0 && req.query?.date?.length > 0) {
		req.database.search["publishedAt"] =
			req.query.filter === "_new"
				? { $gt: req.query.date }
				: { $lt: req.query.date }
	}

	next()
})
// @desc      Get single blog by id
// @route     GET /api/v1/blog/:id
// @access    public
const getBlog = asyncHandler(async (req, res, next) => {
	const {
		params: { id },
		t,
	} = req

	const filter = mongoose.Types.ObjectId.isValid(id)
		? { _id: id }
		: { slug: id }

	const blog = await Blog.findOne(filter)
		.populate("author", "fullName image") // Blog Created by admin
		.populate("image", "path publicId")
		.populate("comments.author", "fullName image publicId") // comments by admin/client

	if (!blog) {
		res.status(404)
		throw new Error(t("invalid", { ns: "validations", key: t("blog") }))
	}

	res.json(blog)
})

// @desc    Blog viewer
// @route   Put On single Blog
// @access  private
const blogViewer = asyncHandler(async ({ id, views }) => {
	await Blog.findByIdAndUpdate(
		{ _id: id },
		{ $set: { views: views + 1 } },
		{
			new: true,
			runValidators: true,
		}
	)
})
// @route    PUT api/v1/blog/:id/like
// @desc     Like a post
// @access   public
const likeOrDislike = asyncHandler(async ({ user, params: { id }, t }, res) => {
	let blog = await Blog.findOne({ _id: id })

	if (!blog) {
		res.status(404)
		throw new Error(t("not-found", { ns: "validations", key: "Post" }))
	}

	// Check if the blog has already been liked
	const isLiked = blog.likes.some((like) => like.toString() === user.id)

	if (!isLiked) {
		const userLikes = await Blog.findOneAndUpdate(
			{ _id: id },
			{ $push: { likes: user._id } },
			{ new: true }
		).populate("likes", "fullName image")
		res.json(userLikes.likes)
	} else {
		const userDislikes = await Blog.findOneAndUpdate(
			{ _id: id },
			{ $pull: { likes: user._id } },
			{ new: true }
		).populate("likes", "fullName image")
		res.json(userDislikes.likes)
	}
})

const BlogController = {
	getBlogs,
	getBlog,
	blogViewer,
	likeOrDislike,
}
export default BlogController
