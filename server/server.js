// server/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tireDataRoutes = require('./routes/tireDataRoutes');
const historicsRoutes = require('./routes/historicsRoutes'); // Import historics routes

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/tires', tireDataRoutes);
app.use('/api/historics', historicsRoutes); // Use historics routes

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
