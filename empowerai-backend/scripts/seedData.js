const mongoose = require('mongoose');
const Opportunity = require('../src/models/Opportunity');
require('dotenv').config();

const opportunities = [
  {
    title: "Software Development Learnership",
    type: "learnership",
    company: "Tech Company SA",
    location: "Johannesburg",
    province: ["Gauteng"],
    description: "12-month learnership in software development",
    requirements: ["Matric", "Basic computer skills"],
    skills: ["JavaScript", "HTML", "CSS"],
    salaryRange: { min: 5000, max: 8000 },
    deadline: new Date('2025-03-30'),
    applicationUrl: "https://example.com/apply"
  }
  // Add more sample data...
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Opportunity.deleteMany();
    await Opportunity.insertMany(opportunities);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();