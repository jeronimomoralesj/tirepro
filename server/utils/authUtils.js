// utils/authUtils.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user._id.toString(),
      },
    },
    process.env.JWT_SECRET, // Ensure JWT_SECRET is set in .env
    { expiresIn: '1h' }
  );
};

module.exports = generateToken;
