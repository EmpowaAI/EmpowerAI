const express = require('express');
const multer = require('multer');
const path = require('path');
const { analyzeCV, analyzeCVFile, revampCV, getCvProfile, deleteCvProfile } = require('./cvAnalyser.Controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validateRequest = require('../../middleware/validate');
const { cvAnalysisSchema, cvRevampSchema } = require('../../utils/validators');
const router = express.Router();

router.use(protect);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, 
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

router.post('/analyze', validateRequest(cvAnalysisSchema), analyzeCV);
router.post('/analyze-file', upload.single('cvFile'), analyzeCVFile);

router.get('/profile',protect, getCvProfile);
router.delete('/profile',protect, deleteCvProfile);

router.post('/revamp', validateRequest(cvRevampSchema), revampCV);

module.exports = router;
