const TireData = require('../models/tireData');
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

// Function to calculate CPK and projected CPK based on formulas
const calculateCPK = (costo, kilometraje) => (kilometraje ? costo / kilometraje : 0);
const calculateProjectedCPK = (costo, kilometrajeActual, proact) => {
  const projectedKms = proact < 18 ? (kilometrajeActual / (18 - proact)) * 18 : 0;
  return calculateCPK(costo, projectedKms);
};

// Function to upload tire data from an Excel file
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
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const tireDataEntries = jsonData.map(row => {
      const costo = parseFloat(row['costo']) || 0;
      const kilometrajeActual = parseFloat(row['kilometraje_actual']) || 0;
      const proact = parseFloat(row['proact']) || 0;
      const vida = row['vida'] || 'Unknown';

      // Calculate CPK and Projected CPK using the formulas
      const cpkValue = calculateCPK(costo, kilometrajeActual);
      const cpkProyValue = calculateProjectedCPK(costo, kilometrajeActual, proact);

      return {
        llanta: row['llanta'] || 0,
        vida: transformToHistoricalArray(vida), // Handle `vida` as a historical array with the initial value
        placa: row['placa'] || 'Unknown',
        kilometraje_actual: transformToHistoricalArray(kilometrajeActual),
        frente: row['frente'] || 'Unknown',
        marca: row['marca'] || 'Unknown',
        diseno: row['diseno'] || 'Unknown',
        banda: row['banda'] || 'Unknown',
        tipovhc: row['tipovhc'] || 'Unknown',
        pos: transformToHistoricalArray(row['pos']),
        original: row['original'] || 'Unknown',
        profundidad_int: transformToHistoricalArray(row['profundidad_int']),
        profundidad_cen: transformToHistoricalArray(row['profundidad_cen']),
        profundidad_ext: transformToHistoricalArray(row['profundidad_ext']),
        costo: costo,
        kms: transformToHistoricalArray(row['kms']),
        cpk: [{ month: currentMonth, year: currentYear, value: cpkValue }], // CPK entry with current month/year
        cpk_proy: [{ month: currentMonth, year: currentYear, value: cpkProyValue }], // Projected CPK entry with current month/year
        dimension: row['dimension'] || 'Unknown',
        proact: transformToHistoricalArray(proact),
        eje: row['eje'] || 'Unknown',
        KMS_x_MM: parseFloat(row['kms_x_mm']) || 0,
        pro_mes: 0,
        costo_por_mes: 0,
        costo_remanente: 0,
        proyeccion_fecha: new Date(),
        user: userId,
      };
    });

    // Insert processed data into the database
    await TireData.insertMany(tireDataEntries);

    res.status(200).json({ msg: 'Tire data uploaded successfully' });
  } catch (error) {
    console.error("Error uploading tire data:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// Helper function to transform individual values into historical array format
const transformToHistoricalArray = (value) => {
  const currentDate = new Date();
  return [{
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    value: typeof value === 'number' || typeof value === 'string' ? value : parseFloat(value) || 0,
  }];
};

// Export the controller functions
module.exports = { getTireDataByUser, uploadTireData };