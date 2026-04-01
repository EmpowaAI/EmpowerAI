const express = require('express');
const multer = require('multer');
const path = require('path');

const { analyzeCV, analyzeCVFile, revampCV, getCvProfile } = require('../controllers/cvController');
const auth = require('../middleware/auth');
const { aiServiceLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validate');
const { cvAnalysisSchema, cvRevampSchema } = require('../utils/validators');

const router = express.Router();

// ─── AUTH ─────────────────────────────────────────────────

router.use(auth);

// ─── RATE LIMITER (optional) ──────────────────────────────

if (process.env.ENABLE_CV_RATE_LIMITER !== 'false') {
  router.use(aiServiceLimiter);
}

// ─── MULTER ───────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
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

// ─── ROUTES ───────────────────────────────────────────────

// GET  /api/cv/profile        → fetch saved CvProfile for logged-in user
router.get('/profile', getCvProfile);

// POST /api/cv/analyze        → analyze CV from raw text
router.post('/analyze', validateRequest(cvAnalysisSchema), analyzeCV);

// POST /api/cv/analyze-file   → analyze CV from uploaded file
router.post('/analyze-file', upload.single('cvFile'), analyzeCVFile);

// POST /api/cv/revamp         → structured CV rewrite
router.post('/revamp', validateRequest(cvRevampSchema), revampCV);

module.exports = router;
