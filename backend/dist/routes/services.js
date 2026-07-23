"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const serviceController_1 = require("../controllers/serviceController");
const express_2 = require("../types/express"); // Preparing for Phase 3.1
const router = express_1.default.Router();
// @route   GET api/services
// @desc    Get all services (optional filtering by city/type)
// @access  Public
router.get('/', (0, express_2.wrapHandler)(serviceController_1.getServices));
// @route   POST api/services
// @desc    Add a service
// @access  Private (requires authentication)
router.post('/', [
    auth_1.protect,
    (0, express_validator_1.check)('name', 'Service name is required').not().isEmpty(),
    (0, express_validator_1.check)('type', 'Service type is required').isIn(['movers', 'cleaning', 'furniture_rental', 'internet', 'other']),
    (0, express_validator_1.check)('description', 'Description is required').not().isEmpty(),
], (0, express_2.wrapHandler)(serviceController_1.createService));
exports.default = router;
//# sourceMappingURL=services.js.map