const jwt = require('jsonwebtoken');

// Function to generate a JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user._id.toString(),
      },
    },
    process.env.JWT_SECRET, // Use secret from .env
    { expiresIn: '1h' } // Token expiration time
  );
};

// Function to verify a JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET); // Verify with the same secret
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
