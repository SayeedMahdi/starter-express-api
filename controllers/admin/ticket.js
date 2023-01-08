import asyncHandler from "express-async-handler";
import Ticket from "../../models/Ticket.js";

const TicketController = {
    // @desc    Get all Ticket/chats
    // @route   GET /api/v1/admin/ticket
    // @access  Private
    getChats: asyncHandler(async (req, res, next) => {
        const { role: { name } } = await req.user.populate('role', 'name');
        let chats;

        name === "superAdmin"
            ? chats = await Ticket.find({ status: { $ne: 'close' } })
                .populate('client_id', 'fullName image publicId')
                .populate('messages.user', 'fullName image publicId')
                .slice('messages', -1)

            : chats = await Ticket.find({ subject: name, status: { $ne: 'close' } })
                .populate('client_id', 'fullName image publicId')
                .populate('messages.user', 'fullName image publicId')
                .slice('messages', -1)

        if (!chats) {
            res.status(400);
            throw new Error(t("not-found", { ns: 'validations', key: t("message") }));
        }

        res.status(200).json(chats);
    }),

    // @desc    Get all Ticket/Chat
    // @route   GET /api/v1/admin/ticket/:id
    // @access  Private
    getMessages: asyncHandler(async ({ params, t }, res, next) => {
        const chats = await Ticket.findOne({ _id: params.id, status: { $ne: 'close' } })
            .populate('messages.user', 'fullName image publicId');

        if (!chats) {
            res.status(400);
            throw new Error(t("not-found", { ns: 'validations', key: t("message") }));
        }

        res.status(200).json(chats.messages);
    }),

    // @desc    Create Message
    // @route   POST /api/v1/admin/ticket/:id
    // @access  private
    createMessage: asyncHandler(async ({ user, file, body, params: { id }, t }, res, next) => {
        let ticket = await Ticket.findOne({ _id: id });

        if (!ticket) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("chat") }));
        }

        const newMessage = {
            user: user.id,
            userType: (user?.isSuperAdmin || user?.role) && "Admin",
            text: body?.text,
            image: file?.path
        };

        ticket.messages.push(newMessage);

        const newTicket = await ticket.save();
        await newTicket.populate("messages.user", "fullName image publicId");

        res.status(201).json(newTicket.messages.pop());
    }),

    // @desc    Close chat 
    // @route   PUT /api/v1/admin/ticket/:id/close-chat
    // @access  private
    closeChat: asyncHandler(async ({ user, params: { id }, t }, res, next) => {
        const ticket = await Ticket.findOneAndUpdate({ _id: id },
            {
                $set: {
                    "status": "close",
                    "closed_by": user._id,
                    "closing_date": new Date()
                }
            }, {
            new: true,
            runValidators: true,
        })

        if (!ticket) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("chat") }));
        }

        res.status(200).json({});
    })
}

export default TicketController