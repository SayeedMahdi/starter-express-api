import { checkSchema, validationResult } from "express-validator";
import Package from "../../../models/Package.js";

const createSchema = checkSchema({
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
      escape: true,
      trim: true,
      errorMessage: (_, { req }) => req.t("already-exists", { ns: 'validations', key: req.t('slug') }),
      options: (slug) => {
        return Package.count({ slug }).then(
          (result) => result !== 0 && Promise.reject()
        );
      },
    },
  },
  province: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('province') }),
    }
  },
  price: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('price') }),
    },
    isNumeric: {
      errorMessage: (_, { req }) => req.t("valid-number", { ns: 'validations', key: req.t('price') }),
    }
  },
  "bandwidth-type": {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('bandwidth') })
    },
    isIn: {
      escape: true,
      trim: true,
      options: [['dedicated', 'shared']],
      errorMessage: (_, { req }) => req.t("enum", {
        ns: 'validations', key: {
          name: req.t('bandwidth-type'),
          value: req.t('dedicated_shared'),
        }
      }),
    }
  },
  type: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('package') })
    },
    isIn: {
      options: [['limited', 'unlimited']],
      errorMessage: (_, { req }) => req.t("enum", {
        ns: 'validations', key: {
          name: req.t('type'),
          value: req.t('limit_type')
        }
      }),
    }
  },
  "is-package-plus": {
    isBoolean: true,
    errorMessage: (_, { req }) => req.t("enum", {
      ns: 'validations', key: {
        name: req.t('package_plus'),
        value: req.t('bool'),
      }
    }),
  },
  "plus-price": {
    custom: {
      escape: true,
      trim: true,
      options: (value, { req }) => {
        if (req.body.hasOwnProperty('is-package-plus') && req.body['is-package-plus']) {
          if (!req.body.hasOwnProperty('plus-price') || !value > 0) {
            return Promise.reject(req.t("required", { ns: 'validations', key: req.t('plus-price') }))
          }
          if (isNaN(value)) {
            return Promise.reject(req.t("valid-number", { ns: 'validations', key: 'plus-price' }));
          }
        }
        return Promise.resolve()
      }
    }
  },
  duration: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('duration') })
    },
    isNumeric: {
      escape: true,
      trim: true,
      errorMessage: (_, { req }) => req.t("valid-number", { ns: 'validations', key: req.t('duration') })
    }
  },
  priority: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('priority') })
    },
    isNumeric: {
      errorMessage: (_, { req }) => req.t("valid-number", { ns: 'validations', key: req.t('priority') })
    }
  },
  category: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('category') })
    },
  },
  bandwidth: {
    escape: true,
    trim: true,
    custom: {
      escape: true,
      trim: true,
      options: (value, { req }) => {
        if (isNaN(value)) {
          return Promise.reject(req.t("valid-number", { ns: 'validations', key: req.t('bandwidth') }));
        }
        return Promise.resolve()
      },
    }
  },
  capacity: {
    escape: true,
    trim: true,
    custom: {
      options: (value, { req }) => {
        if (req.body.hasOwnProperty('type') && req.body.type === 'limited') {
          if (!req.body.hasOwnProperty('capacity') || !String(value).length > 0) {
            return Promise.reject(req.t("required", { ns: 'validations', key: req.t('bandwidth') }))
          } else if (isNaN(value)) {
            return Promise.reject(req.t("valid-number", { ns: 'validations', key: req.t('bandwidth') }));
          }
        }
        return Promise.resolve()
      },
    }
  },
  marker: {
    escape: true,
    trim: true,
    isString: {
      errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t('marker') })
    }

  }
}, ['body']);

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
      escape: true,
      trim: true,
      errorMessage: (_, { req }) => req.t("already-exists", { ns: 'validations', key: req.t('slug') }),
      options: (slug, { req }) => {
        return Package.count({ slug, _id: { $ne: req.params.id } }).then(
          (result) => result !== 0 && Promise.reject()
        );
      },
    },
  },
  province: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('province') }),
    }
  },
  price: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('price') }),
    },
    isNumeric: {
      errorMessage: (_, { req }) => req.t("valid-number", { ns: 'validations', key: req.t('price') }),
    }
  },
  "bandwidth-type": {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('bandwidth') })
    },
    isIn: {
      escape: true,
      trim: true,
      options: [['dedicated', 'shared']],
      errorMessage: (_, { req }) => req.t("enum", {
        ns: 'validations', key: {
          name: req.t('bandwidth-type'),
          value: req.t('dedicated_shared'),
        }
      }),
    }
  },
  type: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('package') })
    },
    isIn: {
      options: [['limited', 'unlimited']],
      errorMessage: (_, { req }) => req.t("enum", {
        ns: 'validations', key: {
          name: req.t('type'),
          value: req.t('limit_type')
        }
      }),
    }
  },
  "is-package-plus": {
    isBoolean: true,
    errorMessage: (_, { req }) => req.t("enum", {
      ns: 'validations', key: {
        name: req.t('package_plus'),
        value: req.t('bool'),
      }
    }),
  },
  "plus-price": {
    custom: {
      escape: true,
      trim: true,
      options: (value, { req }) => {
        if (req.body.hasOwnProperty('is-package-plus') && req.body['is-package-plus']) {
          if (!req.body.hasOwnProperty('plus-price') || !value > 0) {
            return Promise.reject(req.t("required", { ns: 'validations', key: req.t('plus-price') }))
          }
          if (isNaN(value)) {
            return Promise.reject(req.t("valid-number", { ns: 'validations', key: 'plus-price' }));
          }
        }
        return Promise.resolve()
      }
    }
  },
  duration: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('duration') })
    },
    isNumeric: {
      escape: true,
      trim: true,
      errorMessage: (_, { req }) => req.t("valid-number", { ns: 'validations', key: req.t('duration') })
    }
  },
  priority: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('priority') })
    },
    isNumeric: {
      errorMessage: (_, { req }) => req.t("valid-number", { ns: 'validations', key: req.t('priority') })
    }
  },
  category: {
    escape: true,
    trim: true,
    isEmpty: {
      negated: true,
      errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('category') })
    },
  },
  bandwidth: {
    escape: true,
    trim: true,
    custom: {
      escape: true,
      trim: true,
      options: (value, { req }) => {
        if (isNaN(value)) {
          return Promise.reject(req.t("valid-number", { ns: 'validations', key: req.t('bandwidth') }));
        }
        return Promise.resolve()
      },
      // errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('bandwidth') }),
    }
  },
  capacity: {
    escape: true,
    trim: true,
    custom: {
      options: (value, { req }) => {
        if (req.body.hasOwnProperty('type') && req.body.type === 'limited') {
          if (!req.body.hasOwnProperty('capacity') || !String(value).length > 0) {
            return Promise.reject(req.t("required", { ns: 'validations', key: req.t('bandwidth') }))
          } else if (isNaN(value)) {
            return Promise.reject(req.t("valid-number", { ns: 'validations', key: req.t('bandwidth') }));
          }
        }
        return Promise.resolve()
      },
      // errorMessage: (_, { req }) => req.t("required", { ns: 'validations', key: req.t('bandwidth') })
    }
  },
  marker: {
    escape: true,
    trim: true,
    isString: {
      errorMessage: (_, { req }) => req.t("invalid", { ns: 'validations', key: req.t('marker') })
    }

  }
}, ['body']);
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
};
