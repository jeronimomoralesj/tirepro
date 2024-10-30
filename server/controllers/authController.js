// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/authUtils'); // Import the generateToken function

// Registration controller
const registerUser = async (req, res) => {
  const { name, email, password, company, role } = req.body;

  try {
    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Validate role input if needed, fallback to 'regular' for security
    const validRoles = ['admin', 'regular'];
    const userRole = validRoles.includes(role) ? role : 'regular';

    // Create new user instance
    const newUser = new User({
      name,
      email,
      password,
      company,
      role: userRole,
    });

    // Save user
    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    const token = generateToken(user);
    console.log('Generated Token:', token); // Check if the token is generated

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
  
  module.exports = {
    registerUser,
    loginUser,
  };