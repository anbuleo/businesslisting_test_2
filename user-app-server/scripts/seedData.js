const mongoose = require('mongoose');
const Category = require('../models/Category');
const Service = require('../models/Service');
require('dotenv').config();

const categories = [
  {
    name: 'Plumbing',
    description: 'Professional plumbing services for your home and office',
    icon: 'wrench',
    color: '#3B82F6',
    tags: ['pipes', 'water', 'repair', 'installation']
  },
  {
    name: 'Electrical',
    description: 'Licensed electricians for all your electrical needs',
    icon: 'zap',
    color: '#F59E0B',
    tags: ['wiring', 'lights', 'repair', 'installation']
  },
  {
    name: 'Cleaning',
    description: 'Professional cleaning services for homes and offices',
    icon: 'sparkles',
    color: '#10B981',
    tags: ['house cleaning', 'deep cleaning', 'sanitization']
  },
  {
    name: 'Repair & Maintenance',
    description: 'General repair and maintenance services',
    icon: 'tool',
    color: '#8B5CF6',
    tags: ['repair', 'maintenance', 'fixing', 'handyman']
  },
  {
    name: 'Beauty & Wellness',
    description: 'Beauty and wellness services at your doorstep',
    icon: 'heart',
    color: '#EC4899',
    tags: ['beauty', 'wellness', 'spa', 'massage']
  },
  {
    name: 'Appliance Repair',
    description: 'Expert repair services for home appliances',
    icon: 'settings',
    color: '#6B7280',
    tags: ['appliances', 'repair', 'washing machine', 'refrigerator']
  }
];

