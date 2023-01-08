import {checkSchema, validationResult} from "express-validator";

const errorHandler = (req, res, next) => {
  const validationErrs = validationResult(req);
  if (!validationErrs.isEmpty()) {
    return res.status(400).json({errors: validationErrs.array()});
  }
  next();
};

const ServiceSchema = checkSchema({
  icon: {
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, {req}) => req.t("required", {ns: 'validations', key: 'icon'}),
    },
  },
  name: {
    trim: true,
    escape: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, {req}) => req.t("required", {ns: 'validations', key: 'name'})
    },
  },
  description: {
    trim: true,
    escape: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, {req}) => req.t("required", {ns: 'validations', key: 'description'})
    },
  },
});

const RequestServiceSchema = checkSchema({
  service: {
    trim: true,
    escape: true,
    isMongoId: {
      errorMessage: (_, {req}) => req.t("invalid", { key: "service"})
    },
    isEmpty: {
      negated: true,
      errorMessage: (_, {req}) => req.t("required", {ns: 'validations', key: 'service'})
    }
  }

});

export default {
  create: [ServiceSchema, errorHandler],
  update: [ServiceSchema, errorHandler],
  requestService: [RequestServiceSchema, errorHandler]
};
