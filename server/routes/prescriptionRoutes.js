const express = require('express');
const router = express.Router();
const { analyzePrescription, preprocessText, extractTextFromImage } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const os = require('os');
const path = require('path');

// Protect all prescription routes
router.use(protect);

// Preprocess OCR text route
router.post('/preprocess', preprocessText);

// Analyze prescription route
router.post('/analyze', analyzePrescription);

// Configure multer for Vercel compatibility
const memoryStorage = multer.memoryStorage();
const fileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Use system temp directory for file storage
    cb(null, os.tmpdir());
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Ensure filename has proper extension
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Choose appropriate storage based on environment
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const storage = isVercel ? memoryStorage : fileStorage;

// Extract text from images using Llama Scout
router.post('/extract-text', multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit for Vercel
  },
  fileFilter: (req, file, cb) => {
    // Accept only jpg and png
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG images are allowed'), false);
    }
  }
}).single('image'), extractTextFromImage);

module.exports = router; 