const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tireDataRoutes = require('./routes/tireDataRoutes');
const historicsRoutes = require('./routes/historicsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const s3Routes = require('./routes/s3Routes'); // Import the S3 routes

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://tirepro.netlify.app'], // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    credentials: true, // Allow sending cookies or authorization headers
  }));
  
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/tires', tireDataRoutes);
app.use('/api/historics', historicsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', s3Routes); // Add the S3 route

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
