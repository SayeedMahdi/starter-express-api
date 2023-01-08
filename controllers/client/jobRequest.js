import asyncHandler from "express-async-handler";
import JobRequest from "../../models/JobRequest.js";

const JobRequestController = {
    /** 
     * @desc    Create Job Request
     * @route   POST /api/v1/request/job
     * @access  Public
     */
    create: asyncHandler(async (req, res) => {
        const { body, file } = req;

        const job = await JobRequest.create({
            ...body,
            attachments: file.path
        })

        res.statusCode = 201;
        res.json(job);
    })
}

export default JobRequestController;