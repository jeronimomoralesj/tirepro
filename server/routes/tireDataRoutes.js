const express = require('express');
const { getTireDataByUser } = require('../controllers/tireDataController');
const router = express.Router();

// Route to fetch tire data by user ID
router.get('/user/:user', getTireDataByUser);

module.exports = router;