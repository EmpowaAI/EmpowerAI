const mongoose = require("mongoose");

// 🎓 EDUCATION SCHEMA
const educationSchema = new mongoose.Schema({
  institution: String,
  qualification: String,
  fieldOfStudy: String,
  startYear: Number,
  endYear: Number,
});

// 💼 EXPERIENCE SCHEMA
const experienceSchema = new mongoose.Schema({
  company: String,
  jobTitle: String,
  startYear: Number,
  endYear: Number,
  description: String,
});

// 🧠 CV PROFILE SCHEMA
const cvProfileSchema = new mongoose.Schema(
  {
    // 🔗 LINK TO USER
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // 👤 PROFILE DATA
    about: String,
    age: Number,
    address: String,
    phone: String,

    // 🎓 EDUCATION
    education: [educationSchema],

    // 💼 EXPERIENCE
    experience: [experienceSchema],

    // 🛠 SKILLS
    skills: [String],

    // 🔗 SOCIAL LINKS
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
    },

    // 🏆 ACHIEVEMENTS
    achievements: [String],

    // 📜 CERTIFICATIONS
    certifications: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CvProfile", cvProfileSchema);