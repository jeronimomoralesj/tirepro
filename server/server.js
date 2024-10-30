// server/server.js
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
require('dotenv').config();
const tireDataRoutes = require("./routes/tireDataRoutes")

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/tires', tireDataRoutes); 

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
