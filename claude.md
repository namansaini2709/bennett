# claude.md

## 🧭 Project Overview: 
Crowdsourced Civic Issue Reporting & Resolution System

A mobile-first named platform named "CIVIC SETU" to empower **citizens of Jharkhand** to report civic issues with images/videos, **track complaint status**, and ensure **transparent municipal accountability**. 

Citizens use a **React Native mobile app**, while municipal staff operate via an **admin web dashboard**. The platform runs on **Node.js backend**, **MongoDB database**, and supports offline reporting, media uploads, automated routing, and analytics.

---

## 🛠️ Phase 1: MVP Setup

### 1. Tech Stack
- **Frontend (Mobile App)**: React Native
- **Backend**: Node.js (Express)
- **Database**: MongoDB (Mongoose ODM)
- **Media**: Cloudinary / AWS S3
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Maps**: Google Maps or OpenStreetMap API
- **Auth**: JWT

### 2. Core Features to Build
#### For Citizens (React Native App):
- 📸 Capture photo/video, add text description
- 📍 Auto-GPS tagging
- 📶 Offline mode: save & queue reports for sync & Complaint status tracking with stage-wise updates
- 🔔 Push notifications for updates
- 🈯 Multilingual UI (Hindi, English, local languages)

#### For Admin Staff (Web Portal):
- 🔐 Role-based login (admin, supervisor, staff)
- 🗃️ Complaint dashboard with filters (status, category)
- 🗺️ Map view for complaints
- ✅ Assign/reassign tasks
- 📈 Analytics dashboard (basic)
- After completing task the admin can add comments to the complaint and can also add the status of the complaint.

---

## 🧑‍💻 Phase 2: Development Steps — Beginner Friendly

### 🌐 Step 1: Backend Folder Structure
```
civic-backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── .env
├── server.js
```
### 🌐 Step 2: Frontend Folder Structure
```
civic-frontend/
├── components/
├── screens/
├── routes/
├── assets/
├── reducers/
├── actions/
├── constants/
├── navigation/
├── utils/
├── styles/
├── types/
├── hooks/
├── services/
├── config/
├── index.js
├── App.js
├── package.json
├── .env
├── .gitignore
├── README.md
├── .eslintrc.js
├── .prettierrc.js
├── .babelrc
├── .env
```

### 🧱 Step 3: Backend Models (MongoDB)
#### User Model
```js
// models/User.js
userId, name, phone, language, createdAt, updatedAt, isActive, isDeleted, email, password, isVerified, isAdmin, isStaff, isSupervisor, address, city, state, pincode, latitude, longitude, profilePicture, role, createdBy, updatedBy
```
#### Report Model
```js
// models/Report.js
reportId, reporterId, title, description, category, location, status, createdAt, updatedAt, isActive, isDeleted, latitude, longitude, media, comments, createdBy, updatedBy, complaintStatus, complaintStatusUpdatedAt, complaintStatusUpdatedBy, complaintStatusUpdatedByRole, complaintStatusUpdatedByCommen
```
#### Media Model
```js
// models/Media.js
mediaId, reportId, type (image/video), url, thumbnailUrl, createdAt, updatedAt, isActive, isDeleted, createdBy, updatedBy, mediaType, mediaSize, mediaDuration
```

### 🚀 Step 4: Backend API Endpoints
```http
POST   /api/auth/register    --> Register user
POST   /api/auth/login       --> Login & get token
POST   /api/reports          --> Submit complaint (with media)
GET    /api/reports/:id      --> View complaint details
GET    /api/reports          --> List/filter complaints
PATCH  /api/reports/:id      --> Update status
```

### 📲 Step 5: React Native App Screens
- HomeScreen (List of complaints)
- CreateReportScreen (form + camera)
- ReportDetailScreen (status tracking)
- MyReportsScreen
- Login/RegisterScreen

Use AsyncStorage for local drafts + sync logic.
Use Expo Camera, Location APIs, and background tasks.

### 🧩 Step 6: Sync + Notifications
- Use FCM to send updates
- Track complaint stages: `submitted → acknowledged → assigned → resolved`
- Add offline queue using AsyncStorage

---

## ⚙️ Phase 3: Advanced System Features (Post MVP)

### 🔀 Auto-Routing Engine
- Phase 1: Rule-based (category + location → department)
- Phase 2: ML-enhanced (use metadata + AI)

### 🧵 Media Service
- Validate file type/size
- Generate thumbnails
- Store on S3 / Cloudinary
- Use CDN for fast delivery

### 🕵️ Admin Dashboard Features
- Role-based dashboard
- View reports with filters
- Assign tasks to field staff
- Comment system for reports
- SLA enforcement

---

## 🔒 Security & Compliance
- JWT + role-based access
- HTTPS enforced
- Rate limiting & anti-bot filters
- Encrypt PII & media links
- Audit logs for all actions
- Consent prompts for location/media

---

## 📊 Analytics & Reporting
- Use MongoDB aggregations for reporting
- Reports by region, status, category
- Export reports monthly
- Add hotspot detection via map clusters

---

## 🌍 Localization & Accessibility
- Use i18n framework (e.g., `i18next`)
- Hindi, English, tribal dialects
- Voice prompts (TTS) & large font toggle

---

## 📈 Monitoring & Deployment
- Use PM2 + Mongo Atlas for hosting
- GitHub + CI/CD workflows
- Uptime alerts via Cron + Status checks

---

## 🧪 Testing & QA
- Backend: Jest + Supertest
- React Native: Jest + Detox
- Use Postman for API testing

---

## 📅 Roadmap
| Month | Milestone |
|-------|-----------|
| 0–1   | Setup, login, DB, first report flow |
| 2     | Offline mode + media uploads |
| 3     | Admin dashboard + routing logic |
| 4–6   | Notifications + Analytics + Hotspot map |
| 6+    | ML routing + Government integrations |

---

## 🧩 Future Additions
- WhatsApp/SMS fallback reporting
- Aadhaar e-KYC integration
- Payment gateway for challans/fines
- NGO dashboard for issue verification

---

Need help understanding or implementing any specific part? Just ask `/explain <section>` or `/build <feature>` to get a step-by-step tutorial.