const express = require('express');
const { registerUser, loginUser, getUserById } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware
const axios = require('axios'); // To verify CAPTCHA with Cloudflare
const router = express.Router();

// Middleware to verify Cloudflare CAPTCHA
const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ msg: 'CAPTCHA verification is required.' });
  }

  try {
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', null, {
      params: {
        secret: process.env.CLOUDFLARE_SECRET_KEY, // Use your Cloudflare secret key
        response: captchaToken,
      },
    });

    if (!response.data.success) {
      return res.status(400).json({ msg: 'CAPTCHA verification failed.' });
    }

    next(); // CAPTCHA passed, proceed to login
  } catch (err) {
    console.error('Error verifying CAPTCHA:', err.message);
    return res.status(500).json({ msg: 'Server error during CAPTCHA verification.' });
  }
};

// Routes
router.post('/login', verifyCaptcha, loginUser); // Add CAPTCHA verification to login route
router.post('/register', registerUser);
router.get('/users/:userId', authMiddleware, getUserById); // Protected route

module.exports = router;
