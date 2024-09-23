const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path'); // Import path module to handle paths
require('dotenv').config();

// Initialize express
const app = express();

// Connect to database
connectDB();

// Initialize middleware
app.use(express.json()); // Parses incoming JSON requests and puts the parsed data in req.body
app.use(cors());

// Define API routes
app.use('/api/auth', require('./routes/authRoutes')); // Use authentication routes

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Catch-all route to serve React's index.html for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Define the PORT
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
