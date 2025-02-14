const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/authUtils');

// Registration controller
const registerUser = async (req, res) => {
  const { name, email, password, company, role, placa, companyId, periodicity } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Validate role input
    const validRoles = ['admin', 'regular'];
    const userRole = validRoles.includes(role) ? role : 'regular';

    // Validate placa input for 'regular' users
    let placasArray = [];
    if (userRole === 'regular') {
      if (placa && Array.isArray(placa)) {
        placasArray = placa;
      } else {
        return res.status(400).json({ msg: 'Placa must be an array of strings for regular users.' });
      }
    }

    // Check if companyId is provided
    if (!companyId) {
      return res.status(400).json({ msg: 'Company ID is required.' });
    }

    // Ensure the company field is provided
    if (!company) {
      return res.status(400).json({ msg: 'Company name is required.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default profile image
    const defaultProfileImage = 'https://images.pexels.com/photos/12261472/pexels-photo-12261472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      company,
      companyId,
      role: userRole,
      placa: placasArray,
      pointcount: 0,
      profileImage: defaultProfileImage,
      periodicity: "Daily"
    });

    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Login controllerperiodicity
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('id companyId name role email password periodicity');
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

//update the user periodicity

const updatePeriodicity = async (req, res) => {
  try {
    const { userId, frequency } = req.body

    if (!userId || !frequency ) {
      return res.status(400).json ({ msg: 'User ID or Periodicity not found' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    user.periodicity = frequency
    await user.save()

    res.status(200).json({ msg: 'Periodicity updated' })
  }
  catch (error) {
    console.error('Error updating profile image:', error.message);
    res.status(500).json({ msg: 'Server error.' });
  }
}

const updateProfileImage = async (req, res) => {
  try {
    const { userId, imageUrl } = req.body;

    if (!userId || !imageUrl) {
      return res.status(400).json({ msg: 'User ID and image URL are required.' });
    }

    // Find the user by ID and update the profile image
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json({ msg: 'Profile image updated successfully.', profileImage: user.profileImage });
  } catch (error) {
    console.error('Error updating profile image:', error.message);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Get user by ID controller
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name role email company companyId placa pointcount profileImage periodicity'
    );
    
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
      pointcount: user.pointcount,
      profileImage: user.profileImage,
      periodicity: user.periodicity,
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updatePointCount = async (req, res) => {
  const { userId, incrementBy } = req.body; // Accept `incrementBy` from request

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Increment the user's pointcount
    user.pointcount += incrementBy;
    await user.save();

    res.status(200).json({ msg: 'Pointcount updated successfully', pointcount: user.pointcount });
  } catch (error) {
    console.error('Error updating pointcount:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updatePlaca = async (req, res) => {
  try {
    const { userId, placa } = req.body;

    // Validate input
    if (!userId || !placa) {
      return res.status(400).json({ msg: 'Missing userId or placa in request.' });
    }

    // Find and update the user's placa
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    user.placa = placa;
    await user.save();

    res.status(200).json({ msg: 'Placa updated successfully.', placa: user.placa });
  } catch (error) {
    console.error('Error updating placa:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};





module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updatePointCount, // Export the function
  getAllUsers,
  updatePlaca,
  updateProfileImage,
  updatePeriodicity
};
