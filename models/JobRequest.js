import mongoose from "mongoose";
import { accessibleRecordsPlugin } from "@casl/mongoose";

const JobRequestSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: String,
    // address: {
    //     type: String,
    //     required: true,
    // },
    province: {
        type: String,
        required: true,
    },
    attachments: String,
    position: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending',
        required: true,
    },
    company: String,
    duration: String,
    updaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
}, { timestamps: true })

JobRequestSchema.plugin(accessibleRecordsPlugin);

const JobRequest = mongoose.model("job-request", JobRequestSchema);

export default JobRequest;