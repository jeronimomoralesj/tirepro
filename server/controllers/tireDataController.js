const TireData = require('../models/tireData');
const Event = require('../models/event'); // Ensure Event model is correctly imported
const xlsx = require('xlsx');

// Function to fetch tire data by user

const getTireDataByCompany = async (req, res) => {
  try {
    const userId = req.params.user;
    const tireData = await TireData.find({ user: userId });

    if (!tireData || tireData.length === 0) {
      return res.status(200).json([]); // Return an empty array if no data is found
    }

    res.json(
      tireData.map((tire) => ({
        ...tire.toObject(),
        latestImage: tire.images?.at(-1)?.value || null, // Include latest image URL
      }))
    );
  } catch (error) {
    console.error("Error fetching tire data:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};


const getTireDataByUser = async (req, res) => {
  try {
    const userId = req.params.user;
    const tireData = await TireData.find({ user: userId });

    if (!tireData || tireData.length === 0) {
      return res.status(200).json([]); // Return an empty array if no data is found
    }

    res.json(
      tireData.map((tire) => ({
        ...tire.toObject(),
        latestImage: tire.images?.at(-1)?.value || null, // Include latest image URL
      }))
    );
  } catch (error) {
    console.error("Error fetching tire data:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};



// Function to calculate CPK and projected CPK
const normalizeValueWithDefault = (value, defaultValue) => {
  return value != null && value !== '' ? value : defaultValue;
};

const normalizeText = (text) => (text ? text.toString().toLowerCase() : 'unknown');

const calculateCPK = (costo, kilometraje) => (kilometraje ? costo / kilometraje : 0);
const calculateProjectedCPK = (costo, kilometrajeActual, proact, profundidad_inicial) => {
  const projectedKms = proact < 18 ? (kilometrajeActual / (profundidad_inicial - proact)) * profundidad_inicial : 0;
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
      console.error('No file uploaded');
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    let workbook;
    try {
      workbook = xlsx.read(file.buffer, { type: 'buffer' });
    } catch (parseError) {
      console.error('Error parsing Excel file:', parseError);
      return res.status(500).json({ msg: 'Error parsing Excel file', error: parseError.message });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Fetch existing tires for the user
    const existingTires = await TireData.find({ user: userId });

    const tireDataEntries = jsonData.map((row) => {
      const kms = parseFloat(row['kms']) || 0; // Use provided kms directly
      const profundidadInicial = normalizeValueWithDefault(row['profundidad_inicial'], 20);
      const profundidadInt = parseFloat(row['profundidad_int']) || 0;
      const profundidadCen = parseFloat(row['profundidad_cen']) || 0;
      const profundidadExt = parseFloat(row['profundidad_ext']) || 0;
      const proact = Math.min(profundidadInt, profundidadCen, profundidadExt);

      const projectedKms =
        proact < profundidadInicial
          ? (kms / (profundidadInicial - proact)) * profundidadInicial
          : 0;

      const costo = parseFloat(row['costo']) || 0;
      const cpk = calculateCPK(costo, kms);
      const cpkProy = projectedKms > 0 ? calculateCPK(costo, projectedKms) : 0;

      return {
        llanta: row['llanta'] || 0,
        vida: transformToHistoricalArrayWithDay(normalizeText(row['vida'] || 'unknown')),
        placa: normalizeText(row['placa']),
        kilometraje_actual: transformToHistoricalArrayWithDay(parseFloat(row['kilometraje_actual']) || 0),
        frente: normalizeText(row['frente']),
        marca: normalizeText(row['marca']),
        diseno: normalizeText(row['diseno']),
        banda: normalizeText(row['banda']),
        tipovhc: normalizeText(row['tipovhc']),
        pos: transformToHistoricalArrayWithDay(row['pos']),
        original: normalizeText(row['original']),
        profundidad_int: transformToHistoricalArrayWithDay(profundidadInt),
        profundidad_cen: transformToHistoricalArrayWithDay(profundidadCen),
        profundidad_ext: transformToHistoricalArrayWithDay(profundidadExt),
        profundidad_inicial: profundidadInicial,
        presion: transformToHistoricalArrayWithDay(row['presion']),
        costo,
        kms: [{ day: currentDay, month: currentMonth, year: currentYear, value: kms }],
        cpk: [{ day: currentDay, month: currentMonth, year: currentYear, value: cpk }],
        cpk_proy: [{ day: currentDay, month: currentMonth, year: currentYear, value: cpkProy }],
        dimension: normalizeText(row['dimension']),
        proact: transformToHistoricalArrayWithDay(proact),
        eje: normalizeText(row['eje']),
        operacion: operacion.toLowerCase(),
        peso_carga: pesoCarga,
        user: userId,
      };
    });

    // Check for duplicates by `llanta`
    const duplicateLlantaEntries = tireDataEntries.filter((newTire) =>
      existingTires.some((existingTire) => existingTire.llanta === newTire.llanta)
    );

    if (duplicateLlantaEntries.length > 0) {
      return res.status(400).json({
        msg: 'Duplicate llantas found. Please resolve these before uploading.',
        duplicates: duplicateLlantaEntries.map((tire) => tire.llanta),
      });
    }

    // Check for duplicates by `placa` and `pos`, but allow duplicates if `placa` is "inventario"
    const duplicatePosEntries = tireDataEntries.filter((newTire) => {
      if (newTire.placa === 'inventario' || newTire.placa === "fin") {
        return false; // Skip duplicate check for `placa` = "inventario"
      }
      return existingTires.some((existingTire) => {
        const latestPos = existingTire.pos?.at(-1)?.value || null; // Get the latest position value
        return (
          existingTire.placa === newTire.placa && // Match `placa`
          latestPos === newTire.pos?.[0]?.value  // Match `pos`
        );
      });
    });

    if (duplicatePosEntries.length > 0) {
      return res.status(400).json({
        msg: 'Duplicate placa and pos found. Please resolve these before uploading.',
        duplicates: duplicatePosEntries.map((tire) => ({
          placa: tire.placa,
          pos: tire.pos?.[0]?.value,
        })),
      });
    }

    // Insert tire data
    const createdTires = await TireData.insertMany(tireDataEntries);

    // Prepare and insert events
    const events = createdTires.map((tire) => ({
      llanta: tire.llanta,
      vida: tire.vida,
      pos: tire.pos,
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
    console.error('Error uploading tire data and creating events:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};



// Update historical fields
const updateTireField = async (req, res) => {
  try {
    const { tireUpdates } = req.body;
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    for (const update of tireUpdates) {
      const { tireId, field, newValue } = update;
      const tire = await TireData.findById(tireId);
      if (!tire) continue;

      if (field === 'images') {
        // Append a new historical entry for images
        tire.images.push({
          day: currentDay,
          month: currentMonth,
          year: currentYear,
          value: newValue, // URL of the image
        });
      } else if (Array.isArray(tire[field])) {
        // Append to existing historical fields
        tire[field].push({
          day: currentDay,
          month: currentMonth,
          year: currentYear,
          value: newValue,
        });
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
    const currentDay = currentDate.getDate();
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

      const lastKilometrajeValue = lastKilometrajeEntry?.value || 0;
      const kmsDifference = Math.max(0, kilometrajeActual - lastKilometrajeValue);

      // Update kilometraje_actual historical field
      if (lastKilometrajeEntry?.day === currentDay && lastKilometrajeEntry?.month === currentMonth && lastKilometrajeEntry?.year === currentYear) {
        lastKilometrajeEntry.value = kilometrajeActual;
      } else {
        tire.kilometraje_actual.push({
          day: currentDay,
          month: currentMonth,
          year: currentYear,
          value: kilometrajeActual,
        });
      }

      // Update kms historical field
      if (lastKmsEntry?.day === currentDay && lastKmsEntry?.month === currentMonth && lastKmsEntry?.year === currentYear) {
        lastKmsEntry.value += kmsDifference;
      } else {
        tire.kms.push({
          day: currentDay,
          month: currentMonth,
          year: currentYear,
          value: kmsDifference,
        });
      }

      tire.ultima_inspeccion = currentDate;

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
      day: currentDate.getDate(),
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

    // Transform historical fields
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
      ultima_inspeccion: currentDate,
    };

    // Create and save the tire
    const createdTire = await TireData.create(newTire);

    // Create an event for the tire
    const newEvent = {
      llanta: createdTire.llanta,
      vida: createdTire.vida,
      pos: createdTire.pos,
      otherevents: [],
      user: createdTire.user,
      placa: createdTire.placa,
    };
    await Event.create(newEvent);

    res.status(201).json({ msg: 'Llanta creada correctamente.', tire: createdTire });
  } catch (error) {
    res.status(500).json({ msg: 'Error en el servidor.', error: error.message });
  }
};


// Function to update non-historical fields
const updateNonHistorics = async (req, res) => {
  try {
    const { updates } = req.body; // Extract 'updates' from the request body

    // Validate the payload
    if (!updates || !Array.isArray(updates)) {
      console.error("Invalid updates payload:", req.body);
      return res.status(400).json({ msg: "Invalid updates provided. Expected an array of objects." });
    }

    for (const update of updates) {
      if (!update.tireId || !update.field || update.newValue === undefined) {
        console.error("Invalid update object:", update);
        return res.status(400).json({
          msg: `Invalid update object: ${JSON.stringify(update)}. Each object must include tireId, field, and newValue.`,
        });
      }
    }

    // Process updates
    const updateResults = [];
    for (const update of updates) {
      const { tireId, field, newValue } = update;

      const updatedTire = await TireData.findByIdAndUpdate(
        tireId,
        { [field]: newValue }, // Dynamically update the specified field
        { new: true } // Return the updated document
      );

      if (!updatedTire) {
        console.error(`Tire with ID ${tireId} not found.`);
        return res.status(404).json({ msg: `Tire with ID ${tireId} not found.` });
      }

      updateResults.push(updatedTire);
    }
    // Respond with success
    res.status(200).json({
      msg: "Non-historical fields updated successfully.",
      updatedTires: updateResults,
    });
  } catch (error) {
    console.error("Error updating non-historical fields:", error);
    res.status(500).json({ msg: "Server error.", error: error.message });
  }
};


const addPrimeraVidaDetails = async (req, res) => {
  try {
    const { tireId } = req.body;

    // Find the tire by ID
    const tire = await TireData.findById(tireId);

    if (!tire) {
      return res.status(404).json({ msg: 'Tire not found.' });
    }

    const currentCosto = tire.costo || 0;
    const lastCPK = tire.cpk.length > 0 ? tire.cpk[tire.cpk.length - 1].value : 0;
    const lastKms = tire.kms.length > 0 ? tire.kms[tire.kms.length - 1].value : 0;
    const currentBanda = tire.banda || 'N/A';

    // Add details to primera_vida
    tire.primera_vida.push({
      banda: currentBanda,
      kms: lastKms,
      cpk: lastCPK,
      costo: currentCosto,
    });

    await tire.save();

    res.status(200).json({ msg: 'Primera vida details added successfully.', tire });
  } catch (error) {
    console.error('Error updating primera_vida:', error);
    res.status(500).json({ msg: 'Server error.', error: error.message });
  }
};


module.exports = {
  getTireDataByUser,
  uploadTireData,
  updateTireField,
  updateInspectionDate,
  createTire,
  updateNonHistorics,
  getTireDataByCompany,
  addPrimeraVidaDetails,
};