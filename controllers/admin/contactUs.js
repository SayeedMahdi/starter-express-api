import asyncHandler from "express-async-handler";
import ContactUs from "../../models/ContactUs.js";
import mongoose from "mongoose";

const ContactUsController = {
  // @desc      Get all post
  // @route     GET /api/v1/admins/contacts
  // @access    public
  getContacts: asyncHandler(async (req, res, next) => {

    const contacts = await ContactUs.find()

    res.json(contacts);
  }),

  // @desc      Change contact form status
  // @route     GET /api/v1/admin/contact-us/:id/change-status
  // @access    private
  changeStatus: asyncHandler(async ({ params: { id }, body, t }, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return next();

    let contact = await ContactUs.findOne({ _id: id })

    if (!contact) {
      res.status(404);
      throw new Error(t("not-found", { ns: 'validations', key: t("contact") }));
    }

    contact = await ContactUs.findOneAndUpdate({ _id: id }, {
      status: body.status
    },
      {
        new: true,
        runValidators: true
      });

    res.json(contact);
  }),

  // @desc      Get single contact
  // @route     GET /api/v1/admin/contact-us/:id
  // @access    private
  // getContact: asyncHandler(async ({ params: { id }, t }, res, next) => {
  //   if (!mongoose.Types.ObjectId.isValid(id)) return next();
  //
  //   const contact = await ContactUs.findOne({ _id: id });
  //
  //   if (!contact) {
  //     res.status(404);
  //     return next(new Error(t("not-found", { ns: 'validations', key: t("contact") })));
  //   }
  //
  //   res.json({ contact });
  // }),

  // @desc    Update Contact
  // @route   PUT /api/v1/admin/contact-us/:id
  // @access  Private
  // updateContact: asyncHandler(
  //   async ({ body, params, t }, res, next) => {
  //     if (!mongoose.Types.ObjectId.isValid(params.id)) return next();
  //
  //     if (!await ContactUs.findOne({ _id: params.id })) {
  //       res.status(404);
  //       throw new Error(t("not-found", { ns: 'validations', key: t("contact") }))
  //     }
  //
  //     const contact = await ContactUs.findOneAndUpdate({ _id: params.id }, body,
  //       {
  //         new: true,
  //         runValidators: true,
  //       });
  //
  //     res.json({ contact });
  //   }
  // ),

  // @desc    Delete a Contact
  // @route   DELETE /api/v1/admin/contact-us/:id
  // @access  Private
  // deleteContact: asyncHandler(async ({ user, params: { id }, t }, res, next) => {
  //   if (!mongoose.Types.ObjectId.isValid(id)) return next();
  //
  //   const contact = await ContactUs.findOne({ _id: id });
  //
  //   if (!contact) {
  //     res.status(404);
  //     return next(new Error(t("not-found", { ns: 'validations', key: t("contact") })));
  //   }
  //
  //   await contact.delete(user._id);
  //
  //   res.json({});
  // }),
}

export default ContactUsController