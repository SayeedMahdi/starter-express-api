import { checkSchema, validationResult } from "express-validator"
import FAQ from "../../../models/FAQ.js"

const errorHandler = (req, res, next) => {
	const validationError = validationResult(req)
	if (!validationError.isEmpty()) {
		return res.status(400).json({ validationError })
	}
	next()
}

//this is the schema cheaker for create and update of a FAQ
const createSchema = checkSchema({
	question: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("question") }),
		},
		custom: {
			options: async (question, { req: { body } }) => {
				const result = await FAQ.findOne({ "question.fa": question })
				return result ? Promise.reject() : Promise.resolve()
			},
			errorMessage: (_, { req }) =>
				req.t("already-exists", { ns: "validations", key: req.t("question") }),
		},
	},
	answer: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("answer") }),
		},
	},
})

const updateSchema = checkSchema({
	question: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("question") }),
		},
		custom: {
			options: async (
				question,
				{
					req: {
						params: { id },
					},
				}
			) => {
				const result = await FAQ.findOne({ question, _id: { $ne: id } })
				return result ? Promise.reject() : Promise.resolve()
			},
			errorMessage: (_, { req }) =>
				req.t("already-exists", { ns: "validations", key: req.t("question") }),
		},
	},
	answer: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", { ns: "validations", key: req.t("question") }),
		},
	},
})

const updateLocalSchema = checkSchema({
	question_en: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", {
					ns: "validations",
					key: req.t("question"),
					local: req.t("english"),
				}),
		},
	},
	question_ps: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", {
					ns: "validations",
					key: req.t("question"),
					local: req.t("pashto"),
				}),
		},
	},
	answer_en: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", {
					ns: "validations",
					key: req.t("answer"),
					local: req.t("english"),
				}),
		},
	},
	answer_ps: {
		escape: true,
		trim: true,
		isEmpty: {
			negated: true,
			errorMessage: (_, { req }) =>
				req.t("required", {
					ns: "validations",
					key: req.t("answer"),
					local: req.t("pashto"),
				}),
		},
	},
})

export default {
	create: [createSchema, errorHandler],
	update: [updateSchema, errorHandler],
	updateLocal: [updateLocalSchema, errorHandler],
}
