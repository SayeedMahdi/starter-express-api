import mongoose from "mongoose";
import { accessibleRecordsPlugin } from "@casl/mongoose";

const ContactUsSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "fulfilled"],
    },
  },
  {
    timestamps: true,
  }
);

ContactUsSchema.plugin(accessibleRecordsPlugin);

const ContactUs = mongoose.model("ContactUs", ContactUsSchema);

export default ContactUs;
