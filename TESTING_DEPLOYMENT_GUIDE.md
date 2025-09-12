# 🚀 CIVIC_SETU Testing & Deployment Guide

## **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git
- Expo CLI for mobile development
- Cloudinary account for media uploads

## **Phase 1: Initial Setup & Configuration**

### **1.1 Database Setup**

**Option A: MongoDB Atlas (Recommended)**
1. Visit https://cloud.mongodb.com/
2. Create account and new cluster (Free tier: M0)
3. Create database user with read/write access
4. Whitelist your IP address (0.0.0.0/0 for all IPs during testing)
5. Get connection string

**Option B: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# macOS: brew install mongodb-community@7.0
# Linux: https://docs.mongodb.com/manual/administration/install-on-linux/

# Start MongoDB
mongod --dbpath /path/to/your/data/directory
```

### **1.2 Environment Configuration**

Update backend `.env` file:
```bash
cd civic-backend

# Copy and modify .env file
NODE_ENV=development
PORT=5000

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/civic_setu?retryWrites=true&w=majority

# For Local MongoDB
# MONGODB_URI=mongodb://localhost:27017/civic_setu

# Generate secure JWT secret
JWT_SECRET=your_super_secure_random_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration (sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URLs
CLIENT_URL=http://localhost:8081
ADMIN_URL=http://localhost:3000
```

### **1.3 Cloudinary Setup**
1. Sign up at https://cloudinary.com/ (free tier available)
2. Get Cloud Name, API Key, and API Secret from dashboard
3. Update `.env` file with these credentials

## **Phase 2: Testing**

### **2.1 Backend API Testing**

```bash
# Navigate to backend directory
cd civic-backend

# Install dependencies
npm install

# Start development server
npm run dev

# Server should start on http://localhost:5000
```

**Test API endpoints using curl or Postman:**

```bash
# Health check
curl http://localhost:5000/api/health

# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "admin@test.com",
    "phone": "9876543210",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "admin@test.com",
    "password": "password123"
  }'

# Get reports (requires authentication token)
curl -X GET http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **2.2 Admin Dashboard Testing**

```bash
# Navigate to admin directory
cd civic-admin

# Install dependencies
npm install

# Start development server
npm start

# Access at http://localhost:3000
```

**Test admin functionality:**
1. Login with admin credentials
2. Check dashboard statistics
3. View and manage reports
4. Manage users
5. View analytics charts

### **2.3 Mobile App Testing**

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Navigate to mobile directory  
cd civic-mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Scan QR code with Expo Go app (iOS/Android)
# Or press 'i' for iOS simulator, 'a' for Android emulator
```

**Test mobile features:**
1. User registration/login
2. View reports feed
3. Create new report with location
4. Camera integration
5. Offline functionality

## **Phase 3: Create Test Data**

### **3.1 Create Admin User**
```javascript
// Connect to MongoDB and run this script
// Or use the registration endpoint and manually change role in database

const bcrypt = require('bcryptjs');
const User = require('./civic-backend/models/User');

const createAdminUser = async () => {
  const adminUser = new User({
    name: 'System Admin',
    email: 'admin@civicsetu.com',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
    isActive: true
  });
  
  await adminUser.save();
  console.log('Admin user created');
};
```

### **3.2 Sample Report Data**
```javascript
// Create sample reports for testing
const Report = require('./civic-backend/models/Report');

const sampleReports = [
  {
    reporterId: 'USER_OBJECT_ID',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'road_issue',
    location: {
      address: 'Main Street, Ranchi',
      latitude: 23.3441,
      longitude: 85.3096
    },
    priority: 'high'
  },
  // Add more sample data...
];
```

## **Phase 4: Production Deployment**

### **4.1 Backend Deployment (Heroku/Railway)**

**Using Railway (Recommended):**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd civic-backend
railway init

# Add environment variables
railway variables:set MONGODB_URI=your_production_mongodb_uri
railway variables:set JWT_SECRET=your_production_jwt_secret
railway variables:set CLOUDINARY_CLOUD_NAME=your_cloud_name
railway variables:set CLOUDINARY_API_KEY=your_api_key
railway variables:set CLOUDINARY_API_SECRET=your_api_secret
railway variables:set NODE_ENV=production

# Deploy
railway up
```

