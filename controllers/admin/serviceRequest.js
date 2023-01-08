import asyncHandler from "express-async-handler";
import ServiceRequest from "../../models/ServiceRequest.js";
import mongoose from "mongoose";

const ServiceRequestController = {
    /** 
     * @desc    Fetch Service Requests
     * @route   GET /api/v1/admin/request/service
     * @access  Private/Admin
     */
    getRequests: asyncHandler(async (req, res, next) => {
        req.database = {
            model: ServiceRequest,
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
     * @desc    Fetch Service Single Request
     * @route   GET /api/v1/admin/request/service
     * @access  Private/Admin
     */
    getRequest: asyncHandler(async ({ user, params: { id }, t }, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next();
        }

        const serviceRequest = await ServiceRequest.findOne({ _id: id }).accessibleBy(user.ability);

        if (!serviceRequest) {
            res.status(400);
            throw new Error(t("not-found", { ns: 'validations', key: t('request') }));
        }

        res.json(serviceRequest);
    }),

    /** 
     * @desc    Change State of Request
     * @route   PUT /api/v1/admin/request/service/:id/change-state
     * @access  Private/Admin
     */
    changeState: asyncHandler(async (req, res, next) => {
        const { user, params: { id }, body } = req;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next();
        }

        const serviceRequest = await ServiceRequest.findOneAndUpdate({ _id: id }, {
            status: body.status,
            updaterId: user.id
        }, { new: true });

        if (!serviceRequest) {
            res.status(400);
            throw new Error(t("not-found", { ns: 'validations', key: t('request') }));
        }

        res.json(serviceRequest);
    }),
}

export default ServiceRequestController;