import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import FAQ from "../../models/FAQ.js";
import Category from "../../models/Category.js";

const FAQController = {
    getFAQs: asyncHandler(async (req, res, next) => {
        const fags = await FAQ.find()

        res.json(fags);
    }),

    // @desc    Get a Service
    // @route   GET /api/v1/admin/faq/:id
    // @access  Private
    getFaq: asyncHandler(async ({ params: { id }, t }, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return next();

        const faq = await FAQ.findOne({ _id: id }).populate('category', 'name')

        if (!faq) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("faq") }))
        }

        res.json(faq);
    }),

    // @desc    Create Frequetly Asks Questions
    // @route   POST /api/v1/admin/FAQ
    // @access  private
    createFAQ: asyncHandler(async ({ body, user }, res) => {
        body.creatorId = user.id;

        body.question = {
            fa: body.question
        }

        body.answer = {
            fa: body.answer
        }

        const faq = await FAQ.create(body);

        res.status(201).json(faq)
    }),

    // @desc    Create Frequetly Asks Questions
    // @route   PUT /api/v1/admin/FAQ/:id
    // @access  private
    updateFAQ: asyncHandler(async ({ body, user, params: { id }, t }, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return next();

        body.creatorId = user.id;

        body.question = {
            fa: body.question
        };

        body.answer = {
            fa: body.answer
        }

        const faq = await FAQ.findOneAndUpdate({ _id: id }, {
            $set: {
                question: body.question,
                answer: body.answer,
                category: body.category
            }
        }, { new: true })

        if (!faq) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("faq") }));
        }

        res.status(201).json(faq)
    }),

    // @desc    Get Frequetly Ask Questions
    // @route   GET /api/v1/admin/FAQ/:id
    // @access  private
    deleteFAQ: asyncHandler(async ({ params: { id }, t }, res, next) => {
        if (!mongoose.isValidObjectId(id)) return next();

        const findAnFAQ = await FAQ.findByIdAndDelete(id);

        if (!findAnFAQ) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("faq") }))
        }

        res.json({});
    }),


    // @desc      Update Faq locals
    // @route     PUT api/v1/admin/faq/:id/update-locals
    // @access    private/admin
    updateLocals: asyncHandler(async ({ body, params: { id }, t }, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return next();

        const faq = await FAQ.findByIdAndUpdate({ _id: id }, {
            $set: {
                "question.en": body["question-en"], "answer.fa": body["answer-fa"],
                "answer.ps": body["answer-ps"], "answer.en": body["answer-en"],
            },
        }, {
            new: true,
            runValidators: true,
        });

        if (!faq) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("faq") }));
        }

        res.status(200).json(faq);
    }),

    // @desc      Get faq Categories
    // @route     GET /api/v1/admin/faq/categories
    // @access    private
    getCategories: asyncHandler(async (req, res) => {
        const categories = await Category.find({ type: 'faq' })
        res.json(categories);
    }),
}

export default FAQController