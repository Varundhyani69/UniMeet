# 🧡 UniMeet

A modern productivity and social coordination web application for university students.  
[Live Demo 🔗](https://unimeet-3ozr.onrender.com)

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

- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Socket:** Socket.IO (real-time chat)
- **Deployment:** Render

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

