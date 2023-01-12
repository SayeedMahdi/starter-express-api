import { checkSchema, validationResult } from "express-validator"
import Blog from "../../../models/Blog.js"
import { existsSync, unlinkSync } from "fs"

const createBlogSchema = checkSchema({
	title: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("title") }),
		},
	},
	slug: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("slug") }),
		},
		custom: {
			errorMessage: (_, { req }) =>
				req.t("already-exists", { ns: "validations", key: req.t("title") }),
			options: (slug, { req }) => {
				return Blog.count({ slug }).then(
					(result) => result !== 0 && Promise.reject()
				)
			},
		},
	},
	// image: {
	//   custom: {
	//     options: (_, {req}) => {
	//       const result = validationResult(req)
	//       const hasError = validationResult(req).errors.some(err => err.param === 'image')
	//       if (req.body.imageId?.length > 0 && req.body.images.length > 0) {
	//         return Promise.reject(req.t("image-double-selection", { ns: 'validations', key: req.t('image')}));
	//       }
	//       if (!hasError && !req.body?.images?.length > 0 && !req.body?.imageId?.length > 0) {
	//         return Promise.reject(req.t("required", { ns: 'validations', key: req.t('image')}));
	//       }
	//       return Promise.resolve()
	//     }
	//   }
	// },
	excerpt: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("excerpt") }),
		},
	},
	content: {
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("content") }),
		},
	},
	status: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("status") }),
		},
	},
})

const updateBlogSchema = checkSchema({
	title: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("title") }),
		},
	},
	slug: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("slug") }),
		},
		custom: {
			errorMessage: (_, { req }) =>
				req.t("already-exists", { ns: "validations", key: req.t("slug") }),
			options: (slug, { req }) => {
				return Blog.count({ slug, _id: { $ne: req.params.id } }).then(
					(result) => result !== 0 && Promise.reject()
				)
			},
		},
	},
	excerpt: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("excerpt") }),
		},
	},
	content: {
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("content") }),
		},
	},
	status: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("status") }),
		},
	},
	// categories: {
	// 	escape: true,
	// 	trim: true,
	// 	isEmpty: {
	// 		negated: true,
	// 		errorMessage: (_, { req }) =>
	// 			req.t("required", { ns: "validations", key: req.t("category") }),
	// 	},
	// },
})

const errorHandler = (req, res, next) => {
	// handling validation errors
	const validationErrs = validationResult(req)
	if (!validationErrs.isEmpty()) {
		if (req.hasOwnProperty("file") && existsSync(req.file.path)) {
			unlinkSync(req.file.path)
		}
		return res.status(400).json({ errors: validationErrs.array() })
	}

	next()
}

export default {
	create: [createBlogSchema, errorHandler],
	update: [updateBlogSchema, errorHandler]
}
