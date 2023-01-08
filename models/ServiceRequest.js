import mongoose from "mongoose";
import { accessibleRecordsPlugin } from "@casl/mongoose";

const ServiceRequestSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: String,
    address: {
        type: String,
        required: true,
    },
    gps: {
        type: {
            longitude: String,
            latitude: String,
            _id: false,
        },
        required: true,
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    bandwidth: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending',
        required: true,
    },

    updaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
}, { timestamps: true })

ServiceRequestSchema.plugin(accessibleRecordsPlugin);

const ServiceRequest = mongoose.model("ServiceRequest", ServiceRequestSchema);

export default ServiceRequest;