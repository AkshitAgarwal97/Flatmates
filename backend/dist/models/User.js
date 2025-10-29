"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    avatar: {
        type: String
    },
    userType: {
        type: String,
        enum: ['room_seeker', 'roommate_seeker', 'room_provider', 'property_owner'],
        required: true
    },
    socialProvider: {
        type: String,
        enum: ['local', 'google', 'facebook', 'instagram']
    },
    socialId: {
        type: String
    },
    phone: {
        type: String
    },
    bio: {
        type: String
    },
    preferences: {
        location: [String],
        budget: {
            min: Number,
            max: Number
        },
        moveInDate: Date,
        duration: String,
        roomType: String,
        amenities: [String],
        gender: String,
        ageRange: {
            min: Number,
            max: Number
        },
        lifestyle: [String]
    },
    savedProperties: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Property'
        }],
    notifications: [{
            type: {
                type: String,
                enum: ['message', 'property_update', 'system']
            },
            content: String,
            relatedTo: mongoose_1.Schema.Types.ObjectId,
            read: {
                type: Boolean,
                default: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
// Update the updatedAt field on save
UserSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.default = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map