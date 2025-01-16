const express = require('express');
const router = express.Router();
const { handleAIChat, analyzeDataByPlaca } = require('../controllers/aiChatController');

// POST route for AI chat
router.post('/', handleAIChat);

// POST route for analyzing tire data by placa
router.post('/analyze-by-placa', analyzeDataByPlaca); // No authMiddleware here

module.exports = router;
