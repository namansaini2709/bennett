# 🏛️ CIVIC SETU - COMPLETE PROJECT OVERVIEW
## Crowdsourced Civic Issue Reporting & Resolution System

---

## 📌 PROJECT SUMMARY

**CIVIC SETU** is a comprehensive full-stack platform empowering citizens of Jharkhand to report civic issues with photos/videos, track complaint status in real-time, and ensure transparent municipal accountability through a three-tier system:

- **📱 Mobile App (React Native)** - Citizens report and track issues
- **💻 Admin Dashboard (React)** - Municipal staff manage and resolve reports
- **⚙️ Backend API (Node.js)** - Centralized data management and business logic

---

## 🎯 COMPLETE TECH STACK

### Frontend Technologies
| Component | Technology | Version |
|-----------|-----------|---------|
| **Mobile App** | React Native | 0.81.4 |
| **Mobile Framework** | Expo SDK | 54.0.10 |
| **Admin Dashboard** | React | 19.1.1 |
| **UI Library (Mobile)** | React Native Paper | 5.14.5 |
| **UI Library (Admin)** | Material-UI (MUI) | 7.3.2 |
| **Navigation (Mobile)** | React Navigation | 7.x |
| **Routing (Admin)** | React Router DOM | 7.8.2 |
| **State Management** | React Context API | - |
| **Animations (Mobile)** | React Native Animatable | 1.4.0 |
| **Animations (Admin)** | Framer Motion | 12.23.22 |
| **Charts** | Recharts | 3.2.0 |
| **Maps (Admin)** | React Leaflet | 5.0.0 |
| **Maps (Mobile)** | React Native Maps | 1.20.1 |

### Backend Technologies
| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 14+ |
| **Framework** | Express | 5.1.0 |
| **Database** | MongoDB Atlas | 8.18.1 |
| **ODM** | Mongoose | 8.18.1 |
| **Authentication** | JSON Web Token (JWT) | 9.0.2 |
| **Password Hashing** | bcryptjs | 3.0.2 |
| **Media Storage** | Cloudinary | 2.7.0 |
| **File Upload** | Multer | 2.0.2 |
| **Security Headers** | Helmet | 8.1.0 |
| **CORS** | cors | 2.8.5 |
| **Rate Limiting** | express-rate-limit | 8.1.0 |
| **Validation** | express-validator | 7.2.1 |
| **HTTP Client** | Axios | 1.12.2 |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **Nodemon** | Auto-restart server |
| **Postman** | API testing |
| **VS Code** | Code editor |
| **Expo CLI** | Mobile development |
| **React DevTools** | Debugging |

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         CIVIC SETU PLATFORM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   MOBILE APP │         │    ADMIN     │                     │
│  │ React Native │◄───────►│  DASHBOARD   │                     │
│  │   (Expo)     │         │    (React)   │                     │
│  └──────┬───────┘         └──────┬───────┘                     │
│         │                        │                              │
│         │        JWT Auth        │                              │
│         └────────┬───────────────┘                              │
│                  │                                               │
│         ┌────────▼───────────┐                                  │
│         │   BACKEND API      │                                  │
│         │   Node.js/Express  │                                  │
│         │   MVC Architecture │                                  │
│         └────────┬───────────┘                                  │
│                  │                                               │
│         ┌────────┴───────────┐                                  │
│         │                    │                                  │
│    ┌────▼────┐        ┌──────▼─────┐                           │
│    │ MongoDB │        │ Cloudinary │                           │
│    │  Atlas  │        │   (Media)  │                           │
│    └─────────┘        └────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 MOBILE APP - COMPLETE FEATURES

### Architecture Pattern
- **Navigation**: Nested Stack + Bottom Tab Navigator
- **State Management**: React Context (AuthContext, ThemeContext)
- **API Layer**: Axios service layer with interceptors
- **Storage**: AsyncStorage for token persistence

### User Journey & Features

#### 1️⃣ Authentication System
**Features:**
- ✅ User Registration with validation
- ✅ Login (Email/Phone + Password)
- ✅ JWT Token with auto-refresh
- ✅ Persistent login (AsyncStorage)
- ✅ Logout with confirmation dialog
- ✅ Password visibility toggle
- ✅ Form validation with error messages

**Technical Implementation:**
- JWT stored in AsyncStorage (`userToken`, `userData`)
- Axios interceptor auto-injects token
- 401 error handling with auto-logout
- bcrypt password hashing (10 rounds)

#### 2️⃣ Multi-Step Report Creation (4 Steps)
**Step 1: Basic Information**
- Title input (max 100 chars)
- Description textarea (max 1000 chars)
- Category selection grid (12 categories)
- Per-step validation before proceeding

