const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Placeholder routes - to be implemented
router.post('/analyze', upload.single('cv'), async (req, res) => {
  // TODO: Analyze uploaded CV
  res.json({ message: 'CV analysis endpoint - to be implemented' });
});

module.exports = router;

