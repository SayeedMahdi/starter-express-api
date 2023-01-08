import asyncHandler from "express-async-handler";
import ContactUs from "../../models/ContactUs.js";

const ContactUsController = {
  // @desc    Create a contactUs
  // @route   POST /api/v1/contact-us
  // @access  public
  create: asyncHandler(async (req, res, next) => {
    const form = await ContactUs.create({
      ...req.body,
      status: "pending"
    });

    if (!form) {
      res.status(500);
      return next(new Error(req.t("messages:failed")));
    }

    return res.status(201).json(form);
  })
}

export default ContactUsController