**Step 2: Location Details**
- **GPS Auto-capture** with permissions
  - High-accuracy location (Location.Accuracy.High)
  - Reverse geocoding (coordinates → address)
  - 15-second timeout with fallback
- **Manual Address Entry**
  - Address autocomplete suggestions
  - Forward geocoding (address → coordinates)
  - Address search functionality
- Location preview with coordinates

**Step 3: Add Photo (Optional)**
- **Camera Capture**
  - Camera permission handling
  - In-app photo capture
  - Aspect ratio: 4:3
- **Gallery Selection**
  - Media library permissions
  - Image picker with edit option
- Image compression (80% quality)
- Image preview with remove option

**Step 4: Review & Submit**
- Complete summary display
- Edit any step (back navigation)
- Submit with FormData (multipart/form-data)
- Success modal with animation
- Auto-navigate to Home tab
- Complete form reset

#### 3️⃣ Home Dashboard
**Quick Statistics:**
- Total Reports count
- Pending Reports (submitted + acknowledged + assigned)
- In Progress reports
- Resolved reports

**Features:**
- Animated stat cards with icons
- Pull-to-refresh functionality
- Recent reports list
- Search bar (real-time filtering)
- Category filter chips
- Status-based color coding
- Floating Action Button (quick report)
- Animated header with scroll effects
- "See All" navigation

#### 4️⃣ Report Tracking
**My Reports Screen:**
- User's submitted reports
- Status badges with consistent colors
- Category icons (dynamic mapping)
- Location and creation date
- Pull-to-refresh
- Tap to view detailed report
- Empty state handling

**Report Detail Screen:**
- Complete report information
- Status timeline/history
- Comments section
- Media attachments
- Upvote functionality
- Location map view
- Reporter information

#### 5️⃣ Profile Management
**User Information:**
- Name, email, phone
- Location details
- Profile picture
- Member since date
- Dynamic report count badge

**Settings Menu:**
- ✏️ Edit Profile
- 📄 My Reports
- 🌙 Theme Toggle (Dark/Light mode)
- 🔔 Notifications settings
- 🌐 Language selection
- ❓ Help & Support
- ℹ️ About
- 🚪 Logout (with confirmation)

**Theme System:**
- Light/Dark mode toggle
- Persistent preference (AsyncStorage)
- Live switching with animations
- Custom color palette
- Material Design 3 principles

#### 6️⃣ All Reports (Community View)
- View all community reports
- Filter by category, status
- Search functionality
- Map view for geographic visualization
- Upvote/engagement features

### Technical Specifications

**Report Categories (12):**
```
road_issue, water_supply, electricity, garbage,
drainage, street_light, traffic, pollution,
encroachment, other
```

**Report Status Workflow (7 states):**
```
submitted → acknowledged → assigned → in_progress → resolved
                                  ↓
                            rejected / closed
```

**API Endpoints Used:**
```http
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/updateprofile
GET    /api/reports
GET    /api/reports/my-reports
POST   /api/reports
GET    /api/reports/:id
POST   /api/reports/:id/comment
POST   /api/reports/:id/upvote
GET    /api/reports/stats
```

**Navigation Structure:**
```
MainNavigator (Authenticated)
├── Citizen Flow (Bottom Tabs)
│   ├── Home → HomeStack
│   │   ├── HomeScreen
│   │   └── AllReportsScreen
│   ├── CreateReport → CreateReportScreen
│   ├── MyReports → MyReportsStack
│   │   ├── MyReportsScreen
│   │   └── ReportDetailScreen
│   └── Profile → ProfileScreen
│       └── EditProfileScreen
└── Staff/Admin Flow (Bottom Tabs)
    ├── Dashboard → AdminDashboardScreen
    ├── ManageReports → ManageReportsScreen
    └── Profile → ProfileScreen
```

**Custom Components (25+):**
- AnimatedCard, AnimatedButton, AnimatedInput
- LoadingOverlay, FloatingActionButton
- ConfirmDialog, InfoDialog
- Button (Material Design variants)
- Card, Input, EmptyState, Toast
- StatusBadge, CategoryIcon
- Skeleton loaders

**Performance Optimizations:**
- Image compression (80% quality)
- Lazy loading with useFocusEffect
- Memoized calculations
- FlatList with keyExtractor
- Proper cleanup in useEffect
- Optimized re-renders

---

## 💻 ADMIN DASHBOARD - COMPLETE FEATURES

### Architecture Pattern
- **Routing**: React Router DOM with protected routes
- **State Management**: Context API (AuthContext, ThemeContext)
- **Layout**: Responsive sidebar + AppBar
- **API Layer**: Axios with JWT authentication

