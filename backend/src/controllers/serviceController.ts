import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Service from '../models/Service';
import { success, error as errorRes, validationError } from '../utils/apiResponse';

export const getServices = async (req: Request, res: Response) => {
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
        return success(res, services);
    } catch (err: any) {
        console.error(err.message);
        return errorRes(res, 'Server Error');
    }
};

export const createService = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return validationError(res, errors.array());
    }

    try {
        // Fix mass assignment vulnerability
        const newService = new Service({
            name: req.body.name,
            type: req.body.type,
            description: req.body.description,
            priceRange: req.body.priceRange,
            contactInfo: req.body.contactInfo,
            city: req.body.city,
        });

        const service = await newService.save();
        return success(res, service);
    } catch (err: any) {
        console.error(err.message);
        return errorRes(res, 'Server Error');
    }
};
