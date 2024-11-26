const mongoose = require('mongoose');

const HistoricalValueSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  day: { type: Number, required: true },
  year: { type: Number, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Store as a string (e.g., "Nuevo", "Reencauche1")
});

const EventSchema = new mongoose.Schema({
  llanta: { type: Number, required: false },
  vida: { type: [HistoricalValueSchema], default: [] },
  pos: { type: [HistoricalValueSchema], default: [] },
  otherevents: { type: [HistoricalValueSchema], default: [] }, // Free text events
  user: { type: String, required: true }, // User ID
  placa: { type: String, required: true },
}, { collection: 'events', timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