### Dashboard Features

#### 1️⃣ Login & Authentication
**Features:**
- ✅ Email/Phone + Password login
- ✅ Role-based access (admin/supervisor only)
- ✅ Glassmorphism design
- ✅ Animated background gradient
- ✅ Show/hide password toggle
- ✅ JWT token storage (localStorage)
- ✅ Framer Motion animations

**Security:**
- Blocks citizen/staff roles
- Protected routes with PrivateRoute component
- Session persistence
- Auto-logout on token expiry

#### 2️⃣ Main Dashboard
**Real-time Statistics (6 Cards):**
- 📊 Total Reports (all time)
- 📅 Today's Reports (trending indicator)
- ⏳ Pending Reports
- ✅ Resolved Reports
- 👥 Total Users (Citizens)
- 👔 Active Staff

**Features:**
- Auto-refresh every 30 seconds
- CountUp number animations
- Animated stat cards with hover effects
- Recent 10 reports table
- Status chips with color coding
- Quick action buttons

#### 3️⃣ Report Management (Most Comprehensive)
**View Modes:**
- 📋 **List View** - Detailed table
- 🗺️ **Map View** - Geographic visualization with clustering

**Advanced Filtering:**
- Filter by: Category, Priority, Status, Assigned To
- Multi-select filters
- Dynamic filter options (extracted from data)
- "Clear All Filters" button
- Shows "X of Y reports"

**Actions Available:**
1. **View Details** - Full report dialog with:
   - Title, description, category, priority
   - Location with address
   - Reporter information
   - Media attachments
   - Status history
   - Comments
   - Assignment details

2. **Assign Report** - Two-step assignment:
   - Select Department (10 civic departments)
   - Select Staff Member (filtered by department)
   - Auto-loads staff list by department
   - Prevents assignment if no staff available
   - Sets status to "assigned" automatically

3. **Update Status** - Status management:
   - Dropdown with 7 status options
   - Comment/note field (multiline)
   - Tracks status history
   - Notifies relevant parties (planned)
   - Color-coded status indicators

4. **Delete Report** - Permanent deletion:
   - Confirmation dialog (admin only)
   - Irreversible action warning
   - Audit log entry

**Map View Features:**
- Interactive Leaflet map
- Marker clustering (performance optimization)
- Status-based marker colors
- Click marker → View report details popup
- Auto-fit bounds to show all reports
- Default center: Jharkhand [23.3441, 85.3096]

#### 4️⃣ User Management (Citizens)
**Features:**
- View all citizens (filtered by role)
- Filter by: Department, Verified status
- Toggle active/inactive status
- View registration date
- See verification status
- Real-time status updates

**User Information Displayed:**
- Name, Email, Phone
- Role, Department
- Verified status badge
- Active/Inactive toggle
- Join date

#### 5️⃣ Staff Management
**Create New Staff:**
- 7-field form:
  - Name (required)
  - Email (required, validated)
  - Phone (required, Indian format)
  - Password (required, min 6 chars)
  - Role (staff/supervisor/admin)
  - Department (10 options)
  - Assigned Area
- Validation with error messages
- Success/error toast notifications

**Staff Operations:**
- View all staff/supervisors/admins
- Filter by: Role, Department, Verified status
- Activate/deactivate staff accounts
- See assigned areas
- Track verification status

**Departments Supported (10):**
```
road_maintenance, water_supply, electricity,
waste_management, drainage, street_lighting,
traffic_police, pollution_control,
municipal_corporation, general
```

#### 6️⃣ Department Management (CRUD)
**Create Department:**
- Name (required)
- Code (required, uppercase, unique)
- Description
- Assigned Categories (multi-select)
- Contact Email (validated)
- Contact Phone (Indian format validated)
- Active/Inactive status

**Department Operations:**
- View all departments
- Edit department details
- Delete department (soft delete)
- Assign categories to departments
- Set department head (future)
- Track active/inactive status

#### 7️⃣ Advanced Analytics Dashboard
**Summary Statistics:**
- Total Reports count
- Resolution Rate percentage
- Average Resolution Time (hours)
- Most Active Category
- Active Users count
- Pending Reports count

**Visualizations (Recharts):**

1. **📈 Reports Timeline** - Area Chart
   - Time-series data
   - Smooth gradient fill
   - Trend analysis over time
   - Grouping: hour/day/week/month

2. **🥧 Reports by Category** - Pie Chart
   - 12 color-coded categories
   - Percentage labels
   - Legend with count
   - Interactive tooltips

3. **📊 User Registration Trend** - Bar Chart
   - Last 30 days data
   - Gradient bars
   - Daily new user count

