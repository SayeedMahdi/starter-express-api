import { checkSchema, validationResult } from "express-validator";

const errorHandler = (req, res, next) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return res.status(400).json(validationError);
  }
  next();
};

//this is the schema cheaker for create and update of a FAQ
const createSchema = checkSchema({
  fullName: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) =>
        req.t("required", { ns: "validations", key: req.t("fullName") })
    }
  },
  email: {
    normalizeEmail: true,
    escape: true,
    isEmail: {
      bail: true,
      errorMessage: (_, { req }) =>
        req.t("invalid", { ns: "validations", key: req.t("email") })
    },
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) =>
        req.t("required", { ns: "validations", key: req.t("email") })
    },
    trim: true,
    bail: true,
  },
  phoneNumber: {
    trim: true,
    escape: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) =>
        req.t("required", { ns: "validations", key: req.t("phone") })
    }
  },
  subject: {
    escape: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) =>
        req.t("required", { ns: "validations", key: req.t("subject") })
    },
    trim: true,
  },
  message: {
    escape: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) =>
        req.t("required", { ns: "validations", key: req.t("subject") })
    },
    trim: true,
  }
});

const changeStatusSchema = checkSchema({
  status: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) =>
        req.t("required", { ns: "validations", key: req.t("status") })
    }
  },
});

export default {
  create: [createSchema, errorHandler],
  changeStatus: [changeStatusSchema, errorHandler]
};
