import multer from 'multer'
import { imageSizes } from '../config/global.js';
import path from 'path';
import util from "util";
import { existsSync, mkdirSync } from 'fs'
import sharp from 'sharp';
import { body as validationBody } from "express-validator";

const getUploadDir = (newFileName) => {
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

    return path.join(process.env.UPLOAD_DIR, year, month, day, newFileName);
};

const multerStorage = multer.memoryStorage();

function MulterError(message, field = null, code = 400) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.code = code;
    this.name = this.constructor.name;
    if (field) this.field = field;
}
util.inherits(MulterError, Error);

function checkFileType(req, file, cb) {
    const filetypes = /jpg|jpeg|png/;
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

const upload = multer({
    storage: multerStorage,
    limits: { fileSize: (process.env.MAX_UPLOAD_FILE_SIZE || 800) * 1024 },
    fileFilter: function (req, file, cb) {
        return checkFileType(req, file, cb);
    }
});

const uploadFiles = upload.single('image');

const uploadImages = (req, res, next) => {
    uploadFiles(req, res, async (err) => {
        if (err instanceof multer.MulterError || err instanceof MulterError) {
            await validationBody(err.field)
                .custom(() => Promise.reject(err.message))
                .run(req);
        }
        next();
    });
};

const resizeImages = async (req, res, next) => {
    const { body, file } = req
    body.images = [];

    if (!file) {
        console.log('no image');
        return next();
    }

    Promise.all(
        imageSizes.map(async size => {
            const newFilename = `${Date.now()}-${size?.label}${path.extname(file.originalname)}`;
            const imagePath = getUploadDir(newFilename);
            console.log(body.images);
            await sharp(file?.buffer, { limitInputPixels: false })
                .resize(size?.width)
                .toFile(imagePath)
                .then(img => {
                    return body.images.push(
                        { ...img, mimeType: img.format, path: imagePath, type: size.label, name: file.originalname })
                });
        })
    )
        .then(() => next());
};

export default [uploadImages, resizeImages]