4. **📉 User Role Distribution** - Linear Progress Bars
   - Role-based breakdown
   - Active vs Verified counts
   - Color-coded by role
   - Percentage display

5. **🏆 Top Reporters** - Leaderboard
   - Top 10 most active citizens
   - Badge icons (🥇🥈🥉)
   - Report count display
   - Join date information

**Time Range Filters:**
- 7 Days, 30 Days, 90 Days
- Toggle button selection
- Auto-refresh toggle (pause/play)

**Export Features (UI Ready):**
- Export button present
- PDF generation (planned)
- CSV export (planned)
- Excel analytics reports (planned)

#### 8️⃣ Profile Page
**User Information:**
- Name, Email, Role
- Last login timestamp
- Account creation date
- Department assignment

**Profile Actions:**
- Update profile (API ready)
- Change password (planned)
- Upload profile picture (planned)
- Logout

### Technical Specifications

**API Endpoints Used:**
```http
POST   /api/auth/login
GET    /api/auth/me
GET    /api/admin/dashboard
GET    /api/reports
PATCH  /api/reports/:id/status
POST   /api/reports/:id/assign
DELETE /api/reports/:id
GET    /api/users
PUT    /api/users/:id/activate
PUT    /api/users/:id/deactivate
POST   /api/admin/staff/create
GET    /api/admin/departments
POST   /api/admin/departments
PUT    /api/admin/departments/:id
DELETE /api/admin/departments/:id
GET    /api/admin/reports/analytics
GET    /api/admin/users/analytics
```

**Component Library:**
- Material-UI (MUI) v7.3.2
- 100+ pre-built components
- Customized theme with brand colors
- Responsive Grid system
- Drawer navigation
- Data tables with sticky headers

**Custom Components:**
- AnimatedCard (Framer Motion)
- CustomCursor (animated pointer)
- MapView (Leaflet integration)
- Layout (sidebar + AppBar)
- PrivateRoute (authentication guard)
- ClusterMarker (map clustering)

**UI/UX Features:**
- 🌗 Dark/Light theme toggle
- 📱 Fully responsive design
- 🎨 Custom animated cursor
- ✨ Framer Motion animations
- 🔔 Toast notifications (React Toastify)
- ⏳ Loading states (CircularProgress)
- ⚠️ Error handling with alerts
- 📍 Interactive maps (Leaflet)

---

## ⚙️ BACKEND API - COMPLETE FEATURES

### Architecture Pattern
**MVC (Model-View-Controller)**
```
Routes → Middleware → Controllers → Models → Database
```

**Directory Structure:**
```
civic-backend/
├── config/          # Cloudinary configuration
├── controllers/     # Business logic (4 files, ~2,137 lines)
├── middleware/      # Auth, upload, validation
├── models/          # MongoDB schemas (4 models)
├── routes/          # API endpoints (4 route files)
├── utils/           # JWT token generation
├── uploads/         # Temporary file storage
└── server.js        # Entry point (99 lines)
```

### Database Models (MongoDB/Mongoose)

#### 1️⃣ User Model (121 lines)
**Complete Schema:**
```javascript
{
  // Identity
  name, email (unique), phone (unique), password (hashed),

  // Access Control
  role: ['citizen', 'staff', 'supervisor', 'admin'],
  language: ['en', 'hi', 'ho', 'sa', 'ku', 'mu'],

  // Location
  address: { street, locality, city, state, pincode, lat, lng },

  // Profile
  profilePicture, isVerified, isActive, isDeleted,

  // Staff-Specific
  department, assignedArea,

  // Security
  verificationToken, resetPasswordToken, resetPasswordExpire,

  // Audit
  createdBy, updatedBy, createdAt, updatedAt
}
```

**Indexes:** role, isActive
**Methods:** matchPassword(), toJSON()
**Hooks:** Pre-save password hashing (bcrypt, 10 rounds)

#### 2️⃣ Report Model (210 lines)
**Complete Schema:**
```javascript
{
  // Report Details
  reporterId (→User), title, description, category, priority, status,

  // Location
  location: { address, locality, ward, city, pincode, lat, lng },

  // Media
  media: [→Media],

  // Assignment
  assignedTo (→User), assignedBy (→User), assignedAt, department,

  // History Tracking
  statusHistory: [{ status, changedBy, changedAt, comment }],

  // Communication
  comments: [{ user, text, isInternal, createdAt }],

  // Resolution
  resolution: { resolvedBy, resolvedAt, notes, beforeMedia, afterMedia },

  // Feedback
  feedback: { rating (1-5), comment, submittedAt },

  // Metrics
  estimatedResolutionTime, actualResolutionTime,

  // Engagement
  isAnonymous, viewCount, upvotes: [→User],

  // Status
  isActive, isDeleted,

  // Audit
  createdBy, updatedBy, createdAt, updatedAt
}
```

