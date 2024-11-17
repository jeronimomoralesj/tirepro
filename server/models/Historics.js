const mongoose = require('mongoose');

const HistoricsSchema = new mongoose.Schema({
  user: { type: String, required: true },
  cpk_mes: [
    {
      month: { type: Number, required: true },
      year: { type: Number, required: true },
      cpk: { type: Number, required: true },
      date: { type: Date, default: Date.now } // Optional if you want to save the timestamp
    },
  ],
});

module.exports = mongoose.model('Historics', HistoricsSchema);
