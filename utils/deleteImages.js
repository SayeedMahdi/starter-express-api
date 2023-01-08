import fs from 'fs';

const removeOldImages = media => {
    // Remove Original Image
    if (fs.existsSync(media.path)) {
        fs.unlinkSync(media.path);
    }
    // Remove Sub-image types
    const deleteImgPath = Object.values(media?.sizes);
    deleteImgPath?.forEach(path => {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path)
        }
    });
}

export default removeOldImages