import { checkSchema, validationResult } from "express-validator";
import Category from "../../../models/Category.js";

const createSchema = checkSchema({
  escape: true,
  trim: true,
  name: {
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("name") }),
    }
  },
  slug: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t("slug") }),
    },
    custom: {
      options: async slug => await Category.countDocuments({ slug }) && Promise.reject(),
      errorMessage: (_, { req }) => req.t("already-exists", { ns: 'validations', key: req.t("slug") }),
    }
  },
  type: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('type') }),
    },
    isIn: {
      options: [['blog', 'package', 'faq']],
      errorMessage: (_, { req }) => req.t("enum", {
        ns: 'validations', key: {
          name: req.t('type'),
          value: req.t('blog_package'),
        }
      }),
    }
  }
});

const updateSchema = checkSchema({
  name: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('name') }),
    }
  },
  slug: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('slug') }),
    },
    custom: {
      options: async (slug, { req: { params: { id } } }) => await Category.countDocuments({ slug, _id: { $ne: id } }) && Promise.reject(),
      errorMessage: (_, { req }) => req.t("already-exists", { ns: 'validations', key: req.t('slug') }),
    }
  },
  type: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('type') }),
    },
    isIn: {
      escape: true,
      trim: true,
      options: [['blog', 'package', 'faq']],
      errorMessage: (_, { req }) => req.t("enum", {
        ns: 'validations', key: {
          name: req.t('type'),
          value: req.t('blog_package'),
        }
      }),
    }
  }
});

const updateLocalSchema = checkSchema({
  "name-fa": {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('persian name') }),
    }
  },
  "name-ps": {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('pashto name') }),
    }
  },
  "name-en": {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('english name') }),
    }
  }
});

const deleteSchema = checkSchema({
  id: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('item-id', { key: "Category" }) }),
    }
  }
});

const errorHandler = (req, res, next) => {
  // handling validation errors
  const validationErrs = validationResult(req);
  if (!validationErrs.isEmpty()) {
    return res.status(400).json({ errors: validationErrs.array() });
  }
  next();
};

export default {
  create: [createSchema, errorHandler],
  update: [updateSchema, errorHandler],
  updateLocal: [updateLocalSchema, errorHandler],
  delete: [deleteSchema, errorHandler]
}