const services = [
  // Plumbing Services
  {
    name: 'Pipe Leak Repair',
    shortDescription: 'Quick and reliable pipe leak repair service',
    description: 'Professional pipe leak repair service with guaranteed results. Our experienced plumbers will identify and fix leaks quickly to prevent water damage.',
    pricing: { basePrice: 800, advancePayment: 10 },
    duration: { estimated: 60 },
    features: ['Emergency service', 'Quality guarantee', 'Clean work area', 'Free inspection'],
    requirements: ['Access to affected area', 'Water supply shut-off access'],
    availability: {
      serviceAreas: [{ coordinates: [77.2090, 28.6139], radius: 15000, areaName: 'Delhi NCR' }],
      workingHours: {
        monday: { start: '08:00', end: '20:00', available: true },
        tuesday: { start: '08:00', end: '20:00', available: true },
        wednesday: { start: '08:00', end: '20:00', available: true },
        thursday: { start: '08:00', end: '20:00', available: true },
        friday: { start: '08:00', end: '20:00', available: true },
        saturday: { start: '09:00', end: '18:00', available: true },
        sunday: { start: '10:00', end: '16:00', available: false }
      }
    },
    isFeatured: true
  },
  {
    name: 'Toilet Installation',
    shortDescription: 'Complete toilet installation service',
    description: 'Professional toilet installation service including removal of old toilet, installation of new one, and proper sealing.',
    pricing: { basePrice: 1500, advancePayment: 15 },
    duration: { estimated: 120 },
    features: ['Complete installation', 'Old toilet removal', 'Quality fittings', 'Clean-up included'],
    requirements: ['New toilet fixture', 'Clear access to bathroom'],
    availability: {
      serviceAreas: [{ coordinates: [77.2090, 28.6139], radius: 15000, areaName: 'Delhi NCR' }],
      workingHours: {
        monday: { start: '09:00', end: '18:00', available: true },
        tuesday: { start: '09:00', end: '18:00', available: true },
        wednesday: { start: '09:00', end: '18:00', available: true },
        thursday: { start: '09:00', end: '18:00', available: true },
        friday: { start: '09:00', end: '18:00', available: true },
        saturday: { start: '10:00', end: '16:00', available: true },
        sunday: { start: '10:00', end: '16:00', available: false }
      }
    }
  },
  
  // Electrical Services
  {
    name: 'Light Fixture Installation',
    shortDescription: 'Professional light fixture installation',
    description: 'Expert installation of light fixtures including ceiling lights, chandeliers, and wall sconces. Safe and code-compliant work.',
    pricing: { basePrice: 600, advancePayment: 10 },
    duration: { estimated: 45 },
    features: ['Licensed electrician', 'Safety guaranteed', 'Code compliant', 'Clean installation'],
    requirements: ['Light fixture', 'Power shut-off access', 'Ladder access'],
    availability: {
      serviceAreas: [{ coordinates: [77.2090, 28.6139], radius: 15000, areaName: 'Delhi NCR' }],
      workingHours: {
        monday: { start: '08:00', end: '19:00', available: true },
        tuesday: { start: '08:00', end: '19:00', available: true },
        wednesday: { start: '08:00', end: '19:00', available: true },
        thursday: { start: '08:00', end: '19:00', available: true },
        friday: { start: '08:00', end: '19:00', available: true },
        saturday: { start: '09:00', end: '17:00', available: true },
        sunday: { start: '09:00', end: '17:00', available: false }
      }
    },
    isFeatured: true
  },
  {
    name: 'Electrical Wiring Repair',
    shortDescription: 'Safe electrical wiring repair service',
    description: 'Professional electrical wiring repair and replacement service. Our licensed electricians ensure safe and reliable electrical connections.',
    pricing: { basePrice: 1200, advancePayment: 15 },
    duration: { estimated: 90 },
    features: ['Licensed electrician', 'Safety inspection', 'Quality materials', 'Warranty included'],
    requirements: ['Power shut-off access', 'Clear access to wiring area'],
    availability: {
      serviceAreas: [{ coordinates: [77.2090, 28.6139], radius: 15000, areaName: 'Delhi NCR' }],
      workingHours: {
        monday: { start: '08:00', end: '18:00', available: true },
        tuesday: { start: '08:00', end: '18:00', available: true },
        wednesday: { start: '08:00', end: '18:00', available: true },
        thursday: { start: '08:00', end: '18:00', available: true },
        friday: { start: '08:00', end: '18:00', available: true },
        saturday: { start: '09:00', end: '16:00', available: true },
        sunday: { start: '09:00', end: '16:00', available: false }
      }
    }
  },
  
  // Cleaning Services
  {
    name: 'Deep House Cleaning',
    shortDescription: 'Comprehensive deep cleaning service',
    description: 'Complete deep cleaning service for your home including all rooms, kitchen, bathrooms, and common areas. Eco-friendly products used.',
    pricing: { basePrice: 2000, advancePayment: 10 },
    duration: { estimated: 240 },
    features: ['Eco-friendly products', 'All rooms included', 'Kitchen deep clean', 'Bathroom sanitization'],
    requirements: ['Access to all areas', 'Water and electricity', 'Parking space'],
    availability: {
      serviceAreas: [{ coordinates: [77.2090, 28.6139], radius: 15000, areaName: 'Delhi NCR' }],
      workingHours: {
        monday: { start: '08:00', end: '18:00', available: true },
        tuesday: { start: '08:00', end: '18:00', available: true },
        wednesday: { start: '08:00', end: '18:00', available: true },
        thursday: { start: '08:00', end: '18:00', available: true },
        friday: { start: '08:00', end: '18:00', available: true },
        saturday: { start: '09:00', end: '17:00', available: true },
        sunday: { start: '10:00', end: '16:00', available: true }
      }
    },
    isFeatured: true
  },
  {
    name: 'Bathroom Cleaning',
    shortDescription: 'Professional bathroom deep cleaning',
    description: 'Thorough bathroom cleaning and sanitization service. Includes tiles, fixtures, mirrors, and floor cleaning with disinfection.',
    pricing: { basePrice: 500, advancePayment: 10 },
    duration: { estimated: 60 },
    features: ['Deep sanitization', 'Tile cleaning', 'Fixture polishing', 'Mirror cleaning'],
    requirements: ['Access to bathroom', 'Water supply', 'Ventilation'],
    availability: {
      serviceAreas: [{ coordinates: [77.2090, 28.6139], radius: 15000, areaName: 'Delhi NCR' }],
      workingHours: {
        monday: { start: '08:00', end: '18:00', available: true },
        tuesday: { start: '08:00', end: '18:00', available: true },
        wednesday: { start: '08:00', end: '18:00', available: true },
        thursday: { start: '08:00', end: '18:00', available: true },
        friday: { start: '08:00', end: '18:00', available: true },
        saturday: { start: '09:00', end: '17:00', available: true },
        sunday: { start: '10:00', end: '16:00', available: true }
      }
    }
  }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Service.deleteMany({});
    console.log('Cleared existing data');

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`Inserted ${insertedCategories.length} categories`);

    // Map category names to IDs
    const categoryMap = {};
    insertedCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Add category IDs to services
    const servicesWithCategories = services.map(service => {
      let categoryName;
      if (service.name.includes('Pipe') || service.name.includes('Toilet')) {
        categoryName = 'Plumbing';
      } else if (service.name.includes('Light') || service.name.includes('Electrical')) {
        categoryName = 'Electrical';
      } else if (service.name.includes('Cleaning') || service.name.includes('Bathroom Cleaning')) {
        categoryName = 'Cleaning';
      } else {
        categoryName = 'Repair & Maintenance';
      }
      
      return {
        ...service,
        category: categoryMap[categoryName]
      };
    });

    // Insert services
    const insertedServices = await Service.insertMany(servicesWithCategories);
    console.log(`Inserted ${insertedServices.length} services`);

    console.log('✅ Seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();