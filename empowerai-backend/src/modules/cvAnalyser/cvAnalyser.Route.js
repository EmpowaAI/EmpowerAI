const express = require('express');
const multer = require('multer');
const path = require('path');
const { analyzeCV, analyzeCVFile, revampCV, getCvProfile, deleteCvProfile } = require('./cvAnalyser.Controller');
const auth = require('../../middleware/auth');
const validateRequest = require('../../middleware/validate');
const { cvAnalysisSchema, cvRevampSchema } = require('../../utils/validators');
const router = express.Router();

// All routes protected by authentication
router.use(auth);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Text-based CV analysis
router.post('/analyze', validateRequest(cvAnalysisSchema), analyzeCV);

// File upload CV analysis
router.post('/analyze-file', upload.single('cvFile'), analyzeCVFile);

// Read/delete a user's stored CV profile (analysis summary + metadata)
router.get('/profile', getCvProfile);
router.delete('/profile', deleteCvProfile);

// CV revamp (structured rewrite)
router.post('/revamp', validateRequest(cvRevampSchema), revampCV);

module.exports = router;
