import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../src/models/Service';

dotenv.config();

const mockServices = [
  {
    name: 'Porter Packers & Movers',
    type: 'movers',
    description: 'Hassle-free house shifting with verified staff, real-time tracking, and doorstep packing.',
    priceRange: '₹3,000 - ₹12,000',
    contactInfo: {
      phone: '+91 80 4410 4410',
      email: 'support@porter.in',
      website: 'https://porter.in'
    },
    rating: 4.8,
    isPromoted: true,
    city: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad']
  },
  {
    name: 'NoBroker Home Cleaning',
    type: 'cleaning',
    description: 'Deep home cleaning, kitchen sanitization, bathroom scrubbing, and sofa deep wash by trained experts.',
    priceRange: '₹1,500 - ₹5,000',
    contactInfo: {
      phone: '+91 92417 00000',
      email: 'cleaning@nobroker.in',
      website: 'https://nobroker.in'
    },
    rating: 4.6,
    isPromoted: true,
    city: ['Bangalore', 'Mumbai', 'Delhi', 'Pune']
  },
  {
    name: 'Furlenco Furniture Rental',
    type: 'furniture_rental',
    description: 'Rent premium beds, sofas, study tables, and home appliances with free delivery and maintenance.',
    priceRange: '₹500 - ₹3,500 / month',
    contactInfo: {
      phone: '+91 80 4680 8080',
      email: 'support@furlenco.com',
      website: 'https://furlenco.com'
    },
    rating: 4.7,
    isPromoted: false,
    city: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad']
  },
  {
    name: 'ACT Fibernet Broadband',
    type: 'internet',
    description: 'High-speed gigabit fiber broadband for working from home, streaming, and gaming.',
    priceRange: '₹799 - ₹1,499 / month',
    contactInfo: {
      phone: '+91 80 4284 0000',
      email: 'helpdesk@actcorp.in',
      website: 'https://actcorp.in'
    },
    rating: 4.5,
    isPromoted: false,
    city: ['Bangalore', 'Hyderabad', 'Chennai', 'Delhi']
  },
  {
    name: 'Rentomojo Appliances & Furniture',
    type: 'furniture_rental',
    description: 'Rent refrigerators, washing machines, TVs, and bedroom sets with easy monthly plans.',
    priceRange: '₹399 - ₹2,999 / month',
    contactInfo: {
      phone: '+91 80 4680 0000',
      email: 'jo@rentomojo.com',
      website: 'https://rentomojo.com'
    },
    rating: 4.6,
    isPromoted: true,
    city: ['Bangalore', 'Mumbai', 'Delhi', 'Pune']
  }
];

const seedServices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flatmates');
    console.log('MongoDB Connected');

    await Service.deleteMany({});
    console.log('Cleared existing services');

    await Service.insertMany(mockServices);
    console.log('Seeded services data successfully');

    process.exit();
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();
