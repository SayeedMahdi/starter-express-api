import asyncHandler from "express-async-handler"
import FAQ from "../../models/FAQ.js"

const FAQController = {
	// @desc    Get all FAQs
	// @route   POST /api/v1/faq
	// @access  public
	getFAQs: asyncHandler(async (req, res, next) => {
		const faqs = await FAQ.find().sort({ createdAt: -1 })
		res.json(faqs)
	}),
}
export default FAQController
