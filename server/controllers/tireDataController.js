const TireData = require('../models/tireData');

// Fetch tire data by user
const getTireDataByUser = async (req, res) => {
  try {
    const userId = req.params.user; // Get user from params
    console.log("Fetching data for user:", userId); // Log for debugging
    const tireData = await TireData.find({ user: userId });

    if (!tireData || tireData.length === 0) {
      return res.status(404).json({ msg: 'No tire data found for this user' });
    }

    res.json(tireData); // Send tire data
  } catch (error) {
    console.error("Error fetching tire data:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { getTireDataByUser };