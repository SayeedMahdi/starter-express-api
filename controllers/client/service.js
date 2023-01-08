import asyncHandler from "express-async-handler";
import Service from "../../models/Service.js";

const ServiceController = {
    // @desc    Get all Services
    // @route   GET /api/v1/services
    // @access  public
    getServices: asyncHandler(async (req, res, next) => {
        req.database = {
            model: Service,
            search: {}
        };

        if (req.query.hasOwnProperty("q") && req.query.q.length > 0) {
            req.database.search["$text"] = { $search: `/${req.query["q"]}/i` }
        }
        next();
    }),

    /**
     * @desc Request for service
     * @route POST /api/v1/services/request
     * @access Public
     */
    requestService: asyncHandler(async (req, res, next) => {
        const { body } = req;
    }),
}
export default ServiceController
