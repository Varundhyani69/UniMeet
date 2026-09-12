# 🧡 UniMeet

A modern productivity and social coordination web application for university students.  
[Live Demo 🔗](https://unimeet-lpu.onrender.com)

---

## 🚀 Overview

**UniMeet** is a responsive web app that helps students manage schedules, find mutual free time, 
chat with friends, and discover campus events. Initially developed for **Lovely Professional University (LPU)**, 
UniMeet simplifies student life by bringing productivity and social features together on one platform.

---

## 🔐 Authentication

- LPU email-based registration and login
- Role-based access: Student & Admin

---

## 🧩 Core Features

### 📅 Timetable Management
- Upload or build your timetable
- Automatic parsing (PDF/Image → JSON)
- Manual timetable builder included

### 👥 Friend & Chat System
- Search and add friends via username or Reg. No.
- Real-time chat functionality
- Notifications for new messages and friend requests

### 🕒 Free Slot Matching
- Visualize mutual free time with friends
- View currently available friends on dashboard

### 👤 Profile Management
- Editable profile: photo, bio, section, course, etc.
- Privacy control over sensitive fields

---

## 📱 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB (Mongoose ODM)
- **File Processing:** pdfjs-dist, xlsx, tesseract.js
- **Deployment:** Render
- **CI/CD:** GitHub Actions

---

## 🔄 CI/CD Pipeline

This project uses **GitHub Actions** for automated testing and deployment:

### Continuous Integration (CI)
- Runs on every push and pull request to `main`
- Lints backend and frontend code
- **Runs automated tests** (22 backend tests + 14 frontend tests)
- Builds frontend to catch compilation errors early
- Ensures code quality before merging

### Continuous Deployment (CD)
- Auto-deploys to Render when code is pushed to `main`
- Triggers Render deployment hook
- Performs health check to verify deployment success
- Zero downtime deployments

**Setup Instructions:**
1. Get your Render deploy hook URL from: `Dashboard → Your Service → Settings → Deploy Hook`
2. Add GitHub secrets:
   - `RENDER_DEPLOY_HOOK_URL` - Your Render deploy hook
   - `BACKEND_URL` - Your deployed backend URL (for health checks)
3. Push to `main` - deployment happens automatically!

---

## 📷 UI Highlights

- Responsive design (mobile-first)
- LPU-branded theme: orange, white & black
- Animated elements, sticky bottom navigation on mobile
- Clean chat layout, intuitive navigation, and smart scroll behavior

---

## 🛠 Setup (Local Development)

```bash
git clone https://github.com/your-username/unimeet.git
cd unimeet

# Setup backend
cd backend
npm install
# Create .env file and set variables (MONGO_URI, JWT_SECRET, etc.)
npm run dev

# Setup frontend
cd ../frontend
npm install
npm run dev
```

---

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
BACKEND_URL=https://your-app.onrender.com
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_URL=your_cloudinary_url
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080
```

---

## 📦 Key Libraries

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - Real-time communication
- `jsonwebtoken` - Authentication
- `multer` - File uploads
- `pdfjs-dist` - PDF parsing
- `xlsx` - Excel parsing
- `cloudinary` - Image storage

### Frontend
- `react` & `react-dom` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `socket.io-client` - WebSocket client
- `tailwindcss` - Styling
- `framer-motion` - Animations
- `lucide-react` - Icons

---

## 🧪 Testing

This project includes automated tests to ensure code quality and reliability.

### Backend Tests (Jest)
- **22 tests** covering:
  - Health endpoint validation
  - JWT token generation and verification
  - Password hashing with bcrypt
  - Timetable parsing logic (subject code cleaning, empty timetable structure)

**Run tests:**
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Run in watch mode
npm run test:coverage   # Generate coverage report
```

### Frontend Tests (Vitest)
- **14 tests** covering:
  - Authentication utils (localStorage, token management)
  - Email validation (LPU domain checking)
  - Timetable utilities (time slot validation, course code format)
  - Free slot matching algorithm

**Run tests:**
```bash
cd frontend
npm test                # Run all tests
npm run test:watch      # Run in watch mode
npm run test:coverage   # Generate coverage report
```

### CI Integration
All tests run automatically on every push/PR via GitHub Actions, ensuring no broken code reaches production.

---

## 📝 License

MIT

---

## 👨‍💻 Author

Built with ❤️ for university students

---

## 🔗 Links

- [Live Application](https://unimeet-lpu.onrender.com)
- [GitHub Repository](https://github.com/Varundhyani69/UniMeet)
