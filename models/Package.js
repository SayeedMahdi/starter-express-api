import mongoose from "mongoose";
import { accessibleRecordsPlugin } from "@casl/mongoose";
import softDelete from "mongoose-delete";

const PackageSchema = new mongoose.Schema(
  {
    name: {
      fa: String,
      en: String,
      ps: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: ["limited", "unlimited"],
      required: true,
    },
    bandwidth: {
      type: {
        type: String,
        enum: ["dedicated", "shared"],
      },
      amount: Number
    },
    price: {
      main: {
        type: Number,
        required: true,
      },
      plus: Number
    },
    province: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    priority: {
      type: Number,
      required: true,
      default: 5,
    },
    dailySpeed: String,
    nightlySpeed: String,
    description: {
      fa: String,
      ps: String,
      en: String,
    },
    image: {
      type: Object,
      default: null,
    },
    marker: {
      fa: {
        type: String,
        default: null
      },
      ps: {
        type: String,
        default: null
      },
      en: {
        type: String,
        default: null
      }
    },
    properties: [{
      type: {
        fa: String,
        ps: String,
        en: String,
        _id: false
      }
    }],
    isPlus: mongoose.Schema.Types.Boolean,
    isHybrid: mongoose.Schema.Types.Boolean,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    capacity: {
      type: mongoose.Schema.Types.Number,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    }
  },
  {
    timestamps: true,
  }
);
PackageSchema.index({
  "name.*": "text",
});
PackageSchema.plugin(accessibleRecordsPlugin);
PackageSchema.plugin(softDelete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: true,
});

const Package = mongoose.model("Package", PackageSchema);

export default Package;


