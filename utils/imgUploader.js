import multer from "multer";
import path from "path";
import util from "util";
import { existsSync, mkdirSync } from "fs";
import { body } from "express-validator";

const getUploadDir = () => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const date = new Date();

  const year = date.getFullYear().toString();
  const month = monthNames[date.getMonth()];
  const day = date.getDate().toString();

  if (!existsSync(process.env.UPLOAD_DIR))
    mkdirSync(process.env.UPLOAD_DIR);

  if (!existsSync(path.join(process.env.UPLOAD_DIR, year)))
    mkdirSync(path.join(process.env.UPLOAD_DIR, year));

  if (!existsSync(path.join(process.env.UPLOAD_DIR, year, month)))
    mkdirSync(path.join(process.env.UPLOAD_DIR, year, month));

  if (!existsSync(path.join(process.env.UPLOAD_DIR, year, month, day)))
    mkdirSync(path.join(process.env.UPLOAD_DIR, year, month, day));

  return path.join(process.env.UPLOAD_DIR, year, month, day);
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, getUploadDir());
  },

  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

function MulterError(message, field = null, code = 400) {
  Error.captureStackTrace(this, this.constructor);
  this.message = message;
  this.code = code;
  this.name = this.constructor.name;
  if (field) this.field = field;
}
util.inherits(MulterError, Error);

function checkFileType(req, file, cb) {
  const filetypes = /jpg|jpeg|png|mp4|m4a/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (!extname || !mimetype)
    return cb(
      new MulterError(
        req.t("allowed-format", { ns: 'validations' }),
        file.fieldname
      )
    );

  return cb(null, true);
}

const imageUploader = multer({
  storage,
  limits: { fileSize: (process.env.MAX_UPLOAD_FILE_SIZE || 800) * 1024 },
  fileFilter: function (req, file, cb) {
    return checkFileType(req, file, cb);
  },
});

export default (field) => {
  const imageUpload = imageUploader.single(field);
  return (req, res, next) => {
    imageUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError || err instanceof MulterError)
        await body(err.field)
          .custom(() => Promise.reject(err.message))
          .run(req);
      next();
    });
  };
};