**Indexes:** reporterId, status, category, location (2dsphere), createdAt (DESC), assignedTo, department
**Methods:** calculateResolutionTime()
**Hooks:** Auto-add to statusHistory on status change

#### 3️⃣ Media Model (89 lines)
**Complete Schema:**
```javascript
{
  // Association
  reportId (→Report),

  // File Details
  type: ['image', 'video', 'document'],
  url (Cloudinary), cloudinaryId, thumbnailUrl,
  fileName, fileSize, mimeType, duration, width, height,

  // Metadata
  caption, tags,

  // Upload Info
  uploadedBy (→User),

  // Status
  isActive, isDeleted,

  // Audit
  createdBy, updatedBy, createdAt, updatedAt
}
```

**Indexes:** reporterId, type, uploadedBy, createdAt (DESC)
**Methods:** generateThumbnail()

#### 4️⃣ Department Model (68 lines)
**Complete Schema:**
```javascript
{
  // Identity
  name (unique), code (unique, uppercase), description,

  // Mapping
  categories: [report categories],

  // Contact
  headOfDepartment (→User), contactEmail, contactPhone,

  // Status
  isActive, isDeleted,

  // Audit
  createdBy, updatedBy, createdAt, updatedAt
}
```

**Indexes:** isActive

### Complete API Specification (50+ Endpoints)

#### Authentication Routes (`/api/auth`) - 10 endpoints
```http
POST   /api/auth/register               # User registration
POST   /api/auth/login                  # Email/Phone login
POST   /api/auth/logout                 # Logout
GET    /api/auth/me                     # Get current user
PUT    /api/auth/updateprofile          # Update profile
PUT    /api/auth/updatepassword         # Change password
POST   /api/auth/forgotpassword         # Request reset
PUT    /api/auth/resetpassword/:token   # Reset password
POST   /api/auth/verify/:token          # Verify email
POST   /api/auth/refresh                # Refresh JWT
```

#### Report Routes (`/api/reports`) - 15 endpoints
```http
GET    /api/reports                     # List all (with filters)
GET    /api/reports/my-reports          # User's reports
GET    /api/reports/nearby              # Geospatial search
GET    /api/reports/stats               # Aggregate statistics
GET    /api/reports/:id                 # Single report
POST   /api/reports                     # Create (with media)
PUT    /api/reports/:id                 # Update report
DELETE /api/reports/:id                 # Delete (admin only)
PATCH  /api/reports/:id/status          # Update status
POST   /api/reports/:id/assign          # Assign to staff
POST   /api/reports/:id/comment         # Add comment
POST   /api/reports/:id/upvote          # Upvote/remove
POST   /api/reports/:id/feedback        # Add rating
POST   /api/reports/:id/media           # Add media
DELETE /api/reports/:id/media/:mediaId  # Delete media
```

#### User Routes (`/api/users`) - 6 endpoints
```http
GET    /api/users                       # List all (paginated)
GET    /api/users/:id                   # Get by ID
PUT    /api/users/:id                   # Update user
DELETE /api/users/:id                   # Soft delete
PUT    /api/users/:id/activate          # Activate account
PUT    /api/users/:id/deactivate        # Deactivate account
```

#### Admin Routes (`/api/admin`) - 10 endpoints
```http
GET    /api/admin/dashboard             # Dashboard stats
GET    /api/admin/reports/analytics     # Time-series analytics
GET    /api/admin/users/analytics       # User analytics
GET    /api/admin/performance           # Staff performance
POST   /api/admin/staff/assign-area     # Assign area to staff
POST   /api/admin/staff/create          # Create staff account
GET    /api/admin/departments           # List departments
POST   /api/admin/departments           # Create department
PUT    /api/admin/departments/:id       # Update department
DELETE /api/admin/departments/:id       # Delete department
```

### Middleware Stack

#### 1️⃣ Authentication Middleware (`middleware/auth.js`)
**Functions:**
- `protect`: Verify JWT, load user, check active status
- `authorize(...roles)`: Role-based access control
- `optionalAuth`: Optional authentication for public endpoints

**JWT Configuration:**
- Secret: `process.env.JWT_SECRET`
- Access Token Expiry: 7 days
- Refresh Token Expiry: 30 days
- Payload: `{ id, role, department }`

#### 2️⃣ File Upload Middleware (`middleware/upload.js`)
**Multer Configuration:**
- Storage: Disk (temporary `/uploads` directory)
- Max Files: 5 per request
- Max File Size: 50 MB
- Allowed Types: JPEG, JPG, PNG, GIF, MP4, MOV, AVI, PDF
- Validation: Extension + MIME type check

