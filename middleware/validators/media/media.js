import { checkSchema, validationResult } from "express-validator";
import {existsSync, unlinkSync} from "fs";

const errorHandler = (req, res, next) => {
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
        if (req.hasOwnProperty("file") && existsSync(req.file.path)) {
            unlinkSync(req.file.path);
        }
        return res.status(400).json(validationError);
    }
    next();
};

const createSchema = checkSchema({
    image: {
        escape: true,
        trim: true,
        custom: {
            options: (value, { req }) => {
                if (
                    (req.image === undefined || req.image === null) &&
                    (value === undefined || value === null)
                ) {
                    return Promise.reject(req.t("required", { ns: 'validations', key: req.t("image") }));
                }
                return Promise.resolve();
            },
        }
    },
});

export default {
    createAndUpdate: [createSchema, errorHandler],
};
