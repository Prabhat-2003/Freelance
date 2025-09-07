require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/freelancehub');

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// routes
app.use('/api', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));

app.get('/', (req, res) => res.send('FreelanceHub API is running'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));