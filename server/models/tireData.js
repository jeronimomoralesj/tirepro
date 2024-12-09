const mongoose = require('mongoose');

const HistoricalValueSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Store as string or number
});

const TireDataSchema = new mongoose.Schema(
  {
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
    original: { type: String, required: true, default: 'N/A' },
    profundidad_int: { type: [HistoricalValueSchema], default: [] },
    profundidad_cen: { type: [HistoricalValueSchema], default: [] },
    profundidad_ext: { type: [HistoricalValueSchema], default: [] },
    profundidad_inicial: { type: Number, required: true, default: 20 }, // Default set to 20
    costo: { type: Number, required: true },
    kms: { type: [HistoricalValueSchema], default: [] },
    cpk: { type: [HistoricalValueSchema], default: [] },
    cpk_proy: { type: [HistoricalValueSchema], default: [] },
    dimension: { type: String, required: true },
    proact: { type: [HistoricalValueSchema], default: [] },
    presion: { type: [HistoricalValueSchema], default: [] }, // New field with historical structure
    eje: { type: String, required: true },
    KMS_x_MM: { type: Number, required: true, default: 0 },
    pro_mes: { type: Number, required: true, default: 0 },
    costo_por_mes: { type: Number, required: true, default: 0 },
    costo_remanente: { type: Number, required: true, default: 0 },
    proyeccion_fecha: { type: Date, required: true, default: Date.now },
    ultima_inspeccion: { type: Date, required: true, default: Date.now },
    user: { type: String, required: true },
  },
  { collection: 'tire_data' }
);

module.exports = mongoose.model('TireData', TireDataSchema);
