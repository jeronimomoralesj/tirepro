const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tireDataRoutes = require('./routes/tireDataRoutes');
const eventRoutes = require('./routes/eventRoutes');
const s3Routes = require('./routes/s3Routes');
const aiChatRoutes = require('./routes/aiChatRoutes'); // Import the AI chat routes

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://tirepro.netlify.app', "https://tirepro.com.co"], // Correct origin(s)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/tires', tireDataRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', s3Routes);
app.use('/api/ai-chat', aiChatRoutes); // Use the AI chat routes

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
