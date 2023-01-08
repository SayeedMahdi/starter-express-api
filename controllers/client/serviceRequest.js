import asyncHandler from "express-async-handler";
import Service from "../../models/Service.js";
import ServiceRequest from "../../models/ServiceRequest.js";

const ServiceRequestController = {
    /** 
     * @desc    Create Service Request
     * @route   POST /api/v1/request/service
     * @access  Public
     */
    create: asyncHandler(async (req, res) => {
        const { body } = req; 
        
        const service = await ServiceRequest.create({
            ...body,
            gps: {
                longitude: req.body['gps-longitude'],
                latitude: req.body['gps-latitude']
            }
        })
        res.statusCode = 201;
        res.json(service);
    }),

    /** 
     * @desc    Get Service Request
     * @route   GET /api/v1/request/services
     * @access  Public
     */
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
}

export default ServiceRequestController;