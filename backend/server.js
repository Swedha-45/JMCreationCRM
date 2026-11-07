const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// 1. Load environment variables FIRST
dotenv.config();

// 2. Connect to MongoDB
connectDB();

// 3. Initialize Express
const app = express();

// 4. CORS Configuration (Allows Vercel and Localhost)
const allowedOrigins = [
  'http://localhost:5173',
  'https://jmcreationcrm-1.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// 5. Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const testPdfRoute = require('./routes/testPdfRoute');
const documentRoutes = require('./routes/documentRoutes');
const callRoutes = require('./routes/callRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Serve Assets (Logos)
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/assets', express.static('assets'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/test-pdf', testPdfRoute);
app.use('/api/documents', documentRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/events', eventRoutes);

// 6. Start the Server
const PORT = process.env.PORT || 5000;

// CRITICAL FOR RENDER: Use '0.0.0.0' instead of 'localhost'
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});