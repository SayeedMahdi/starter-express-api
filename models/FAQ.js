import mongoose from "mongoose";
import { accessibleRecordsPlugin } from "@casl/mongoose";

const FAQSchema = new mongoose.Schema({
  question: {
    fa: String,
    en: String,
    ps: String
  },
  answer: {
    fa: String,
    en: String,
    ps: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  updaterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
},
  {
    timestamps: true,
  }
);

FAQSchema.plugin(accessibleRecordsPlugin);

const FAQ = mongoose.model("FAQ", FAQSchema);

export default FAQ;
