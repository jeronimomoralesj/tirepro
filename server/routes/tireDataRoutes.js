const express = require('express');
const { getTireDataByUser, uploadTireData, updateTireField } = require('../controllers/tireDataController');
const router = express.Router();
const multer = require('multer');
const upload = multer();

// Route to fetch tire data by user ID
router.get('/user/:user', getTireDataByUser);

// Route to upload tire data via Excel file
router.post('/upload', upload.single('file'), uploadTireData);

//updatye histroics

router.put('/update-field', updateTireField);

module.exports = router;
