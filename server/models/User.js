const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, default: 'regular' },
  companyId: { type: String, required: false },
  placa: { type: [String], default: [] }, 
  pointcount: { type: Number, default: 0 },
  profileImage: {  
    type: String,
    default: 'https://images.pexels.com/photos/12261472/pexels-photo-12261472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'  // Default image
  },
  periodicity: { type: String, default: "daily" }
});

// Method to check password validity
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
