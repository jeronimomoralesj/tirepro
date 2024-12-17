const express = require('express');
const {
  getTireDataByUser,
  getTireDataByCompany, // Import the new function
  uploadTireData,
  updateTireField,
  updateInspectionDate,
  createTire,
  updateNonHistorics,
} = require('../controllers/tireDataController');
const router = express.Router();
const multer = require('multer');
const upload = multer();

// Route to fetch tire data by user ID
router.get('/user/:user', getTireDataByUser);

// Route to fetch tire data by company ID
router.get('/company/:companyId', getTireDataByCompany); // New Route

// Create tire
router.post('/', createTire);

// Route to upload tire data via Excel file
router.post('/upload', upload.single('file'), uploadTireData);

// Update historical fields
router.put('/update-field', updateTireField);

// Update only the inspection date
router.put('/update-inspection-date', updateInspectionDate);

// Update non-historical fields
router.put('/update-nonhistorics', updateNonHistorics);

module.exports = router;
