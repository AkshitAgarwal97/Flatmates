"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const User_1 = __importDefault(require("../models/User"));
const configurePassport = (passport) => {
    // JWT Strategy for token authentication
    const opts = {
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret'
    };
    passport.use(new passport_jwt_1.Strategy(opts, async (jwt_payload, done) => {
        try {
            const user = await User_1.default.findById(jwt_payload.id);
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        }
        catch (err) {
            console.error('Error in JWT strategy:', err);
            return done(err, false);
        }
    }));
};
exports.default = configurePassport;
//# sourceMappingURL=passport.js.map