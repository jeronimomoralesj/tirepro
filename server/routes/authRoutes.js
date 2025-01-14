const express = require('express');
const { registerUser, loginUser, getUserById, updatePointCount, getAllUsers } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware
const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/users/:userId', authMiddleware, getUserById); // Protected route
router.put('/update-pointcount', updatePointCount); // Route for updating pointcount
router.get('/users', authMiddleware, getAllUsers); // Add authentication middleware

module.exports = router;
