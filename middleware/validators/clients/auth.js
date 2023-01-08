import { checkSchema, validationResult } from "express-validator";
import { existsSync, unlinkSync } from "fs";
import Client from "../../../models/Client.js";

const errorHandler = (req, res, next) => {
  // handling validation errors
  const validationErrs = validationResult(req);
  if (!validationErrs.isEmpty()) {
    // removing uploaded files
    if (req.hasOwnProperty("file") && existsSync(req.file.path)) {
      unlinkSync(req.file.path);
    }
    return res.status(400).json({ errors: validationErrs.array() });
  }

  next();
};

const signUpSchema = checkSchema({
  fullName: {
    trim: true,
    escape: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("fullName") })
    },
  },
  email: {
    escape: true,
    trim: true,
    isEmail: {
      bail: true,
      errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t("email") })
    },
    normalizeEmail: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("email") }),
    },
    custom: {
      options: async (email, { req }) => {
        const findEmail = await Client.findOne({ email });
        if (findEmail) {
          return Promise.reject(req.t('already-exists', { ns: 'validations', key: req.t('email') }));
        }
        return Promise.resolve();
      }
    }
  },
  password: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('password') }),
    },
    isStrongPassword: {
      errorMessage:
        (_, { req }) => req.t("strong-password", { ns: 'validations' }),
    },
  },
  confirmPassword: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('confirm-password') })
    },
    custom: {
      options: (confirm, { req: { body: { password } } }) => confirm === password && Promise.resolve(),
      errorMessage: (_, { req }) => req.t("confirm-password", { ns: 'validations' }),
    },
  },
});

const loginSchema = checkSchema({

  email: {
    escape: true,
    trim: true,
    isEmail: {
      bail: true,
      errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t("email") })
    },
    normalizeEmail: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("email") }),
    },
  },
  password: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('password') }),
    },
  },
});

const verifyEmailSchema = checkSchema({
  email: {
    in: "body",
    escape: true,
    trim: true,
    isEmail: {
      bail: true,
    },
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('email') }),
    },
  },
  token: {
    in: "body",
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('token') }),
    },
  }
});
const resendTokenSchema = checkSchema({
  email: {
    in: "body",
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('email') }),
    },
    isEmail: {
      bail: true,
      errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t("email") })
    },
    custom: {
      options: async (email, { req }) => {
        const user = await Client.findOne({ email });
        if (!user) {
          return Promise.reject(req.t('not-found', { ns: 'validations', key: req.t('email') }));
        }
        return Promise.resolve();
      }
    }

  }
});

const forgotPasswordSchema = checkSchema({
  email: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t("email") })
    },
    normalizeEmail: true,
    isEmail: {
      bail: true,
      errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t("email") })
    }
  },
});

const resetPasswordSchema = checkSchema({
  otpCode: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("token") })
    },
  },
  newPassword: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("new-password") })
    },
    isStrongPassword: {
      errorMessage: (_, { req }) => req.t("strong-password", { ns: 'validations' }),
    },
  },
  confirmPassword: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('confirm-password') })
    },
    custom: {
      options: (value, { req }) => {
        if (value === req.body.newPassword) {
          return Promise.resolve()
        }
      },
      errorMessage: (_, { req }) => req.t("confirm-password", { ns: 'validations' })
    }
  },
});

export default {
  signup: [signUpSchema, errorHandler],
  login: [loginSchema, errorHandler],
  verifyEmail: [verifyEmailSchema, errorHandler],
  resendToken: [resendTokenSchema, errorHandler],
  forgotPassword: [forgotPasswordSchema, errorHandler],
  resetPassword: [resetPasswordSchema, errorHandler]
};
