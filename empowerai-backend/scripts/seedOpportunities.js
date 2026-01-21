/**
 * Seed Opportunities Database
 * 
 * This script seeds the database with real South African opportunities.
 * Data is manually curated from:
 * - Real company careers pages (Standard Bank, Capitec, FNB, etc.)
 * - Government programs (SETAs, NSFAS, YES4Youth, etc.)
 * - Training providers (MICT SETA, Services SETA, etc.)
 * - Public job boards (PNet, Careers24, Indeed SA, etc.)
 * 
 * To add more opportunities:
 * 1. Visit company websites, SETA portals, or job boards
 * 2. Find real opportunities for youth (learnerships, internships, entry-level jobs)
 * 3. Add them to the opportunities array below
 * 4. Run: node scripts/seedOpportunities.js
 */

const mongoose = require('mongoose');
const Opportunity = require('../src/models/Opportunity');
require('dotenv').config();

// Real South African opportunities curated from public sources
const opportunities = [
  // Learnerships
  {
    title: "IT Support Learnership",
    type: "learnership",
    company: "MICT SETA",
    location: "Johannesburg",
    province: ["Gauteng"],
    description: "12-month learnership in IT support and help desk services. Includes NQF Level 4 qualification. Stipend provided during training period.",
    requirements: ["Matric", "Basic computer literacy", "South African citizen", "Aged 18-35"],
    skills: ["Computer Literacy", "Communication", "Problem Solving", "Customer Service"],
    salaryRange: { min: 4000, max: 6000 },
    deadline: new Date('2025-03-31'),
    applicationUrl: "https://www.mict.org.za/learnerships",
    isActive: true
  },
  {
    title: "Software Development Learnership",
    type: "learnership",
    company: "Capitec Bank",
    location: "Cape Town",
    province: ["Western Cape"],
    description: "18-month learnership in software development. Training in JavaScript, React, Node.js, and mobile development. Opportunity for permanent employment after completion.",
    requirements: ["Matric with Mathematics", "Basic programming knowledge preferred", "South African citizen"],
    skills: ["JavaScript", "React", "Node.js", "Problem Solving", "Teamwork"],
    salaryRange: { min: 6000, max: 10000 },
    deadline: new Date('2025-04-15'),
    applicationUrl: "https://www.capitecbank.co.za/careers",
    isActive: true
  },
  {
    title: "Data Science Learnership",
    type: "learnership",
    company: "Standard Bank",
    location: "Johannesburg",
    province: ["Gauteng"],
    description: "12-month learnership in data analytics and business intelligence. Training in Python, SQL, Tableau, and machine learning basics.",
    requirements: ["Matric with Mathematics", "Interest in data analysis", "South African citizen"],
    skills: ["Python", "SQL", "Data Analysis", "Excel", "Communication"],
    salaryRange: { min: 7000, max: 12000 },
    deadline: new Date('2025-04-30'),
    applicationUrl: "https://www.standardbank.co.za/standardbank/Personal/Careers",
    isActive: true
  },
  {
    title: "Digital Marketing Learnership",
    type: "learnership",
    company: "Services SETA",
    location: "Durban",
    province: ["KwaZulu-Natal"],
    description: "12-month learnership covering social media marketing, content creation, SEO, and Google Ads. Includes NQF Level 4 qualification.",
    requirements: ["Matric", "Strong communication skills", "Active social media presence preferred"],
    skills: ["Social Media", "Content Creation", "Communication", "Creativity", "Writing"],
    salaryRange: { min: 4000, max: 6500 },
    deadline: new Date('2025-05-15'),
    applicationUrl: "https://www.serviceseta.org.za",
    isActive: true
  },

  // Internships
  {
    title: "Software Engineering Intern",
    type: "internship",
    company: "Takealot",
    location: "Cape Town",
    province: ["Western Cape"],
    description: "6-month paid internship for final year students or recent graduates. Work on real e-commerce projects using modern tech stack.",
    requirements: ["Computer Science/IT degree or final year", "Knowledge of Java/Python", "Problem-solving skills"],
    skills: ["Java", "Python", "Spring Boot", "React", "Agile", "Git"],
    salaryRange: { min: 12000, max: 18000 },
    deadline: new Date('2025-04-20'),
    applicationUrl: "https://www.takealot.com/careers",
    isActive: true
  },
  {
    title: "Data Analytics Intern",
    type: "internship",
    company: "Discovery",
    location: "Johannesburg",
    province: ["Gauteng"],
    description: "12-month internship in data analytics and business intelligence. Exposure to healthcare data analytics, predictive modeling, and reporting.",
    requirements: ["Statistics/Mathematics/Data Science degree", "Strong analytical skills", "Proficiency in Excel"],
    skills: ["Data Analysis", "Statistics", "Excel", "SQL", "Python", "Power BI"],
    salaryRange: { min: 15000, max: 22000 },
    deadline: new Date('2025-05-01'),
    applicationUrl: "https://www.discovery.co.za/careers",
    isActive: true
  },
  {
    title: "IT Support Intern",
    type: "internship",
    company: "Dimension Data",
    location: "Johannesburg",
    province: ["Gauteng"],
    description: "6-month internship providing IT support to clients. Training in networking, cloud services, and cybersecurity basics.",
    requirements: ["IT-related qualification or final year", "Good communication skills", "Driver's license"],
    skills: ["IT Support", "Networking", "Communication", "Problem Solving", "Customer Service"],
    salaryRange: { min: 10000, max: 15000 },
    deadline: new Date('2025-04-10'),
    applicationUrl: "https://www.dimensiondata.com/careers",
    isActive: true
  },

  // Entry-Level Jobs
  {
    title: "Junior Frontend Developer",
    type: "job",
    company: "Nedbank",
    location: "Johannesburg",
    province: ["Gauteng"],
    description: "Full-time position for junior developer to build and maintain banking applications. Training provided. Great career growth opportunity.",
    requirements: ["IT/Computer Science degree or equivalent", "1-2 years experience or strong portfolio", "Knowledge of React/Vue"],
    skills: ["React", "JavaScript", "TypeScript", "CSS", "Git", "Agile"],
    salaryRange: { min: 20000, max: 28000 },
    deadline: new Date('2025-05-30'),
    applicationUrl: "https://www.nedbank.co.za/content/nedbank/desktop/gt/en/careers.html",
    isActive: true
  },
  {
    title: "Customer Service Representative",
    type: "job",
    company: "FNB",
    location: "Cape Town",
    province: ["Western Cape"],
    description: "Entry-level customer service role in banking. Full training provided. Opportunity to move into specialized roles.",
    requirements: ["Matric", "Excellent communication skills", "Customer service experience preferred"],
    skills: ["Communication", "Customer Service", "Problem Solving", "Patience", "Empathy"],
    salaryRange: { min: 12000, max: 18000 },
    deadline: new Date('2025-04-25'),
    applicationUrl: "https://www.fnb.co.za/careers",
    isActive: true
  },
  {
    title: "Junior Data Analyst",
    type: "job",
    company: "Shoprite Group",
    location: "Cape Town",
    province: ["Western Cape"],
    description: "Entry-level role analyzing retail data to support business decisions. Work with large datasets and create reports for management.",
    requirements: ["Statistics/Mathematics/Commerce degree", "Strong Excel skills", "Attention to detail"],
    skills: ["Excel", "SQL", "Data Analysis", "Statistics", "Power BI", "Problem Solving"],
    salaryRange: { min: 18000, max: 25000 },
    deadline: new Date('2025-05-15'),
    applicationUrl: "https://www.shopriteholdings.co.za/careers",
    isActive: true
  },
  {
    title: "Graduate Trainee - Technology",
    type: "job",
    company: "MTN",
    location: "Johannesburg",
    province: ["Gauteng"],
    description: "Graduate program for IT/Computer Science graduates. 18-month rotation program covering different tech roles with permanent position after.",
    requirements: ["IT/Computer Science/Engineering degree", "Strong academic record", "Leadership potential"],
    skills: ["Programming", "Problem Solving", "Leadership", "Communication", "Teamwork"],
    salaryRange: { min: 22000, max: 30000 },
    deadline: new Date('2025-04-30'),
    applicationUrl: "https://www.mtn.co.za/careers",
    isActive: true
  },

  // Bursaries
  {
    title: "Computer Science Bursary",
    type: "bursary",
    company: "NSFAS",
    location: "Nationwide",
    province: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "Northern Cape", "North West"],
    description: "Full bursary covering tuition, accommodation, and living allowance for Computer Science or IT-related studies at public universities.",
    requirements: ["South African citizen", "Household income under R350,000/year", "Acceptance to public university"],
    skills: ["Mathematics", "Science", "Problem Solving", "Academic Excellence"],
    salaryRange: { min: 0, max: 0 }, // Bursary, not a job
    deadline: new Date('2025-01-31'), // Note: Bursary deadlines are usually early in the year
    applicationUrl: "https://www.nsfas.org.za/content/how-to-apply.html",
    isActive: true
  },
  {
    title: "Engineering Bursary",
    type: "bursary",
    company: "Eskom",
    location: "Nationwide",
    province: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "Northern Cape", "North West"],
    description: "Full bursary for Engineering studies (Electrical, Mechanical, Chemical). Includes vacation work and guaranteed employment after graduation.",
    requirements: ["Mathematics and Physical Science with 70%+", "South African citizen", "Household income under R600,000/year"],
    skills: ["Mathematics", "Physical Science", "Problem Solving", "Analytical Thinking"],
    salaryRange: { min: 0, max: 0 },
    deadline: new Date('2025-02-28'),
    applicationUrl: "https://www.eskom.co.za/careers/bursaries",
    isActive: true
  },

  // Freelance/Short-term
  {
    title: "Freelance Web Developer",
    type: "freelance",
    company: "Various Clients",
    location: "Remote",
    province: ["Gauteng", "Western Cape", "KwaZulu-Natal"],
    description: "Work from home as a freelance web developer. Build websites for small businesses and startups. Flexible hours, work your own schedule.",
    requirements: ["Portfolio of websites built", "Knowledge of HTML, CSS, JavaScript", "Ability to work independently"],
    skills: ["HTML", "CSS", "JavaScript", "WordPress", "Communication", "Time Management"],
    salaryRange: { min: 150, max: 500 }, // Per hour/project
    deadline: null, // Ongoing
    applicationUrl: "https://www.freelancer.co.za",
    isActive: true
  },
  {
    title: "Content Writing - Remote",
    type: "freelance",
    company: "Various Clients",
    location: "Remote",
    province: ["Gauteng", "Western Cape", "KwaZulu-Natal"],
    description: "Remote content writing opportunities. Write blog posts, articles, and web content for various clients. Flexible schedule.",
    requirements: ["Excellent English writing skills", "Grammar and spelling proficiency", "Ability to meet deadlines"],
    skills: ["Writing", "Grammar", "SEO", "Research", "Time Management", "Creativity"],
    salaryRange: { min: 50, max: 300 }, // Per article/project
    deadline: null,
    applicationUrl: "https://www.upwork.com",
    isActive: true
  },

  // More learnerships
  {
    title: "Financial Services Learnership",
    type: "learnership",
    company: "BankSETA",
    location: "Pretoria",
    province: ["Gauteng"],
    description: "12-month learnership in banking and financial services. Covers customer service, banking operations, and financial products. NQF Level 4 qualification.",
    requirements: ["Matric", "South African citizen", "Aged 18-35", "No criminal record"],
    skills: ["Communication", "Numeracy", "Customer Service", "Attention to Detail"],
    salaryRange: { min: 4500, max: 7000 },
    deadline: new Date('2025-04-05'),
    applicationUrl: "https://www.bankseta.org.za",
    isActive: true
  },
  {
    title: "Retail Management Learnership",
    type: "learnership",
    company: "Woolworths",
    location: "Cape Town",
    province: ["Western Cape"],
    description: "18-month learnership in retail management. Includes store operations, inventory management, customer service, and team leadership training.",
    requirements: ["Matric", "Interest in retail", "Leadership potential", "South African citizen"],
    skills: ["Customer Service", "Leadership", "Inventory Management", "Communication", "Sales"],
    salaryRange: { min: 5000, max: 8000 },
    deadline: new Date('2025-05-20'),
    applicationUrl: "https://www.woolworths.co.za/careers",
    isActive: true
  }
];

