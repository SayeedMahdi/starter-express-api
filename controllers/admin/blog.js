import asyncHandler from "express-async-handler"
import Blog from "../../models/Blog.js"
import Category from "../../models/Category.js"
import mongoose from "mongoose"

// @desc      Get all post
// @route     GET /api/v1/admins/blog
// @access    public
const getBlogs = asyncHandler(async (req, res, next) => {
	const blogs = await Blog.find()
		.populate("author", "fullName image")
		.populate("comments.author", "fullName image publicId")

	res.json(blogs)
})

// @desc      Get single post by id
// @route     GET /api/v1/admin/blog/:id
// @access    private
const getBlog = asyncHandler(async ({ params: { id }, t }, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(id)) return next()

	const blog = await Blog.findOneWithDeleted({ _id: id })
		.populate("author", "fullName image") // Post Created by admin
		.populate("image", "publicId path")
		.populate("comments.author", "fullName image publicId") // comments by admin/client

	if (!blog) {
		res.status(404)
		return next(new Error(t("not-found", { ns: "validation", key: "post" })))
	}

	res.json(blog)
})

// @desc      Get blog Categories
// @route     GET /api/v1/admin/blog/categories
// @access    private
const getCategories = asyncHandler(async (req, res) => {
	const categories = await Category.find({ type: "blog" })
	res.json(categories)
})

// @desc    Create a post
// @route   POST /api/v1/blog
// @access  private
const createBlog = asyncHandler(async ({ body, user, file }, res, next) => {
	let data = {
		...body,
		image: body.cloudinary?.secure_url || null,
		publicId: body?.cloudinary?.public_id,
		author: user.id,
		title: {
			fa: body.title,
		},
		content: {
			fa: body.content,
		},
		excerpt: {
			fa: body.excerpt,
		},
	}

	let blog = await Blog.create(data)
	blog = await blog.populate("image", "publicId  path")

	return res.status(201).json(blog)
})

// @desc    Update a post
// @route   PUT /api/v1/blog/:id
// @access  Private
const updateBlog = asyncHandler(
	async ({ body, params, t, user }, res, next) => {
		if (!mongoose.Types.ObjectId.isValid(params.id)) return next()

		if (!(await Blog.findOne({ _id: params.id }))) {
			res.status(404)
			throw new Error(t("not-found", { ns: "validation", key: "post" }))
		}

		const blog = await Blog.findOneAndUpdate(
			{ _id: params.id },
			{
				$set: {
					...body,
					updaterId: user.id,
					// "title.fa": body["title"],
					// "content.fa": body["content"],
					// "excerpt.fa": body["excerpt"],
					// slug: body.slug,
					// status: body.status,
				},
			},
			{
				new: true,
				runValidators: true,
			}
		)
		res.json(blog)
	}
)

// @desc      Update blog locals
// @route     PUT api/v1/admin/blog/:id/update-local-blog
// @access    private/admin
const updateLocal = asyncHandler(async ({ body, params, t }, res) => {
	let blog = await Blog.findOne({ _id: params.id })

	if (!blog) {
		res.status(404)
		throw new Error(t("not-found", { ns: "validation", key: "post" }))
	}

	blog = await Blog.findOneAndUpdate(
		{ _id: params.id },
		{
			$set: {
				"title.fa": body["title-fa"],
				"content.fa": body["content-fa"],
				"excerpt.fa": body["excerpt-fa"],
				"title.ps": body["title-ps"],
				"content.ps": body["content-ps"],
				"excerpt.ps": body["excerpt-ps"],
				"title.en": body["title-en"],
				"content.en": body["content-en"],
				"excerpt.en": body["excerpt-en"],
			},
		},
		{
			new: true,
			runValidators: true,
		}
	)

	res.json(blog)
})

// @desc    Delete a post
// @route   DELETE /api/v1/admin/blog/:id
// @access  Private
const deleteBlog = asyncHandler(
	async ({ user, params: { id }, t }, res, next) => {
		if (!mongoose.Types.ObjectId.isValid(id)) return next()

		const blog = await Blog.findOneAndDelete({ _id: id })

		if (!blog) {
			res.status(404)
			return next(new Error(t("not-found", { ns: "validation", key: "post" })))
		}

		res.json({})
	}
)

// @desc    Post viewer
// @route   Put On single Post
// @access  Private
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

const BlogController = {
	getBlogs,
	getBlog,
	createBlog,
	updateBlog,
	updateLocal,
	deleteBlog,
}

export default BlogController
