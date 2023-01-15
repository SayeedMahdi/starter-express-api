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
        const businessPackage = await ServiceRequest.find().populate('service', 'name')

        if (!businessPackage) {
            res.status(404)
            throw new Error(t("not-found", { ns: "validations", key: t("package") }))
        }

        res.json(businessPackage)
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

        const businessPackage = await ServiceRequest.findOne({ _id: id }).populate('service', 'name')

        if (!businessPackage) {
            res.status(400);
            throw new Error(t("not-found", { ns: 'validations', key: t('request') }));
        }

        res.json(businessPackage);
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

        const businessPackage = await ServiceRequest.findOneAndUpdate({ _id: id }, {
            status: body.status,
            updaterId: user.id
        }, { new: true }).populate('service', 'name')

        if (!businessPackage) {
            res.status(400);
            throw new Error(t("not-found", { ns: 'validations', key: t('request') }));
        }

        res.json(businessPackage);
    }),
}

export default ServiceRequestController;