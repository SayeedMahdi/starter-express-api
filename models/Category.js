import mongoose from "mongoose";
import { accessibleRecordsPlugin } from "@casl/mongoose";
import softDelete from "mongoose-delete";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      fa: String,
      en: String,
      ps: String
    },
    slug: {
      type: String,
      index: {
        unique: true
      },
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

CategorySchema.plugin(accessibleRecordsPlugin)
CategorySchema.plugin(softDelete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: true,
})

const Category = mongoose.model("Category", CategorySchema)

export default Category