# 📚 Mockingbird - Hierarchical Note-Taking Application

A modern, full-stack note-taking application built with the MERN stack. Mockingbird allows students and professionals to organize notes in a hierarchical folder structure with rich text formatting, image uploads, and voice recording capabilities.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 📁 Hierarchical Organization
- **Nested Folder Structure**: Create unlimited parent folders and subfolders (e.g., Subject → Chapter → Topic)
- **Breadcrumb Navigation**: Easy navigation through folder hierarchy
- **Google Keep-inspired Dark UI**: Clean, distraction-free interface

### 📝 Rich Text Editing
- **Text Formatting**: Bold, Italic, Strikethrough
- **Text Styling**: Change font size and highlight colors
- **Color Customization**: Multiple text color options
- **Auto-save**: Notes save automatically on blur

### 🎤 Voice Recording
- **Direct Recording**: Record voice notes directly in the app (no file upload needed)
- **Playback**: Built-in audio player for voice notes
- **Cloud Storage**: All recordings stored securely on Cloudinary

### 📷 Image Management
- **Image Uploads**: Drag and drop or select images
- **Cloud-Based**: Images stored on Cloudinary CDN for fast loading
- **Gallery View**: Visual display of all note images

### 🔒 Secure Authentication
- **JWT-based Auth**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Private Notes**: Each user's notes are completely isolated

---

## 🛠️ Tech Stack

### Frontend
- **React** (v18+) - UI library
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library
- **CSS3** - Custom styling (Google Keep dark theme)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

### Cloud Services
- **MongoDB Atlas** - Database hosting
- **Cloudinary** - Media storage (images & voice notes)

### Authentication & Security
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

---

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Cloudinary account

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/mockingbird.git
cd mockingbird
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Create .env file
touch .env
```

Add to `.env`:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Frontend Setup
```bash
cd client
npm install
```

### 4. Run Application
```bash
# Terminal 1: Start backend (from root)
node server.js

# Terminal 2: Start frontend (from client folder)
npm start
```

App runs on:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

## 🗂️ Project Structure
