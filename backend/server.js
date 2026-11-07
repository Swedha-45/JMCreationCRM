const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db'); // Import the DB connection

// 1. Load environment variables FIRST
dotenv.config();

// 2. Connect to MongoDB
connectDB();

// 3. Initialize Express
const app = express();

// 4. Middleware
app.use(cors());
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
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/assets', express.static('assets'));
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/test-pdf', testPdfRoute);
app.use('/api/documents', documentRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/attendance', require('./routes/attendanceRoutes'));
// Add this with your other routes
app.use('/api/events', require('./routes/eventRoutes'));

// 6. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
