const CvProfile = require("../models/cvProfile");

// ─── CREATE ───────────────────────────────────────────────

const createCvProfile = async (userId) => {
  const profile = new CvProfile({ userId });
  return await profile.save();
};

// ─── READ ─────────────────────────────────────────────────

const findByUserId = async (userId) => {
  return await CvProfile.findOne({ userId });
};

const findById = async (id) => {
  return await CvProfile.findById(id);
};

// ─── UPDATE ───────────────────────────────────────────────

const updateByUserId = async (userId, data) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true }
  );
};

const pushEducation = async (userId, education) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $push: { education } },
    { new: true }
  );
};

const updateEducationEntry = async (userId, educationId, data) => {
  return await CvProfile.findOneAndUpdate(
    { userId, "education._id": educationId },
    { $set: { "education.$": data } },
    { new: true }
  );
};

const removeEducationEntry = async (userId, educationId) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $pull: { education: { _id: educationId } } },
    { new: true }
  );
};

const pushExperience = async (userId, experience) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $push: { experience } },
    { new: true }
  );
};

const updateExperienceEntry = async (userId, experienceId, data) => {
  return await CvProfile.findOneAndUpdate(
    { userId, "experience._id": experienceId },
    { $set: { "experience.$": data } },
    { new: true }
  );
};

const removeExperienceEntry = async (userId, experienceId) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $pull: { experience: { _id: experienceId } } },
    { new: true }
  );
};

const updateSkills = async (userId, skills) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $set: { skills } },
    { new: true }
  );
};

const updateSocialLinks = async (userId, socialLinks) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $set: { socialLinks } },
    { new: true }
  );
};

const updateAchievements = async (userId, achievements) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $set: { achievements } },
    { new: true }
  );
};

const updateCertifications = async (userId, certifications) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $set: { certifications } },
    { new: true }
  );
};

// ─── DELETE ───────────────────────────────────────────────

const deleteByUserId = async (userId) => {
  return await CvProfile.findOneAndDelete({ userId });
};

// ─── UPSERT ───────────────────────────────────────────────

const upsertByUserId = async (userId, data) => {
  return await CvProfile.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );
};

module.exports = {
  createCvProfile,
  findByUserId,
  findById,
  updateByUserId,
  pushEducation,
  updateEducationEntry,
  removeEducationEntry,
  pushExperience,
  updateExperienceEntry,
  removeExperienceEntry,
  updateSkills,
  updateSocialLinks,
  updateAchievements,
  updateCertifications,
  deleteByUserId,
  upsertByUserId,
};