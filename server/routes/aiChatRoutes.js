const express = require('express');
const router = express.Router();
const { handleAIChat } = require('../controllers/aiChatController'); // Import the controller

router.post('/ai-chat', handleAIChat); // POST route for AI chat at '/api/ai-chat'

module.exports = router;
