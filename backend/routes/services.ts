import express from 'express';
import Service from '../models/Service';

const router = express.Router();

// @route   GET api/services
// @desc    Get all services (optional filtering by city/type)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { city, type } = req.query;
        const filter: any = {};

        if (city) {
            filter.city = city;
        }
        if (type) {
            filter.type = type;
        }

        const services = await Service.find(filter).sort({ isPromoted: -1, rating: -1 });
        res.json(services);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/services (Admin only - mock)
// @desc    Add a service
router.post('/', async (req, res) => {
    try {
        const newService = new Service(req.body);
        const service = await newService.save();
        res.json(service);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