#### 3️⃣ Validation Middleware (express-validator)
- Registration: name, email, phone, password
- Login: emailOrPhone, password
- Report: title, description, category, location

#### 4️⃣ Security Middleware (`server.js`)
- **Helmet**: XSS, clickjacking, CSP, HSTS
- **CORS**: Configured allowed origins (localhost + LAN)
- **Rate Limiting**: 1000 req/min per IP on `/api/*`
- **Body Parser**: 50MB limit for JSON/URL-encoded

### Business Logic Highlights

#### Report Status Workflow
```
submitted → acknowledged → assigned → in_progress → resolved
                                  ↓
                            rejected / closed
```

**Business Rules:**
- Citizens can only update reports in `submitted` status
- Status changes tracked in `statusHistory` array
- Resolution time auto-calculated when status → `resolved`
- Feedback only allowed on `resolved` reports by reporter

#### Assignment Logic
- Department code stored in `report.department`
- Staff must have matching `department` field
- Supervisor/Admin can assign to any staff in department
- Auto-routing planned (Phase 2: ML-based)

#### Analytics Engine
**Dashboard Stats:**
- Total reports, Today's reports
- Pending (submitted → in_progress)
- Resolved reports
- Total citizens, Active staff
- Recent 10 reports

**Report Analytics:**
- Time-series grouping (hour/day/week/month)
- Status counts over time
- Category-wise breakdown
- Resolution vs pending per category

**User Analytics:**
- Role distribution
- Active/verified counts
- Registration trend (daily new users)
- Top 10 reporters by count

**Performance Metrics:**
- Staff performance (assigned, resolved, rate)
- Average resolution time per staff
- Department performance
- Resolution rate: `(resolved / total) × 100`

#### Geospatial Queries
- Uses MongoDB `$geoNear` aggregation
- Requires 2dsphere index on location.latitude/longitude
- Searches within radius (default: 5 km)
- Returns distance in meters
- Sorted by proximity

### External Integrations

#### Cloudinary (Media Storage)
**Configuration:**
- Cloud name, API key, API secret from .env
- Upload to `civic-reports` folder
- Store `secure_url` and `public_id`
- Auto-generate thumbnails:
  - Images: `w_150,h_150,c_thumb`
  - Videos: `so_0.0,w_300,h_200,c_fill` (first frame)
- Delete using `cloudinary.uploader.destroy()`

#### MongoDB Atlas (Database)
- Cloud-hosted database
- Connection string from .env
- Retries on connection failure
- Server exits if connection fails
- Connection options: retryWrites, writeConcern

#### Planned Integrations
- **Email Service (SMTP)**: Password reset, verification
- **Firebase Cloud Messaging**: Push notifications
- **SMS Service**: OTP, alerts
- **Google Maps API**: Enhanced geocoding

### Security Features

#### Authentication Security
- JWT tokens (stateless, secure)
- Password hashing (bcrypt, 10 rounds)
- Token expiry (7 days access, 30 days refresh)
- Active user check in middleware
- Password reset (SHA256-hashed tokens, 10-min expiry)

#### Input Security
- express-validator for input validation
- Mongoose built-in validation
- File upload validation (extension + MIME)
- Mongoose automatic query sanitization

#### API Security
- Rate limiting (1000/min per IP)
- CORS with allowed origins
- Helmet security headers
- Body parser limits (50MB)
- JWT verification on protected routes

#### Data Security
- Soft delete (isDeleted flag)
- Password excluded from queries (select: false)
- Audit trail (createdBy, updatedBy)
- toJSON override removes sensitive fields

### Performance Optimizations
- Database indexes on frequently queried fields
- Pagination for list endpoints
- Aggregate queries for analytics
- Lean queries (Mongoose)
- Connection pooling (default)
- Cloudinary CDN for media

---

## 🎨 DESIGN SYSTEM

