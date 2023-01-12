import mongoose from "mongoose"
import { accessibleRecordsPlugin } from "@casl/mongoose"
import softDelete from "mongoose-delete"

const CommentSchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			refPath: "comments.authorType",
		},
		authorType: {
			type: String,
			required: true,
			enum: ["Admin", "Client"],
		},
		content: {
			type: String,
			required: true,
		},
		replyTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment",
			default: null,
		},
	},
	{ timestamps: true }
)

const BlogSchema = new mongoose.Schema(
	{
		title: {
			fa: String,
			ps: String,
			en: String,
		},
		slug: {
			type: String,
			index: {
				unique: true,
			},
		},
		content: {
			fa: String,
			ps: String,
			en: String,
		},
		image: {
			type: String,
			required: true,
		},
		publicId: {
			type: String,
			required: true,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
			required: true,
		},
		excerpt: {
			fa: String,
			ps: String,
			en: String,
		},
		comments: [CommentSchema],
		views: {
			type: Number,
			default: 0,
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Client",
			},
		],
		status: {
			type: String,
			enum: ["publish", "draft", "pending"],
			default: "publish",
			required: true,
		},
		updaterId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Admin",
		},
	},
	{
		timestamps: true,
	}
)

const mapToTree = (list, parentId = null) => {
	const branch = []
	list.forEach((item) => {
		const node = { ...item }
		node["replyTo"] = Object.prototype.hasOwnProperty.call(node, "replyTo")
			? node["replyTo"]
			: null
		if (parentId === node["replyTo"]) {
			node["replies"] = mapToTree(list, node["_id"])
			return branch.push(node["_id"])
		}
	})
	return branch
}

BlogSchema.methods.findRemoveOrphanComments = function () {
	let orphan = []
	this.comments.forEach((comment) => {
		if (comment.replyTo) {
			const parentDocExists =
				this.comments.find(
					(_comment) =>
						_comment["_id"].toString() === comment["replyTo"].toString()
				) && true
			if (!parentDocExists) {
				orphan.push(comment["_id"])
				orphan = [...orphan, ...mapToTree(this.comments, comment["_id"])]
			}
		}
	})
	orphan.forEach((comment) => {
		this.comments.pull(comment)
	})
}

BlogSchema.virtual("reply", {
	ref: "User",
	localField: "comments",
	foreignField: "_id",
	justOne: true,
})

BlogSchema.plugin(accessibleRecordsPlugin)
BlogSchema.plugin(softDelete, {
	deletedBy: true,
	deletedAt: true,
	overrideMethods: true,
})

BlogSchema.index({
	"title.fa": "text",
	"title.en": "text",
	"title.ps": "text",
	"content.fa": "text",
	"content.en": "text",
	"content.ps": "text",
})

const Blog = mongoose.model("Blog", BlogSchema)
mongoose.model("Comment", CommentSchema)

export default Blog
