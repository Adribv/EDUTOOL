const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const authModule = require('./modules/auth.modules');

dotenv.config();
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

connectDB();

app.use('/api', authModule);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