### Color Palette
**Primary Colors:**
- Primary: Indigo (#6366f1)
- Secondary: Pink (#ec4899)
- Accent: Emerald (#10b981)

**Status Colors:**
- Success: #10b981 (Emerald)
- Warning: #f59e0b (Amber)
- Error: #ef4444 (Red)
- Info: #3b82f6 (Blue)
- Pending: #f59e0b (Orange)
- In Progress: #3b82f6 (Blue)
- Resolved: #10b981 (Green)

**Theme Modes:**
- **Light**: Background #f8fafc, Paper #ffffff, Text #1e293b
- **Dark**: Background #0f172a, Paper #1e293b, Text #f8fafc

### Typography
- **Font Family**:
  - Mobile: System default (Roboto/SF Pro)
  - Admin: Roboto, sans-serif
- **Scale**:
  - Heading: 24-32px
  - Subheading: 18-20px
  - Body: 14-16px
  - Caption: 12px

### Spacing System
```
xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px
```

### Border Radius
```
sm: 8px, md: 12px, lg: 16px, xl: 20px, full: 1000px
```

### Shadows
```
small: elevation 2
medium: elevation 4
large: elevation 8
```

### Animations
- **Duration**: 200-300ms
- **Easing**: ease-in-out
- **Types**: Fade, Slide, Scale, Bounce
- **Libraries**: Framer Motion, React Native Animatable

---

## 📊 BY THE NUMBERS

### Codebase Statistics
- **Total Lines of Code**: ~15,000+ (excluding node_modules)
- **Backend**: ~2,600 lines
  - Controllers: 2,137 lines
  - Models: 278 lines
  - Routes: 71 lines
  - Middleware: 112 lines
- **Admin Dashboard**: ~6,000+ lines
  - Pages: 8 main screens
  - Components: 10+ custom components
- **Mobile App**: ~6,000+ lines
  - Screens: 15+ screens
  - Components: 25+ custom components

### Feature Count
- **API Endpoints**: 50+ REST endpoints
- **Database Models**: 4 (User, Report, Media, Department)
- **Mobile Screens**: 15+ screens
- **Admin Pages**: 8 pages
- **Report Categories**: 12 civic issue types
- **Report Statuses**: 7 workflow states
- **User Roles**: 4 (citizen, staff, supervisor, admin)
- **Departments**: 10 civic departments

### Technology Count
- **Languages**: JavaScript (ES6+)
- **Frameworks**: 3 (React Native, React, Node.js)
- **UI Libraries**: 2 (React Native Paper, Material-UI)
- **Database**: 1 (MongoDB with Mongoose)
- **Cloud Services**: 2 (MongoDB Atlas, Cloudinary)
- **NPM Packages**: 60+ dependencies
- **Development Tools**: 10+ (Git, Nodemon, Expo CLI, etc.)

---

## 🚀 DEPLOYMENT & SCALABILITY

### Current Setup
**Development Environment:**
- Backend: `http://localhost:5000`
- Admin: `http://localhost:3000`
- Mobile: `http://localhost:8081` (Expo)

**Hosting:**
- Database: MongoDB Atlas (cloud)
- Media: Cloudinary (cloud CDN)
- Backend: Local development server
- No CI/CD pipeline yet

### Production Readiness Checklist

**✅ Ready:**
- Environment variables configured
- CORS properly setup
- Database connections optimized
- Media upload working
- Authentication secure
- Error handling implemented
- Soft delete pattern
- Audit trails
- Input validation

**⚠️ Needs Improvement:**
- Rate limiting (reduce to 100/min)
- Logging (add Winston)
- Environment validation
- Health checks (enhance)
- Monitoring (add APM)
- HTTPS enforcement
- Unit/integration tests
- API documentation (Swagger)

### Scalability Strategies

**Horizontal Scaling:**
- Multiple Node.js instances behind load balancer
- PM2 cluster mode for multi-core usage
- Separate read/write database replicas

**Performance Optimization:**
- Redis caching layer for dashboard stats
- Message queue (Bull/Bee) for async tasks
- CDN for media delivery (Cloudinary provides)
- Database query optimization
- Lazy loading and code splitting

**Infrastructure:**
- Docker containers for consistency
- Kubernetes for orchestration
- AWS/Azure/GCP deployment
- Automated backups
- Log aggregation (ELK stack)

---

## 🎓 KEY LEARNINGS & CHALLENGES

### Technical Challenges Overcome

#### 1️⃣ Multi-Step Form State Management
**Challenge:** Managing complex form state across 4 steps with location, media, and validation
**Solution:**
- Step-based validation system
- Clear error states per field
- FormData for multipart submission
- Complete state cleanup on success

#### 2️⃣ Location Services Reliability
**Challenge:** GPS timeout, permission denial, geocoding failures
**Solution:**
- Multi-layer fallback (GPS → manual → address-only)
- 15-second timeout with high accuracy
- Reverse geocoding with error handling
- Manual address entry with autocomplete

#### 3️⃣ Cross-Platform Media Upload
**Challenge:** Backend expecting FormData with image + JSON fields
**Solution:**
- Proper FormData construction with file metadata
- Multer configuration with validation
- Cloudinary integration with thumbnails
- Local cleanup after cloud upload

#### 4️⃣ Consistent Status Display
**Challenge:** Status colors/labels scattered across 8+ files
**Solution:**
- Created `reportStatus.js` centralized config
- Helper functions for label/color/description
- Shared between mobile and admin
- Single source of truth

#### 5️⃣ Authentication Persistence
**Challenge:** Token expiration, 401 errors, manual re-login
**Solution:**
- Axios interceptors for token injection
- 401 response → auto-logout → redirect
- Refresh token implementation
- AsyncStorage/localStorage persistence

#### 6️⃣ Real-time Dashboard Updates
**Challenge:** Stale data, manual refresh required
**Solution:**
- setInterval auto-refresh (30s)
- Pull-to-refresh on mobile
- useFocusEffect for navigation-based refresh
- Loading states during fetch

#### 7️⃣ Role-Based Navigation
**Challenge:** Different UIs for citizen vs staff vs admin
**Solution:**
- Conditional navigator rendering
- Role check in AuthContext
- Separate tab navigators
- Protected routes with middleware

### Development Best Practices Applied

✅ **Clean Architecture**: MVC pattern, separation of concerns
✅ **Centralized Configuration**: Status, categories, colors in constants
✅ **Error Handling**: Try-catch, user-friendly messages, toast notifications
✅ **Security**: JWT, bcrypt, rate limiting, input validation
✅ **Performance**: Indexes, pagination, lazy loading, memoization
✅ **Code Reusability**: Custom components, service layer, utility functions
✅ **User Experience**: Loading states, animations, feedback, empty states
✅ **Responsive Design**: Mobile-first, adaptive layouts, theme support
✅ **Audit Trail**: createdBy/updatedBy, soft deletes, status history
✅ **API Design**: RESTful, consistent responses, proper HTTP methods

---

## 🔮 FUTURE ROADMAP

### Phase 2: Enhanced Features (Q1 2025)
- 🔔 Push Notifications (FCM integration)
- 📴 Offline Mode (queue reports, sync when online)
- 🗺️ Interactive Maps (clustering, heatmaps)
- 🔍 Advanced Search (keywords, date range, radius)
- 🌐 Full Localization (Hindi + tribal dialects)
- 📊 Enhanced Analytics (predictive insights)

### Phase 3: AI & Automation (Q2 2025)
- 🤖 ML-based Auto-Routing (category → department)
- 📷 Image Recognition (auto-categorize from photo)
- 🎯 Duplicate Detection (similar reports)
- 📈 Predictive Analytics (issue hotspots)
- 💬 Chatbot Support (citizen queries)
- 📱 WhatsApp Integration (report via WhatsApp)

### Phase 4: Government Integration (Q3 2025)
- 🏛️ Government API Integration
- 🆔 Aadhaar e-KYC Verification
- 💳 Payment Gateway (fines/challans)
- 🔗 Municipal System Integration
- 📜 RTI Integration
- 🏆 Citizen Engagement Rewards

### Phase 5: Community Features (Q4 2025)
- 👥 Community Voting
- 🗨️ Public Comments
- 📢 Campaign Creation
- 🎖️ Verification Badges
- 👔 NGO Dashboard
- 📊 Public Transparency Reports

---

## 📞 SUPPORT & DOCUMENTATION

### Getting Started
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
cd civic-backend && npm install
cd ../civic-admin && npm install
cd ../civic-mobile && npm install

# Configure environment
# Copy .env.example to .env in each directory
# Update MongoDB URI, Cloudinary keys, JWT secret

# Start backend
cd civic-backend && npm run dev

# Start admin dashboard
cd civic-admin && npm start

# Start mobile app
cd civic-mobile && npm start
```

### Environment Variables Required
**Backend:**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-secret-key>
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
```

**Admin Dashboard:**
```
REACT_APP_API_URL=http://localhost:5000
```

**Mobile App:**
```
API_BASE_URL=http://localhost:5000
```

### Documentation Files
- `CLAUDE.md` - Project overview and guidelines
- `activity.log` - Development activity log
- `README.md` - Setup instructions
- `PROJECT_OVERVIEW.md` - This comprehensive document

---

## 🤝 CONTRIBUTING

This project is built for social impact. Contributions welcome!

**Areas for Contribution:**
- Backend optimization and testing
- Mobile app feature additions
- Admin dashboard enhancements
- UI/UX improvements
- Documentation
- Bug fixes
- Security enhancements

---

## 📄 LICENSE

MIT License (or specify your license)

---

## 👨‍💻 PROJECT AUTHOR

**Project**: CIVIC SETU - Crowdsourced Civic Issue Reporting System
**Target Region**: Jharkhand, India
**Purpose**: Empowering citizens, ensuring municipal accountability
**Status**: MVP Complete, Production-Ready with improvements

---

**Built with ❤️ for better civic governance**

*Last Updated: January 2025*
