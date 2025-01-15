const express = require('express');
const { registerUser, loginUser, getUserById, updatePointCount, getAllUsers, updatePlaca } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/users/:userId', authMiddleware, getUserById); // Protected route
router.put('/update-pointcount', updatePointCount); // Route for updating pointcount
router.get('/users', authMiddleware, getAllUsers); // Add authentication middleware
router.put('/update-placa', authMiddleware, updatePlaca); // No adminMiddleware here

module.exports = router;
