const express = require('express');
const { registerUser, loginUser, getUserById, updatePointCount, getAllUsers, updatePlaca,updateProfileImage, updatePeriodicity } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); 

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/users/:userId', authMiddleware, getUserById); // Protected route
router.put('/update-pointcount', updatePointCount); // Route for updating pointcount
router.get('/users', authMiddleware, getAllUsers); // Add authentication middleware
router.put('/update-placa', authMiddleware, updatePlaca); // No adminMiddleware here
router.put('/update-profile-image', updateProfileImage);
router.put('/update-periodicity', updatePeriodicity);

module.exports = router;