**Using Heroku:**
```bash
# Install Heroku CLI
# Create new Heroku app
heroku create civic-setu-backend

# Set environment variables
heroku config:set MONGODB_URI=your_production_mongodb_uri
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy backend"
git push heroku main
```

### **4.2 Admin Dashboard Deployment (Vercel/Netlify)**

**Using Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to admin directory
cd civic-admin

# Update API URL in src/contexts/AuthContext.js
const API_BASE_URL = 'https://your-backend-url.railway.app/api';

# Build project
npm run build

# Deploy
vercel --prod
```

**Using Netlify:**
```bash
# Build project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

### **4.3 Mobile App Deployment**

**Build for Production:**
```bash
cd civic-mobile

# Update API URL in src/constants/config.js
export const API_BASE_URL = 'https://your-backend-url.railway.app/api';

# Build for app stores
expo build:android
expo build:ios

# Or use EAS Build (new recommended approach)
npx eas build --platform android
npx eas build --platform ios
```

## **Phase 5: Production Configuration**

### **5.1 Security Checklist**
- [ ] Change default JWT secret to strong random string
- [ ] Enable HTTPS on all endpoints
- [ ] Configure CORS for production domains
- [ ] Set up MongoDB Atlas IP whitelist
- [ ] Enable rate limiting
- [ ] Configure proper error handling (no stack traces in production)
- [ ] Set up monitoring and logging

### **5.2 Performance Optimization**
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure database indexing
- [ ] Implement caching where appropriate
- [ ] Optimize images and media

### **5.3 Monitoring & Analytics**
```bash
# Add monitoring tools
npm install helmet morgan compression
```

## **Phase 6: Testing Checklist**

### **Backend API Tests**
- [ ] User registration and authentication
- [ ] Report CRUD operations
- [ ] Media upload functionality
- [ ] Admin dashboard data endpoints
- [ ] Role-based access control
- [ ] Error handling and validation

### **Mobile App Tests**
- [ ] User registration/login flow
- [ ] Reports listing and filtering
- [ ] Create report with media upload
- [ ] GPS location functionality
- [ ] Offline data storage
- [ ] Push notifications (if implemented)

### **Admin Dashboard Tests**
- [ ] Admin authentication
- [ ] Dashboard statistics display
- [ ] Reports management interface
- [ ] User management functions
- [ ] Analytics charts rendering
- [ ] Responsive design on mobile

## **Common Issues & Solutions**

### **MongoDB Connection Issues**
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string format
# Ensure database user has proper permissions
```

### **CORS Issues**
```javascript
// In server.js, update CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'https://your-admin-domain.com'],
  credentials: true
}));
```

### **Mobile App Connection Issues**
- Ensure API_BASE_URL points to accessible server
- Check network permissions in app.json
- Verify SSL certificates for HTTPS

### **Build Issues**
```bash
# Clear node_modules and package-lock.json
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
expo r -c
```

## **Useful Commands**

```bash
# Backend
npm run dev          # Start development server
npm run start        # Start production server

# Admin Dashboard  
npm start           # Start development server
npm run build       # Build for production

# Mobile App
npx expo start      # Start development server
npx expo r -c       # Start with cache cleared
```

## **Support & Resources**

- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com/
- **Cloudinary Documentation**: https://cloudinary.com/documentation
- **Expo Documentation**: https://docs.expo.dev/
- **Railway Documentation**: https://docs.railway.app/
- **React Native Documentation**: https://reactnative.dev/docs

---

**Next Steps After Deployment:**
1. Set up automated backups for database
2. Configure monitoring and alerts
3. Set up CI/CD pipeline
4. Plan for scaling and performance optimization
5. Implement additional features from Phase 2+ roadmap