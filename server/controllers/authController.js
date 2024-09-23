const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Log the plain password before hashing (only for verification, not hashing here)
    console.log('Plain password before saving to DB:', password);

    // Create a new user instance with the plain password
    user = new User({
      name,
      email,
      password, // Save the plain password directly
    });

    // Save the user to the database; password will be hashed by the pre-save hook in the model
    await user.save();

    // Log the stored password from the database for verification
    const savedUser = await User.findOne({ email });
    console.log('Stored password in DB:', savedUser.password);

    // Create a payload with the user ID
    const payload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    // Sign a JWT token and send it in response
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        console.log('Token generated successfully');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

  

 
// Login a user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    console.log(`Login attempt with email: ${email}`);
    try {
      // Check if the user exists
      let user = await User.findOne({ email });
      if (!user) {
        console.log('User not found');
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
  
      console.log('User found, comparing password...');
      console.log('Entered password:', password); // Log the entered password
      console.log('Stored password (hashed):', user.password); // Log the stored hashed password
  
      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password); // This should now work
      console.log('Password match result:', isMatch); // Log the result of the comparison
  
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
  
      console.log('Password matched, generating token...');
  
      // Create a payload with the user ID
      const payload = {
        user: {
          id: user.id,
          email: user.email,
        },
      };
  
      // Sign a JWT token and send it in response
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 3600 }, // Token expires in 1 hour
        (err, token) => {
          if (err) throw err;
          console.log('Token generated successfully');
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Server error:', err.message);
      res.status(500).send('Server error');
    }
  };