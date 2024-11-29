const TireData = require('../models/tireData');
const Event = require('../models/event'); // Ensure Event model is correctly imported
const xlsx = require('xlsx');

// Function to fetch tire data by user
const getTireDataByUser = async (req, res) => {
  try {
    const userId = req.params.user;
    const tireData = await TireData.find({ user: userId });

    if (!tireData || tireData.length === 0) {
      return res.status(404).json({ msg: 'No tire data found for this user' });
    }

    res.json(tireData);
  } catch (error) {
    console.error("Error fetching tire data:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Function to calculate CPK and projected CPK
const calculateCPK = (costo, kilometraje) => (kilometraje ? costo / kilometraje : 0);
const calculateProjectedCPK = (costo, kilometrajeActual, proact) => {
  const projectedKms = proact < 18 ? (kilometrajeActual / (18 - proact)) * 18 : 0;
  return calculateCPK(costo, projectedKms);
};

// Helper function to transform individual values into historical array format
const transformToHistoricalArrayWithDay = (value) => {
  const currentDate = new Date();
  return [{
    day: currentDate.getDate(),
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    value: typeof value === 'number' || typeof value === 'string' ? value : parseFloat(value) || 0,
  }];
};

// Function to upload tire data and create events
const uploadTireData = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.user;

    if (!file) {
      console.error("No file uploaded");
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    let workbook;
    try {
      workbook = xlsx.read(file.buffer, { type: 'buffer' });
    } catch (parseError) {
      console.error("Error parsing Excel file:", parseError);
      return res.status(500).json({ msg: 'Error parsing Excel file', error: parseError.message });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const normalizeText = (text) => (text || 'unknown').toLowerCase();

    const tireDataEntries = jsonData.map(row => ({
      llanta: row['llanta'] || 0,
      vida: transformToHistoricalArrayWithDay(row['vida'] || 'unknown'),
      placa: normalizeText(row['placa']),
      kilometraje_actual: transformToHistoricalArrayWithDay(row['kilometraje_actual']),
      frente: normalizeText(row['frente']),
      marca: normalizeText(row['marca']),
      diseno: normalizeText(row['diseno']),
      banda: normalizeText(row['banda']),
      tipovhc: normalizeText(row['tipovhc']),
      pos: transformToHistoricalArrayWithDay(row['pos']),
      original: normalizeText(row['original']),
      profundidad_int: transformToHistoricalArrayWithDay(row['profundidad_int']),
      profundidad_cen: transformToHistoricalArrayWithDay(row['profundidad_cen']),
      profundidad_ext: transformToHistoricalArrayWithDay(row['profundidad_ext']),
      costo: parseFloat(row['costo']) || 0,
      kms: transformToHistoricalArrayWithDay(row['kms']),
      cpk: [{
        day: currentDay,
        month: currentMonth,
        year: currentYear,
        value: parseFloat(row['costo']) / (parseFloat(row['kilometraje_actual']) || 1),
      }],
      dimension: normalizeText(row['dimension']),
      proact: transformToHistoricalArrayWithDay(row['proact']),
      eje: normalizeText(row['eje']),
      user: userId,
    }));

    const llantaValues = tireDataEntries.map(tire => tire.llanta);

    // Check for duplicate llanta values for the same user
    const existingTires = await TireData.find({ user: userId, llanta: { $in: llantaValues } });
    const existingLlantaValues = existingTires.map(tire => tire.llanta);

    if (existingLlantaValues.length > 0) {
      const duplicates = tireDataEntries.filter(tire => existingLlantaValues.includes(tire.llanta));
      return res.status(400).json({
        msg: `${duplicates.length} de ${tireDataEntries.length} llantas tienen un id existente, asegurate de no repetir:`,
        duplicates: duplicates.map(tire => tire.llanta),
      });
    }

    // Insert tire data
    const createdTires = await TireData.insertMany(tireDataEntries);

    // Prepare and insert events
    const events = createdTires.map(tire => ({
      llanta: tire.llanta,
      vida: tire.vida.map((entry) => ({
        day: entry.day || currentDay,
        month: entry.month || currentMonth,
        year: entry.year || currentYear,
        value: entry.value,
      })),
      pos: tire.pos.map((entry) => ({
        day: entry.day || currentDay,
        month: entry.month || currentMonth,
        year: entry.year || currentYear,
        value: entry.value,
      })),
      otherevents: [],
      user: tire.user,
      placa: tire.placa,
    }));

    const createdEvents = await Event.insertMany(events);

    res.status(200).json({
      msg: 'Tire data and events uploaded successfully.',
      tires: createdTires,
      events: createdEvents,
    });
  } catch (error) {
    console.error("Error uploading tire data and creating events:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};


// Update historical fields
const updateTireField = async (req, res) => {
  try {
    const { tireUpdates } = req.body;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    for (const update of tireUpdates) {
      const { tireId, field, newValue } = update;
      const tire = await TireData.findById(tireId);
      if (!tire) continue;

      if (!Array.isArray(tire[field])) continue;

      const lastEntry = tire[field][tire[field].length - 1];
      if (lastEntry && lastEntry.month === currentMonth && lastEntry.year === currentYear) {
        lastEntry.value = newValue;
      } else {
        tire[field].push({ month: currentMonth, year: currentYear, value: newValue });
      }

      await tire.save();
    }

    res.status(200).json({ msg: 'Tire field values updated successfully.' });
  } catch (error) {
    console.error("Error updating tire field values:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// Update inspection date and kilometraje_actual
const updateInspectionDate = async (req, res) => {
  try {
    const { tireIds, kilometrajeActual } = req.body; // Get tire IDs and the new kilometraje_actual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are zero-indexed
    const currentYear = currentDate.getFullYear();

    if (!kilometrajeActual || isNaN(kilometrajeActual)) {
      return res.status(400).json({ msg: "Invalid kilometraje_actual provided." });
    }

    const tires = await TireData.find({ _id: { $in: tireIds } });

    if (!tires || tires.length === 0) {
      return res.status(404).json({ msg: "No tires found for the provided IDs." });
    }

    // Update each tire
    for (const tire of tires) {
      const lastKilometrajeEntry = tire.kilometraje_actual[tire.kilometraje_actual.length - 1];
      const lastKmsEntry = tire.kms[tire.kms.length - 1];

      // Calculate the difference between the new and old kilometraje_actual
      const lastKilometrajeValue = lastKilometrajeEntry?.value || 0;
      const kmsDifference = Math.max(0, kilometrajeActual - lastKilometrajeValue);

      // Update kilometraje_actual historical field
      if (lastKilometrajeEntry?.month === currentMonth && lastKilometrajeEntry?.year === currentYear) {
        lastKilometrajeEntry.value = kilometrajeActual; // Update the existing entry for the current month
      } else {
        tire.kilometraje_actual.push({
          month: currentMonth,
          year: currentYear,
          value: kilometrajeActual,
        });
      }

      // Update kms historical field
      if (lastKmsEntry?.month === currentMonth && lastKmsEntry?.year === currentYear) {
        lastKmsEntry.value += kmsDifference; // Add the new difference to the existing value
      } else {
        tire.kms.push({
          month: currentMonth,
          year: currentYear,
          value: kmsDifference,
        });
      }

      // Update the inspection date
      tire.ultima_inspeccion = currentDate;

      // Save changes to the tire document
      await tire.save();
    }

    res.status(200).json({
      msg: "Inspeccion exitosa.",
      updatedCount: tires.length,
    });
  } catch (error) {
    console.error("Error, intentar de nuevo: ", error);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
};


// Create tire for individual users
const createTire = async (req, res) => {
  try {
    const tireData = req.body;
    const currentDate = new Date();

    const normalizeHistoricalValue = (value) => ({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      value: typeof value === 'object' && value.value ? value.value : value || 0,
    });

    // Check for duplicate llanta
    const existingTire = await TireData.findOne({
      user: tireData.user,
      llanta: tireData.llanta,
    });

    if (existingTire) {
      return res.status(400).json({
        msg: `Ya existe una llanta con id: ${tireData.llanta}.`,
      });
    }

    const newTire = {
      ...tireData,
      vida: [normalizeHistoricalValue(tireData.vida || 'N/A')],
      kilometraje_actual: [normalizeHistoricalValue(tireData.kilometraje_actual || 0)],
      pos: [normalizeHistoricalValue(tireData.pos || 0)],
      proact: [normalizeHistoricalValue(tireData.proact || 0)],
      profundidad_int: [normalizeHistoricalValue(tireData.profundidad_int || 0)],
      profundidad_cen: [normalizeHistoricalValue(tireData.profundidad_cen || 0)],
      profundidad_ext: [normalizeHistoricalValue(tireData.profundidad_ext || 0)],
      kms: [normalizeHistoricalValue(tireData.kms || 0)],
      user: tireData.user,
      ultima_inspeccion: currentDate,
    };

    const createdTire = await TireData.create(newTire);
    res.status(201).json({ msg: 'LLanta creada..', tire: createdTire });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: 'error servidor', error: error.message });
  }
};


module.exports = {
  getTireDataByUser,
  uploadTireData,
  updateTireField,
  updateInspectionDate,
  createTire,
};