require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const itemRoutes = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security
app.use(helmet());

// CORS - allow file:// and localhost
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many requests, please try again later.' }
}));

// Body parser
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/items', itemRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({
  success: true,
  message: '🧺 Smart Laundry API (MongoDB) is running!',
  version: '2.0.0-mongodb',
  database: 'MongoDB',
  gst_rate: `${(parseFloat(process.env.GST_RATE) || 0.18) * 100}%`,
  timestamp: new Date().toISOString()
}));

// 404 handler
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  })
);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🧺 ================================');
  console.log(`🚀  Smart Laundry API v2.0 (MongoDB)`);
  console.log(`🌐  http://localhost:${PORT}`);
  console.log(`💾  Database: MongoDB`);
  console.log(`💰  GST Rate: ${(parseFloat(process.env.GST_RATE) || 0.18) * 100}%`);
  console.log('🧺 ================================');
  console.log('');
});
