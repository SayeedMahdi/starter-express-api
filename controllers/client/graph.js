import asyncHandler from "express-async-handler";

// @desc      Get single File
// @route     GET /api/v1/packages/:id
// @access    private
const downloadPersianFile = asyncHandler(async (req, res) => {
    res.download('../public/pdf/graph-fa-learning.pdf');
})

const downloadEnglishFile = asyncHandler(async (req, res) => {
    res.download('../public/pdf/graph-en-learning.pdf');
})

export default {
    downloadPersianFile,
    downloadEnglishFile
}