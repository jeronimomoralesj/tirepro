const Historics = require('../models/Historics');
const TireData = require('../models/tireData');
const mongoose = require('mongoose');

// Helper to calculate CPK
const calculateCPK = (costo, kilometraje) => (kilometraje ? costo / kilometraje : 0);

// Function to fetch or create historic CPK data for a user
const getOrCreateHistoricCPKData = async (req, res) => {
  try {
    const userId = req.params.user;

    // Start a transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    let historicData = await Historics.findOne({ user: userId }).session(session);

    if (!historicData) {
      historicData = new Historics({ user: userId, cpk_mes: [] });
      await historicData.save({ session });
      console.log(`Created new Historics document for user: ${userId}`);
    } else {
      console.log(`Found existing Historics document for user: ${userId}`);
    }

    await session.commitTransaction();
    session.endSession();

    res.json(historicData);
  } catch (error) {
    console.error("Error fetching or creating historic data:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Function to update or insert CPK data for the current month
const updateHistoricCPKData = async (req, res) => {
  try {
    const userId = req.body.user;
    console.log(`Starting CPK update for user: ${userId}`);

    // Start a transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    // Use `findOneAndUpdate` with `upsert` to ensure a single document for each user
    let historicData = await Historics.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId, cpk_mes: [] } },
      { new: true, upsert: true, session }
    );

    // Fetch tires to calculate the average CPK
    const tires = await TireData.find({ user: userId }).session(session);
    if (tires.length === 0) {
      console.log(`No tires found for user ${userId}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: 'No tires found for this user' });
    }

    console.log(`Fetched ${tires.length} tires for user: ${userId}`);

    // Calculate average CPK
    let totalCPK = 0;
    let count = 0;

    tires.forEach((tire) => {
      if (tire.costo && tire.kilometraje_actual) {
        const tireCPK = calculateCPK(tire.costo, tire.kilometraje_actual);
        totalCPK += tireCPK;
        count++;
        console.log(`Tire ${tire.llanta}: costo = ${tire.costo}, kilometraje = ${tire.kilometraje_actual}, CPK = ${tireCPK}`);
      } else {
        console.log(`Skipping tire ${tire.llanta} due to missing costo or kilometraje_actual`);
      }
    });

    const avgCPK = count > 0 ? totalCPK / count : 0;
    console.log(`Calculated average CPK for user ${userId}: ${avgCPK}`);

    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Update if month and year entry exists, else add new entry
    const existingEntryIndex = historicData.cpk_mes.findIndex(
      (entry) => entry.month === currentMonth && entry.year === currentYear
    );

    if (existingEntryIndex >= 0) {
      // Update the existing entry
      historicData.cpk_mes[existingEntryIndex].cpk = avgCPK;
      historicData.cpk_mes[existingEntryIndex].date = currentDate;
      console.log(`Updated existing CPK entry for month ${currentMonth}, year ${currentYear} with avgCPK: ${avgCPK}`);
    } else {
      // Add a new entry if no entry exists for this month/year
      historicData.cpk_mes.push({
        month: currentMonth,
        year: currentYear,
        cpk: avgCPK,
        date: currentDate,
      });
      console.log(`Added new CPK entry for month ${currentMonth}, year ${currentYear} with avgCPK: ${avgCPK}`);
    }

    // Save the updated historic data
    await historicData.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    console.log("Successfully saved updated Historics document with new CPK data.");
    res.status(200).json(historicData);
  } catch (error) {
    console.error("Error updating historic data:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// Export the functions for route usage
module.exports = { getOrCreateHistoricCPKData, updateHistoricCPKData };
