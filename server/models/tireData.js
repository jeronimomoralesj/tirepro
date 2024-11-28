// models/tireData.js
const mongoose = require('mongoose');

const HistoricalValueSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true } // Store as a string (e.g., "Nuevo", "Reencauche1")
});

const TireDataSchema = new mongoose.Schema({
  llanta: { type: Number, required: false },
  vida: { type: [HistoricalValueSchema], default: [] },
  placa: { type: String, required: true },
  kilometraje_actual: { type: [HistoricalValueSchema], default: [] },
  frente: { type: String, required: true },
  marca: { type: String, required: true },
  diseno: { type: String, required: true },
  banda: { type: String, required: true },
  tipovhc: { type: String, required: true },
  pos: { type: [HistoricalValueSchema], default: [] },
  original: { type: String, required: true, default: 'N/A' }, // Default value
  profundidad_int: { type: [HistoricalValueSchema], default: [] },
  profundidad_cen: { type: [HistoricalValueSchema], default: [] },
  profundidad_ext: { type: [HistoricalValueSchema], default: [] },
  costo: { type: Number, required: true },
  kms: { type: [HistoricalValueSchema], default: [] },
  cpk: { type: [HistoricalValueSchema], default: [] },
  cpk_proy: { type: [HistoricalValueSchema], default: [] },
  dimension: { type: String, required: true },
  proact: { type: [HistoricalValueSchema], default: [] },
  eje: { type: String, required: true },
  KMS_x_MM: { type: Number, required: true, default: 0 }, // Default value
  pro_mes: { type: Number, required: true, default: 0 }, // Default value
  costo_por_mes: { type: Number, required: true, default: 0 }, // Default value
  costo_remanente: { type: Number, required: true, default: 0 }, // Default value
  proyeccion_fecha: { type: Date, required: true, default: Date.now }, // Default value
  ultima_inspeccion: { type: Date, required: true, default: Date.now },
  user: { type: String, required: true },
}, { collection: 'tire_data' });


module.exports = mongoose.model('TireData', TireDataSchema);