"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roommateController_1 = require("../controllers/roommateController");
const router = express_1.default.Router();
/**
 * @route   GET /api/roommates
 * @desc    Search for roommates
 * @access  Public
 */
router.get('/', roommateController_1.searchRoommates);
exports.default = router;
//# sourceMappingURL=roommates.js.map