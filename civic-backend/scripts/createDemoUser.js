const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const createDemoUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Check if demo user already exists
    const existingDemo = await User.findOne({
      $or: [{ email: 'demo@civicsetu.com' }, { phone: '9000000001' }]
    });

    if (existingDemo) {
      console.log('Demo user already exists');
      console.log('Email: demo@civicsetu.com');
      console.log('Password: demo123');
      process.exit(0);
    }

    // Create demo user
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@civicsetu.com',
      phone: '9000000001',
      password: 'demo123',
      role: 'demo',
      isVerified: true,
      language: 'en'
    });

    console.log('✅ Demo user created successfully!');
    console.log('');
    console.log('Demo Credentials:');
    console.log('==================');
    console.log('Email: demo@civicsetu.com');
    console.log('Password: demo123');
    console.log('');
    console.log('This user has read-only access to the admin dashboard.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating demo user:', error);
    process.exit(1);
  }
};

createDemoUser();
