const express = require('express');
const router = express.Router();
const { getChatbotResponse } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// Protect all chatbot routes
router.use(protect);

// Get chatbot response route
router.post('/', getChatbotResponse);

module.exports = router; 