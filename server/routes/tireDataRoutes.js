const express = require('express');
const { getTireDataByUser, uploadTireData, updateTireField, updateInspectionDate, createTire } = require('../controllers/tireDataController');
const router = express.Router();
const multer = require('multer');
const upload = multer();

// Route to fetch tire data by user ID
router.get('/user/:user', getTireDataByUser);

//Create tire
router.post('/', createTire);

// Route to upload tire data via Excel file
router.post('/upload', upload.single('file'), uploadTireData);

//updatye histroics
router.put('/update-field', updateTireField);

// New Route to update only the inspection date
router.put('/update-inspection-date', updateInspectionDate);

module.exports = router;
