const express = require('express');
const router = express.Router();
const { handleAIChat } = require('../controllers/aiChatController'); // Import the AI Chat controller

// POST route for AI chat
router.post('/', handleAIChat);

module.exports = router;
