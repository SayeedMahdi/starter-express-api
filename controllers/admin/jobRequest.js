import asyncHandler from "express-async-handler";
import JobRequest from "../../models/JobRequest.js";
import mongoose from "mongoose";

const JobRequestController = {
    /** 
     * @desc    Fetch Job Requests
     * @route   GET /api/v1/admin/request/job
     * @access  Public
     */
    getRequests: asyncHandler(async (req, res, next) => {
        req.database = {
            model: JobRequest,
        };

        if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
            req.database.search = {
                $or: [
                    { fullName: { $regex: req.query["q"], $options: "i" } },
                    { email: { $regex: req.query["q"], $options: "i" } },
                ],
            };
        }

        next();
    }),

    /** 
     * @desc    Fetch Job Single Request
     * @route   GET /api/v1/admin/request/job
     * @access  Public
     */
    getRequest: asyncHandler(async ({ user, params: { id }, t }, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next();
        }

        const jobRequest = await JobRequest.findOne({ _id: id }).accessibleBy(user.ability);

        if (!jobRequest) {
            res.status(400);
            throw new Error(t("not-found", { ns: 'validations', key: t('request') }));
        }

        res.json(jobRequest);
    }),

    /** 
     * @desc    Change State of Request
     * @route   PUT /api/v1/admin/request/job/:id/change-state
     * @access  Public
     */
    changeState: asyncHandler(async (req, res, next) => {
        const { user, params: { id }, body } = req;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next();
        }

        const jobRequest = await JobRequest.findOneAndUpdate({ _id: id }, {
            status: body.status,
            updaterId: user.id
        }, { new: true });

        if (!jobRequest) {
            res.status(400);
            throw new Error(t("not-found", { ns: 'validations', key: t('request') }));
        }

        res.json(jobRequest);
    }),
}

export default JobRequestController;