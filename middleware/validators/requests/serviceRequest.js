import { checkSchema, validationResult } from "express-validator";

const errorHandler = (req, res, next) => {
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
        return res.status(400).json({ validationError });
    }
    next();
};

const createSchema = checkSchema({
    fullName: {
        escape: true,
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("fullName") })
        },
    },
    address: {
        escape: true,
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('address') }),
        }
    },
    phoneNumber: {
        escape: true,
        trim: true,
        matches: {
            options: /^\(?(\d{3})\)?(\d{3})[-]?(\d{4})$/,
            errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t('phone-number') })
        },
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('phone-number') }),
        }
    },
    email: {
        escape: true,
        isEmail: {
            bail: true,
            if: value => value && value.length > 0,
            errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t('email') })
        },
        trim: true,
        normalizeEmail: true
    },
    service: {
        escape: true,
        trim: true,
        isMongoId: {
            errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t("services") })
        },
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("services") })
        },
    },
    bandwidth: {
        escape: true,
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("bandwidth") })
        },
    },
    message: {
        escape: true,
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("message") })
        },
    },
    "gps-latitude": {
        escape: true,
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('latitude') }),
        },
        custom: {
            options: (value, { req }) => {
                if (!value && req.body.gps) {
                    return Promise.reject(req.t("required", { ns: 'validations', key: req.t("latitude") }))
                } else {
                    return Promise.resolve();
                }
            },
        },
    },
    "gps-longitude": {
        escape: true,
        trim: true,
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('longitude') }),
        },
        custom: {
            options: (value, { req }) => {
                if (!value && req.body.gps) {
                    return Promise.reject(req.t("required", { ns: 'validations', key: req.t("longitude") }))
                } else {
                    return Promise.resolve();
                }
            },
        }
    }
});

const changeStateSchema = checkSchema({
    status: {
        escape: true,
        trim: true,
        isIn: {
            options: [['pending', 'approved', 'declined']],
            errorMessage: (_, { req }) => req.t("enum", {
                ns: 'validations',
                key: {
                    name: req.t('status'),
                    value: `${req.t('pending')}, ${req.t('approved')}, ${req.t('declined')}`,
                }
            }),
        },
        isEmpty: {
            negated: true,
            errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("status") })
        },
    },
});

export default {
    create: [createSchema, errorHandler],
    changeState: [changeStateSchema, errorHandler],
};
