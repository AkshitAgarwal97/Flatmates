"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Service_1 = __importDefault(require("../models/Service"));
const router = express_1.default.Router();
// @route   GET api/services
// @desc    Get all services (optional filtering by city/type)
// @access  Public
router.get('/', async (req, res) => {
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
        res.json(services);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   POST api/services (Admin only - mock)
// @desc    Add a service
router.post('/', async (req, res) => {
    try {
        const newService = new Service_1.default(req.body);
        const service = await newService.save();
        res.json(service);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map