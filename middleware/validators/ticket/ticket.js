import { checkSchema, validationResult } from "express-validator";

const errorHandler = (req, res, next) => {
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
        return res.status(400).json({ validationError });
    }
    next();
};

const createChatSchema = checkSchema({
    subject: {
        escape: true,
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) =>
                req.t("required", { ns: "validations", key: req.t("subject") })
        }
    },
    // description: {
    //     escape: true,
    //     trim: true,
    //     isEmpty: {
    //         negated: true,
    //         errorMessage: (_, { req }) =>
    //             req.t("required", { ns: "validations", key: req.t("description") })
    //     }
    // }
});

const createMessageSchema = checkSchema({
    text: {
        escape: true,
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) =>
                req.t("required", { ns: "validations", key: req.t("text") })
        }
    }
});

export default {
    createChat: [createChatSchema, errorHandler],
    createMessage: [createMessageSchema, errorHandler],
};
