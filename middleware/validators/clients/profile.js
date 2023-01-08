import { checkSchema, validationResult } from "express-validator";
import { existsSync, unlinkSync } from "fs";
import Client from '../../../models/Client.js'

const changePasswordSchema = checkSchema({
  currentPassword: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, {req}) => req.t("required", {ns: 'validations', key: req.t('fullName')})
    },
    custom: {
      options: async (value, {req}) => {
        const user = await Client.findById(req.user.id).select('+password').exec();
        const verify = await user.matchPassword(value);
        return verify ? Promise.resolve() : Promise.reject(req.t("invalid", {
          ns: 'validations',
          key: req.t("current-password")
        }))
      }
    }
  },
  newPassword: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, {req}) => req.t("required", {ns: 'validations', key: req.t('password')}),
    },
    isStrongPassword: {
      errorMessage:
        (_, {req}) => req.t("strong-password", {ns: 'validations'}),
    },
  },
  confirmPassword: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, {req}) => req.t("required", {ns: 'validations', key: req.t('confirm-password')})
    },
    custom: {
      options: (confirm, {req: {body: {newPassword}}}) => confirm === newPassword && Promise.resolve(),
      errorMessage: (_, {req}) => req.t("confirm-password", {ns: 'validations'}),
    },
  },
})
// Check update validation
const updateSchema = checkSchema({
  fullName: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('fullName') })
    }
  },
  email: {
    trim: true,
    escape: true,
    isEmail: {
      bail: true,
      errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t("email") })
    },
    normalizeEmail: true,
    custom: {
      errorMessage: (_, { req }) => req.t("already-exists", { ns: 'validations', key: req.t('email') }),
      options: (email, { req }) => {
        if (!email) return Promise.resolve()
        return Client.count({ _id: { $ne: req.user._id }, email })
          .then((result) => result !== 0 && Promise.reject());
      },
    },
  },
  gender: {
    escape: true,
    trim: true,
    isIn: {
      options: [['male', 'female']],
      errorMessage: (_, {req}) => req.t("invalid", {ns: 'validations', key: req.t('gender')})
    },
  },
  dateOfBirth: {
    escape: true,
    trim: true,
    isDate: {
      errorMessage: (_, {req}) => req.t("invalid", {ns: 'validations', key: req.t('date-of-birth')})
    },
  },
});

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

export default {
  update: [updateSchema, errorHandler],
  changePassword: [changePasswordSchema, errorHandler]
};
