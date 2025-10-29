"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const passport_instagram_1 = require("passport-instagram");
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
    // Google OAuth Strategy
    passport.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User_1.default.findOne({ socialId: profile.id, socialProvider: 'google' });
            if (user) {
                return done(null, user);
            }
            // If not, create new user
            user = new User_1.default({
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                socialId: profile.id,
                socialProvider: 'google',
                // Default user type, will be updated during registration completion
                userType: 'room_seeker'
            });
            await user.save();
            return done(null, user);
        }
        catch (err) {
            console.error('Error in Google strategy:', err);
            return done(err, false);
        }
    }));
    // Facebook OAuth Strategy
    passport.use(new passport_facebook_1.Strategy({
        clientID: process.env.FACEBOOK_APP_ID || '',
        clientSecret: process.env.FACEBOOK_APP_SECRET || '',
        callbackURL: '/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'photos', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User_1.default.findOne({ socialId: profile.id, socialProvider: 'facebook' });
            if (user) {
                return done(null, user);
            }
            // If not, create new user
            user = new User_1.default({
                name: profile.displayName,
                email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`,
                avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                socialId: profile.id,
                socialProvider: 'facebook',
                // Default user type, will be updated during registration completion
                userType: 'room_seeker'
            });
            await user.save();
            return done(null, user);
        }
        catch (err) {
            console.error('Error in Facebook strategy:', err);
            return done(err, false);
        }
    }));
    // Instagram OAuth Strategy
    passport.use(new passport_instagram_1.Strategy({
        clientID: process.env.INSTAGRAM_CLIENT_ID || '',
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
        callbackURL: '/api/auth/instagram/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User_1.default.findOne({ socialId: profile.id, socialProvider: 'instagram' });
            if (user) {
                return done(null, user);
            }
            // If not, create new user
            user = new User_1.default({
                name: profile.displayName || profile.username,
                // Instagram API doesn't provide email, so we create a placeholder
                email: `${profile.id}@instagram.com`,
                avatar: profile._json.data.profile_picture,
                socialId: profile.id,
                socialProvider: 'instagram',
                // Default user type, will be updated during registration completion
                userType: 'room_seeker'
            });
            await user.save();
            return done(null, user);
        }
        catch (err) {
            console.error('Error in Instagram strategy:', err);
            return done(err, false);
        }
    }));
};
exports.default = configurePassport;
//# sourceMappingURL=passport.js.map