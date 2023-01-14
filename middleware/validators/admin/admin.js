import { checkSchema, validationResult } from "express-validator"
import Admin from "../../../models/Admin.js"
import { existsSync, unlinkSync } from "fs"
import mongoose from "mongoose"

const createSchema = checkSchema({
	fullName: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("fullName") }),
		},
	},
	email: {
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("email") }),
		},
		escape: true,
		isEmail: {
			bail: true,
			errorMessage: (_, { req }) =>
				req.t("invalid", { ns: "validations", key: req.t("email") }),
		},
		trim: true,
		normalizeEmail: true,
		custom: {
			options: async (email, { req }) => {
				const findEmail = await Admin.findOne({ email })
				if (findEmail) {
					return Promise.reject(
						req.t("already-exists", { ns: "validations", key: req.t("email") })
					)
				}
				return Promise.resolve()
			},
		},
	},
	subject: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("subject") }),
		},
	},
	ability: {
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("ability") }),
		},
	},
	username: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("username") }),
		},
		custom: {
			options: async (email, { req }) => {
				const findEmail = await Admin.findOne({ email })
				if (findEmail) {
					return Promise.reject(
						req.t("already-exists", {
							ns: "validations",
							key: req.t("username"),
						})
					)
				}
				return Promise.resolve()
			},
		},
	},
	password: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("password") }),
		},
		isStrongPassword: {
			errorMessage: (_, { req }) =>
				req.t("strong-password", { ns: "validations" }),
		},
	},
	confirmPassword: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", {
					ns: "validations",
					key: req.t("confirm-password"),
				}),
		},
		custom: {
			options: (
				confirm,
				{
					req: {
						body: { password },
					},
				}
			) => confirm === password && Promise.resolve(),
			errorMessage: (_, { req }) =>
				req.t("confirm-password", { ns: "validations" }),
		},
	},
})

const updateSchema = checkSchema({
	fullName: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("fullName") }),
		},
	},
	email: {
		escape: true,
		trim: true,
		isEmail: {
			bail: true,
			errorMessage: (_, { req }) =>
				req.t("invalid", { ns: "validations", key: req.t("email") }),
		},
		normalizeEmail: true,
		custom: {
			errorMessage: (_, { req }) =>
				req.t("already-exists", { ns: "validations", key: req.t("email") }),
			options: (email, { req }) => {
				return (
					Admin.count({ email, _id: { $ne: req.params.id } })
						// .accessibleBy(req.user.ability)
						.then((result) => result !== 0 && Promise.reject())
				)
			},
		},
	},
	username: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("username") }),
		},
		custom: {
			errorMessage: (_, { req }) =>
				req.t("already-exists", { ns: "validations", key: req.t("username") }),
			options: (username, { req }) => {
				return Admin.count({ username, _id: { $ne: req.params.id } })
					.accessibleBy(req.user.ability)
					.then((result) => result !== 0 && Promise.reject())
			},
		},
	},
	role: {
		escape: true,
		trim: true,
		custom: {
			options: (value, { req }) => {
				if (
					(req.isSuperAdmin === undefined || req.isSuperAdmin === false) &&
					(value === null || value === undefined)
				) {
					return Promise.reject(
						req.t("required", { ns: "validations", key: req.t("role") })
					)
				}
				if (!mongoose.Types.ObjectId.isValid(value)) {
					return Promise.reject((_, { req }) =>
						req.t("invalid", { ns: "validations", key: req.t("role") })
					)
				}
				return Promise.resolve()
			},
		},
	},
})

const changePasswordSchema = checkSchema({
	currentPassword: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("password") }),
		},
		custom: {
			errorMessage: (_, { req }) =>
				req.t("invalid", { ns: "validations", key: req.t("password") }),
			options: async (
				currentPassword,
				{
					req: {
						params: { id: userId },
					},
				}
			) => {
				if (!mongoose.Types.ObjectId.isValid(userId)) {
					return Promise.reject((_, { req }) =>
						req.t("invalid", { ns: "validations", key: req.t("user") })
					)
				}
				const admin = await Admin.findOne({ _id: userId }).select("+password")
				if (await admin.matchPassword(currentPassword)) {
					return Promise.resolve()
				}
				return Promise.reject()
			},
		},
	},
	password: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("password") }),
		},
		isStrongPassword: {
			errorMessage: (_, { req }) =>
				req.t("provide", { ns: "validations", key: req.t("strong-password") }),
		},
	},
	confirmPassword: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", {
					ns: "validations",
					key: req.t("confirm-password"),
				}),
		},
		custom: {
			options: (
				value,
				{
					req: {
						body: { password },
					},
				}
			) => value === password || Promise.reject(),
			errorMessage: (_, { req }) =>
				req.t("wrong-confirmation", {
					ns: "validations",
					key: req.t("confirm-password"),
				}),
		},
	},
})

const changeThemeSchema = checkSchema({
	theme: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("theme") }),
		},
		isIn: {
			options: [["dark", "light"]],
			errorMessage: (_, { req }) =>
				req.t("invalid", { ns: "validations", key: req.t("theme") }),
		},
	},
})

const errorHandler = (req, res, next) => {
	// handling validation errors
	const validationErrs = validationResult(req)
	if (!validationErrs.isEmpty()) {
		// removing uploaded files
		if (req.hasOwnProperty("file") && existsSync(req.file.path)) {
			unlinkSync(req.file.path)
		}
		return res.status(400).json({ errors: validationErrs.array() })
	}
	next()
}

export default {
	create: [createSchema, errorHandler],
	update: [updateSchema, errorHandler],
	changePassword: [changePasswordSchema, errorHandler],
	changeTheme: [changeThemeSchema, errorHandler],
}
