const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const eventRoutes = require('./routes/eventRoutes');
const meetingRoutes = require('./routes/meetingRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://smart-scheduler-frontend.vercel.app', 'https://smart-scheduler.vercel.app']
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/meetings', meetingRoutes);

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database connection successful!', 
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Basic route to test if server is working
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Calendar API is running! 🗓️',
    endpoints: {
      auth: '/api/auth',
      groups: '/api/groups',
      events: '/api/events',
      meetings: '/api/meetings'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👥 Group endpoints: http://localhost:${PORT}/api/groups`);
  console.log(`📅 Event endpoints: http://localhost:${PORT}/api/events`);
  console.log(`🤝 Meeting endpoints: http://localhost:${PORT}/api/meetings`);
});