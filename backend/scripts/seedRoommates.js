const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const User = require('../models/User').default; // This is tricky with TS compilation.

// We will define a temporary schema here to avoid compilation issues with the main User model if we run in pure JS mode
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    avatar: String,
    gender: String,
    dob: Date,
    occupation: String,
    personalLifestyle: {
        food: String,
        smoking: Boolean,
        drinking: Boolean,
        cleanliness: String
    },
    preferences: {
        budget: { min: Number, max: Number },
        location: [String],
        moveInDate: Date,
        lifestyle: [String]
    },
    isRoommateListed: { type: Boolean, default: false },
    isPhoneVerified: Boolean,
    isIdVerified: Boolean,
    lastActive: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

dotenv.config();

const mockRoommates = [
    {
        name: 'Aarav Gupta',
        email: 'aarav.demo@example.com',
        password: 'password123',
        gender: 'Male',
        dob: new Date('1998-05-15'), // 25 years old
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        occupation: 'Professional',
        personalLifestyle: {
            food: 'Non-Veg',
            smoking: false,
            drinking: true,
            cleanliness: 'High'
        },
        preferences: {
            budget: { min: 15000, max: 25000 },
            location: ['Koramangala', 'HSR Layout', 'Indiranagar'],
            moveInDate: new Date(),
            lifestyle: ['Non-Smoker']
        },
        isRoommateListed: true,
        isPhoneVerified: true,
        isIdVerified: true
    },
    {
        name: 'Priya Sharma',
        email: 'priya.demo@example.com',
        password: 'password123',
        gender: 'Female',
        dob: new Date('2001-08-20'), // 22 years old
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        occupation: 'Student',
        personalLifestyle: {
            food: 'Veg',
            smoking: false,
            drinking: false,
            cleanliness: 'Medium'
        },
        preferences: {
            budget: { min: 10000, max: 18000 },
            location: ['Viman Nagar', 'Kalyani Nagar'],
            moveInDate: new Date(),
            lifestyle: ['Non-Smoker', 'Vegetarian']
        },
        isRoommateListed: true,
        isPhoneVerified: true
    },
    // Add more from previous TS file if needed
    {
        name: 'Rohan Mehta',
        email: 'rohan.demo@example.com',
        password: 'password123',
        gender: 'Male',
        dob: new Date('1996-12-10'), // 27 years old
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        occupation: 'WFH',
        personalLifestyle: {
            food: 'Non-Veg',
            smoking: true,
            drinking: true,
            cleanliness: 'Medium'
        },
        preferences: {
            budget: { min: 20000, max: 35000 },
            location: ['Saket', 'Malviya Nagar'],
            moveInDate: new Date(),
            lifestyle: ['Open Minded']
        },
        isRoommateListed: true,
        isPhoneVerified: true,
        isIdVerified: true
    },
    {
        name: 'Sneha Patel',
        email: 'sneha.demo@example.com',
        password: 'password123',
        gender: 'Female',
        dob: new Date('1999-03-25'), // 24 years old
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        occupation: 'Professional',
        personalLifestyle: {
            food: 'Veg',
            smoking: false,
            drinking: true,
            cleanliness: 'High'
        },
        preferences: {
            budget: { min: 12000, max: 20000 },
            location: ['Andheri West', 'Juhu'],
            moveInDate: new Date(),
            lifestyle: ['Clean']
        },
        isRoommateListed: true,
        isPhoneVerified: true,
        isIdVerified: true
    },
    {
        name: 'Vikram Singh',
        email: 'vikram.demo@example.com',
        password: 'password123',
        gender: 'Male',
        dob: new Date('1995-11-05'), // 28 years old
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        occupation: 'Professional',
        personalLifestyle: {
            food: 'Veg',
            smoking: false,
            drinking: true,
            cleanliness: 'Medium'
        },
        preferences: {
            budget: { min: 18000, max: 30000 },
            location: ['Cyber City', 'DLF Phase 3'],
            moveInDate: new Date(),
            lifestyle: ['Gym Goer']
        },
        isRoommateListed: true,
        isPhoneVerified: true
    }
];

const seedRoommates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flatmates');
        console.log('MongoDB Connected');

        // Delete existing demo users to avoid duplicates
        await User.deleteMany({ email: { $regex: 'demo@example.com' } });
        console.log('Cleared existing demo users');

        await User.insertMany(mockRoommates);
        console.log('Seeded roommates data successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedRoommates();
