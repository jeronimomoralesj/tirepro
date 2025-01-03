const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/authUtils');

// Registration controller
// Registration controller
const registerUser = async (req, res) => {
  const { name, email, password, company, role, placa } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Validate role input if needed, fallback to 'regular' for security
    const validRoles = ['admin', 'regular'];
    const userRole = validRoles.includes(role) ? role : 'regular';

    // Validate placa input only if the role is 'regular'
    let placasArray = [];
    if (userRole === 'regular') {
      if (placa && Array.isArray(placa)) {
        placasArray = placa;
      } else {
        return res.status(400).json({ msg: 'Placa must be an array of strings for regular users.' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      company,
      role: userRole,
      placa: placasArray, // Include placa only if user role is 'regular'
    });

    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


// Login controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('id companyId password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ msg: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in user:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


// Get user by ID controller
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name role email company companyId placa');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json({
      name: user.name,
      role: user.role,
      email: user.email,
      company: user.company,
      companyId: user.companyId,
      placa: user.placa,
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
