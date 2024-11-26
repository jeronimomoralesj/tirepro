const express = require('express');
const {
  createManyEvents,
  getEventsByUser,
  updateEventField,
  addOtherEvent,
} = require('../controllers/eventController');

const router = express.Router();

// Route to create multiple events
router.post('/create-many', createManyEvents);

// Route to fetch events by user
router.get('/user/:user', getEventsByUser);

// Route to update a specific field in an event
router.put('/update-field', updateEventField);

// Route to add a new entry to `otherevents`
router.put('/add-other-event', addOtherEvent);

module.exports = router;
