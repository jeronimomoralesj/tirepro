const Event = require('../models/event');

// Function to create multiple events when new tire data is uploaded
const createManyEvents = async (req, res) => {
  try {
    const { events } = req.body; // Array of event objects
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Map events to ensure `day`, `month`, and `year` are included and include `placa`
    const eventsWithDates = events.map((event) => ({
      llanta: event.llanta,
      vida: event.vida.map((entry) => ({
        day: entry.day || day,
        month: entry.month || month,
        year: entry.year || year,
        value: entry.value,
      })),
      pos: event.pos.map((entry) => ({
        day: entry.day || day,
        month: entry.month || month,
        year: entry.year || year,
        value: entry.value,
      })),
      otherevents: event.otherevents || [],
      user: event.user,
      placa: event.placa, // Include `placa`
    }));

    // Save all events to the database
    await Event.insertMany(eventsWithDates);

    res.status(201).json({ msg: 'Events created successfully.' });
  } catch (error) {
    console.error('Error creating events:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
};



// Function to fetch events by user ID
const getEventsByUser = async (req, res) => {
  try {
    const { user } = req.params; // Extract `user` from the route parameter
    const { llanta, placa } = req.query; // Extract `llanta` and `placa` from query parameters

    if (!user) {
      return res.status(400).json({ msg: 'User ID is required.' });
    }

    // Build the query object dynamically
    let query = { user };

    if (llanta) {
      query.llanta = parseInt(llanta, 10); // Convert llanta to an integer
    }

    if (placa) {
      query.placa = { $regex: new RegExp(`^${placa}$`, 'i') }; // Case-insensitive regex
    }

    // Fetch events based on the query
    const events = await Event.find(query);

    if (!events || events.length === 0) {
      return res.status(404).json({ msg: 'No events found for the provided criteria.' });
    }

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
};





// Function to update a specific field in an event (add a new historical entry)
const updateEventField = async (req, res) => {
  try {
    const { eventId, field, newValue } = req.body;
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found.' });
    }

    // Validate that the field exists and is a historical array
    if (!Array.isArray(event[field])) {
      return res.status(400).json({ msg: `Field "${field}" is not a valid historical array.` });
    }

    // Add the new entry to the field
    event[field].push({
      day,
      month,
      year,
      value: newValue,
    });

    // Save the updated event
    await event.save();
    res.status(200).json({ msg: 'Event updated successfully.', event });
  } catch (error) {
    console.error('Error updating event field:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Function to add a new entry in `otherevents`
const addOtherEvent = async (req, res) => {
  try {
    const { eventId, newValue } = req.body;
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found.' });
    }

    // Add the new entry to the `otherevents` field
    event.otherevents.push({
      day,
      month,
      year,
      value: newValue,
    });

    // Save the updated event
    await event.save();
    res.status(200).json({ msg: 'Other event added successfully.', event });
  } catch (error) {
    console.error('Error adding other event:', error);
    res.status(500).json({ msg: 'Server error.' });
  }
};

module.exports = {
  createManyEvents,
  getEventsByUser,
  updateEventField,
  addOtherEvent,
};
