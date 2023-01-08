import mongoose from "mongoose";
import { accessibleRecordsPlugin } from "@casl/mongoose";

const ServiceSchema = new mongoose.Schema({
    icon: {
        type: String,
        required: true
    },
    name: {
        fa: {
            type: String,
            required: true
        },
        en: String,
        ps: String,
    },
    description: {
        fa: String,
        ps: String,
        en: String,
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

ServiceSchema.plugin(accessibleRecordsPlugin);

ServiceSchema.index({
    "name.fa": "text",
    "name.en": "text",
    "name.ps": "text",
    "description.fa": "text",
    "description.en": "text",
    "description.ps": "text"
});

const Service = mongoose.model("Service", ServiceSchema);

export default Service;


