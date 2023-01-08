import { checkSchema, validationResult } from "express-validator";
import Role from "../../../models/Role.js";

const errorHandler = (req, res, next) => {
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
        return res.status(400).json(validationError);
    }
    next();
};

const createSchema = checkSchema({
    name: {
        trim: true,
        escape: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) =>
                req.t("required", { ns: "validations", key: req.t("name") })
        },
        custom: {
            errorMessage: (_, { req }) => req.t("already-exists", { ns: 'validations', key: req.t("name") }),
            options: (name, { req }) => {
                return Role.count({ name }).then(
                    (result) => result !== 0 && Promise.reject()
                );
            },
        },
    },
    permissions: {
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) =>
                req.t("required", { ns: "validations", key: req.t("permissions") })
        }
    },
});

const updateSchema = checkSchema({
    name: {
        trim: true,
        escape: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) =>
                req.t("required", { ns: "validations", key: req.t("name") })
        },
        custom: {
            errorMessage: (_, { req }) => req.t("already-exists", { ns: 'validations', key: req.t("name") }),
            options: (name, { req }) => {
                return Role.count({ name, _id: { $ne: req.params.id } }).then(
                    (result) => result !== 0 && Promise.reject()
                );
            },
        },
    },
    permissions: {
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) =>
                req.t("required", { ns: "validations", key: req.t("permissions") })
        }
    },
});

export default {
    create: [createSchema, errorHandler],
    update: [updateSchema, errorHandler],
};