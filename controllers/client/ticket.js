import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Ticket from "../../models/Ticket.js";

const TicketController = {
    // @desc    Get all Ticket/Messages
    // @route   GET /api/v1/ticket/:id
    // @access  Private
    getMessages: asyncHandler(async (req, res, next) => {
        const { params, t } = req

        const chats = await Ticket.findOne({ _id: params.id, status: { $ne: 'close' } })
            .populate('messages.user', 'fullName image publicId');

        if (!chats) {
            res.status(400);
            throw new Error(t("not-found", { ns: 'validations', key: t("message") }));
        }

        res.status(200).json(chats.messages);
    }),

    // @desc    Create a Ticket
    // @route   POST /api/v1/ticket
    // @access  private
    createChat: asyncHandler(async ({ body, user, t }, res, next) => {
        body.client_id = user.id;
        body.status = 'open';

        const clientTicket = await Ticket.findOne({
            client_id: user.id,
            $or: [{ status: 'open' }, { status: 'in_progress' }]
        })

        if (clientTicket) {
            return res.status(200).json({ success: true });
        }

        let chat = await Ticket.create(body);

        await chat.populate('client_id', 'fullName image publicId');

        if (!chat) {
            res.status(500);
            return next(new Error(t("messages:failed")));
        }

        res.status(201).json(chat);
    }),

    // @desc    Create Message
    // @route   POST /api/v1/ticket/:id
    // @access  private
    createMessage: asyncHandler(async ({ user, file, body, params, t }, res, next) => {
        let ticket = await Ticket.findOne({ _id: params.id });

        if (!ticket) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("chat") }));
        }
        console.log(body, file);

        const newMessage = {
            user: user.id,
            userType: "Client",
            text: body?.text,
            image: file?.path,
            reply: null
        };

        ticket.messages.push(newMessage);

        const newTicket = await ticket.save();
        await newTicket.populate("messages.user", "fullName image publicId");

        res.status(201).json(newTicket.messages.pop());
    }),

    // @desc    Reply Message
    // @route   POST /api/v1/ticket/:chatId/message/:msgId/reply
    // @access  private
    replyMessage: asyncHandler(async ({ user, file, body, params, t }, res, next) => {
        let ticket = await Ticket.findOne({ _id: params.id });

        if (!ticket) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("chat") }));
        }

        const message = ticket.messages.some(message => message.id === params.msgId)

        if (!message) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("message") }));
        }

        const replyMessage = {
            user: user.id,
            userType: "Client",
            text: body.text,
            replyTo: params.msgId,
            preText: body.preText
        };

        ticket.messages.push(replyMessage);

        const newTicketMessage = await ticket.save();

        await newTicketMessage.populate("messages.user", "fullName image")

        res.status(201).json(newTicketMessage.messages.pop());
    }),

    // @desc    Update message
    // @route   Message: PUT /api/v1/ticket/:chatId/message/:messageId
    // @access  Private
    updateMessage: asyncHandler(
        async ({ file, body, params, t }, res, next) => {

            if (!mongoose.Types.ObjectId.isValid(params.msgId)) return next();

            let ticket = await Ticket.findOne({ _id: params.id });

            if (!ticket) {
                res.status(404);
                throw new Error(t("not-found", { ns: 'validations', key: t("chat") }));
            }

            const message = ticket.messages.some(message => message.id === params.msgId)

            if (!message) {
                res.status(404);
                throw new Error(t("not-found", { ns: 'validations', key: t("message") }));
            }

            // Update specific message
            const chatUpdatedMessage = await Ticket.findOneAndUpdate(
                { "messages._id": params.msgId },
                {
                    $set: {
                        "messages.$.text": body.text,
                        "messages.$.image": file && file?.path,
                        "messages.$.updatedAt": new Date(),
                    },
                },
                {
                    new: true,
                    upsert: true,
                    select: {
                        messages: {
                            $elemMatch:
                                { _id: params.msgId }
                        }
                    }
                }).populate("messages.user", "fullName image")

            res.status(200).json(chatUpdatedMessage.messages[0]);
        }
    ),

    // @desc    Delete Message
    // @route   Delete /api/v1/ticket/:chatId/message/messageId
    // @access  private
    deleteMessage: asyncHandler(async ({ user, file, body, params, t }, res, next) => {
        let ticket = await Ticket.findOne({ _id: params.id });

        if (!ticket) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("chat") }));
        }

        const message = ticket.messages.some(message => message.id === params.msgId)

        if (!message) {
            res.status(404);
            throw new Error(t("not-found", { ns: 'validations', key: t("message") }));
        }

        const ChatUpdatedMessage = await Ticket.findOneAndUpdate(
            { "messages._id": params.msgId },
            { $pull: { messages: { _id: params.msgId } } },
            {
                select: {
                    messages: {
                        $elemMatch:
                            { _id: params.msgId }
                    }
                }
            }).populate("messages.user", "fullName image publicId");


        if (!ChatUpdatedMessage) {
            res.status(404);
            throw new Error(t("wrong", { ns: 'validatisons', key: t("s") }));
        }


        res.status(200).json({});
    }),

    checkTicketStatus: asyncHandler(async ({ user }, res, next) => {
        const clientTicket = await Ticket.findOne({
            client_id: user.id,
            $or: [{ status: 'open' }, { status: 'in_progress' }]
        })

        return res.status(200).json(clientTicket?.status);
    }),

    chatDetails: asyncHandler(async ({ user }, res, next) => {

        const clientTicket = await Ticket.findOne({
            client_id: user.id,
            $or: [{ status: 'open' }, { status: 'in_progress' }]
        }).populate("messages.user", "fullName image publicId");

        return res.status(200).json(clientTicket);
    })
}

export default TicketController