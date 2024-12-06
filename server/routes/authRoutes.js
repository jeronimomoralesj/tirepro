const express = require('express');
const { registerUser, loginUser, getUserById } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware
const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/users/:userId', authMiddleware, getUserById); // Protected route

module.exports = router;
