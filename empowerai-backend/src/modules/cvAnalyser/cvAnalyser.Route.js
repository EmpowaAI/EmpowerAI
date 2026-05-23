const express = require('express');
const multer = require('multer');
const path = require('path');

const {
  analyzeCV,
  analyzeCVFile,
  revampCV,
  downloadRevampedCV,
  getCvProfile,
  deleteCvProfile,
  restoreFromCachedAnalysis,
} = require('./cvAnalyser.Controller');

const { protect } = require('../../middleware/auth');
const { requireActiveSubscription, checkUsageLimit } = require('../../middleware/subscription.middleware');
const validateRequest = require('../../middleware/validate');
const { cvAnalysisSchema } = require('../../utils/validators');

const router = express.Router();

// All CV routes require authentication
router.use(protect);

// ── Multer ────────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  },
});

// ── CV Analysis ───────────────────────────────────────────────────────────────
// Free users: max 3 analyses (checked inside service via analysisCount)
// No subscription middleware here — free users are allowed, limit enforced in service

router.post('/analyze', validateRequest(cvAnalysisSchema), analyzeCV);
router.post('/analyze-file', upload.single('cvFile'), analyzeCVFile);
router.post('/restore-from-cache', restoreFromCachedAnalysis);

// ── CV Revamp (subscription only) ─────────────────────────────────────────────
router.post(
  '/revamp',
  requireActiveSubscription,
  checkUsageLimit('cv_revamp'),
  revampCV
);

// ── Download revamped CV (subscription only) ──────────────────────────────────
// ?format=docx (default) or ?format=txt
router.get(
  '/revamp/download',
  requireActiveSubscription,
  downloadRevampedCV
);

// ── CV Profile ────────────────────────────────────────────────────────────────
router.get('/profile', getCvProfile);
router.delete('/profile', deleteCvProfile);

module.exports = router;
