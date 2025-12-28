"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const listingController_1 = require("../controllers/listingController");
const router = (0, express_1.Router)();
// All listing endpoints require JWT auth
router.use(passport_1.default.authenticate('jwt', { session: false }));
// GET /api/listings – filter, pagination, optional bbox/radius
router.get('/', listingController_1.getListings);
// GET /api/listings/nearby – map clustering helper
router.get('/nearby', listingController_1.getNearby);
exports.default = router;
//# sourceMappingURL=listings.js.map