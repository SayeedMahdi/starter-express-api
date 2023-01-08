import mongoose from "mongoose";

const MessageSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "messages.userType",
            required: true,
        },
        userType: {
            type: String,
            enum: ["Admin", "Client"],
            required: true,
        },
        image: String,
        text: String,
        preText: String,
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },
    },
    { timestamps: true }
);

const TicketSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
    },
    subject: {
        type: String,
        required: true,
    },
    // description: {
    //     type: String,
    //     required: true,
    // },
    status: {
        type: String,
        enum: ["open", "close", "in_progress"],
        default: 'close',
        required: true
    },
    messages: [MessageSchema],
    closing_date: {
        type: Date,
        default: null
    },
    closed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    }
}, {
    timestamps: {
        "createdAt": "opening_date"
    }
}
);

const Ticket = mongoose.model("Ticket", TicketSchema);
mongoose.model("Message", MessageSchema);

export default Ticket;


