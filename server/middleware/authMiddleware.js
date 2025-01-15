const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ msg: 'No token provided. Access denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token with your secret key
    req.user = decoded.user; // Attach user info to request object
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Invalid token. Access denied.' });
  }
};

module.exports = authMiddleware;
