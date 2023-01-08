import mongoose from "mongoose";
import { accessibleRecordsPlugin } from "@casl/mongoose";

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    permissions: {
        type: Object,
        required: true
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

RoleSchema.plugin(accessibleRecordsPlugin);

const Role = mongoose.model("Role", RoleSchema);

export default Role;


