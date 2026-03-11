const express = require('express');
const multer = require('multer');
const { analyzeCV, analyzeCVFile } = require('../controllers/cvController');
const auth = require('../middleware/auth');
const { aiServiceLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// All routes protected by authentication
router.use(auth);

// Apply AI service rate limiter to CV analysis endpoints (configurable)
if (process.env.ENABLE_CV_RATE_LIMITER !== 'false') {
  router.use(aiServiceLimiter);
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const ext = require('path').extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Text-based CV analysis
router.post('/analyze', analyzeCV);

// File upload CV analysis
router.post('/analyze-file', upload.single('cvFile'), analyzeCVFile);

module.exports = router;

