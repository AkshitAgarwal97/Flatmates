"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createService = exports.getServices = void 0;
const express_validator_1 = require("express-validator");
const Service_1 = __importDefault(require("../models/Service"));
const apiResponse_1 = require("../utils/apiResponse");
const getServices = async (req, res) => {
    try {
        const { city, type } = req.query;
        const filter = {};
        if (city) {
            filter.city = city;
        }
        if (type) {
            filter.type = type;
        }
        const services = await Service_1.default.find(filter).sort({ isPromoted: -1, rating: -1 });
        return (0, apiResponse_1.success)(res, services);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server Error');
    }
};
exports.getServices = getServices;
const createService = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    try {
        // Fix mass assignment vulnerability
        const newService = new Service_1.default({
            name: req.body.name,
            type: req.body.type,
            description: req.body.description,
            priceRange: req.body.priceRange,
            contactInfo: req.body.contactInfo,
            city: req.body.city,
        });
        const service = await newService.save();
        return (0, apiResponse_1.success)(res, service);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server Error');
    }
};
exports.createService = createService;
//# sourceMappingURL=serviceController.js.map