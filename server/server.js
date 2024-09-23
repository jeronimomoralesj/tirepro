const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

// Initialize express
const app = express();

// Connect to database
connectDB();

// Initialize middleware
app.use(express.json()); // Parses incoming JSON requests and puts the parsed data in req.body
app.use(cors());

// Define routes
app.use('/api/auth', require('./routes/authRoutes')); // Use authentication routes

// Define the PORT
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
