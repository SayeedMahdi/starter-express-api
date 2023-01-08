import cloudinary from "./cloudinary.js";

const uploadToCloudinary = async (req, res, next) => {
    req.body.cloudinary = null;

    try {
        if (req?.file) {
            const uploadResponse = await cloudinary.uploader.upload(req?.file?.path, {
                upload_preset: 'raha_setups',
            });

            req.body.cloudinary = uploadResponse;

        }

    } catch (err) {
        console.error("asd", err);
        return res.status(500).json({ err: err, s: 'Something went wrong' });
    }

    next()
}

export default uploadToCloudinary;