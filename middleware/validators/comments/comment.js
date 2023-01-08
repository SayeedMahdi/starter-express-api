import { checkSchema, validationResult } from "express-validator";

const errorHandler = (req, res, next) => {
  // handling validation errors
  const validationErrs = validationResult(req);
  if (!validationErrs.isEmpty()) {
    return res.status(400).json({ errors: validationErrs.array() });
  }

  next();
};

const commentSchema = checkSchema({
  content: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('content') })
    }
  },
});

export default {
  createAndUpdate: [commentSchema, errorHandler],
};