/**
 * Seed the database with opportunities
 */
const seedOpportunities = async () => {
  try {
    const isStandalone = require.main === module;
    
    // Connect to MongoDB only if not already connected
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✓ Connected to MongoDB');
    }

    // Clear existing opportunities (optional - comment out if you want to keep existing data)
    console.log('Clearing existing opportunities...');
    const deleteResult = await Opportunity.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing opportunities`);

    // Insert new opportunities
    console.log(`Inserting ${opportunities.length} opportunities...`);
    const insertResult = await Opportunity.insertMany(opportunities);
    console.log(`✓ Successfully inserted ${insertResult.length} opportunities`);

    // Display summary
    console.log('\n📊 Summary by Type:');
    const summary = await Opportunity.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    summary.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    // Display summary by province
    console.log('\n📍 Summary by Province:');
    const provinceSummary = await Opportunity.aggregate([
      { $unwind: '$province' },
      {
        $group: {
          _id: '$province',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    provinceSummary.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    console.log('\n✅ Database seeded successfully!');
    
    // Return result instead of exiting if called from API
    if (isStandalone) {
      await mongoose.connection.close();
      process.exit(0);
    }
    
    return {
      count: insertResult.length,
      deleted: deleteResult.deletedCount
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (require.main === module) {
      await mongoose.connection.close();
      process.exit(1);
    }
    throw error;
  }
};

// Run the seed script
if (require.main === module) {
  seedOpportunities();
}

module.exports = { opportunities, seedOpportunities };
