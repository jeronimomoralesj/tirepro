const express = require('express');
const { getOrCreateHistoricCPKData, updateHistoricCPKData } = require('../controllers/historicsController');
const router = express.Router();

// Route to fetch or create historic CPK data for a user
router.get('/:user', getOrCreateHistoricCPKData);

// Route to update CPK data
router.post('/update', updateHistoricCPKData);

module.exports = router;
