const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const prisma = require('./config/db');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    process.env.MOBILE_URL,
    'https://witless-gregg-acaulescent.ngrok-free.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8086',
    'http://10.55.135.30:3000',
    'http://10.55.135.30:3001',
    'http://10.55.135.30:5000',
    'http://10.55.135.30:8081',
    'http://192.168.1.11:3001',
    'http://192.168.1.11:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - Note: These currently use Mongoose controllers and will need updating
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
<<<<<<< HEAD
const chatRoutes = require('./routes/chat');
=======
const ivrRoutes = require('./routes/ivr');
>>>>>>> origin/naman

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
<<<<<<< HEAD
app.use('/api/chat', chatRoutes);
=======
app.use('/api/ivr', ivrRoutes);
>>>>>>> origin/naman

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Civic Setu API is running on Supabase',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Successfully connected to Supabase/PostgreSQL via Prisma');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Server accessible at http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
