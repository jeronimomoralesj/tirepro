const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, default: 'regular' },
  companyId: { type: String, required: false },
  placa: { type: [String], default: [] }, // Array of placas
  pointcount: { type: Number, default: 0 }, // New field for tracking points
});

// Method to check password validity
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
