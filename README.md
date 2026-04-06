# Employee Onboarding Portal

A modern, full-stack employee onboarding platform built with **Spring Boot** and **React**. Designed for HR administrators to manage new hire onboarding—assign tasks, request documents, and track progress—while employees can complete tasks, upload documents, and monitor their onboarding journey.

![Dashboard](https://img.shields.io/badge/Dashboard-Admin%20%26%20Employee-6366f1) ![Auth](https://img.shields.io/badge/Auth-Firebase%20Google%20OAuth-FBBC05) ![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.4-6DB33F) ![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB)

---

## ✨ Features

### Admin Portal
- **Dashboard** with total employees, tasks, completion rates, and per-employee progress table
- **Task Management** — Create, edit, delete, and assign tasks with priority/deadline
- **Document Requests** — Request documents from employees and track submission status

### Employee Portal
- **Personalized Dashboard** with progress ring, stat cards, upcoming deadlines, and quick actions
- **Task Tracking** — View assigned tasks, mark as complete, filter by status/priority/deadline
- **Document Upload** — Drag-and-drop file upload or paste a URL to submit requested documents

### General
- 🔐 **Google OAuth** via Firebase Authentication
- 🌙 **Dark Mode** support
- 📱 **Responsive** design with Tailwind CSS
- 🔍 **Search & Filter** for tasks with pagination
- 📂 **File Upload** up to 10MB (PDF, DOC, JPG, PNG)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Spring Boot 3.4, Spring Security, Spring Data JPA |
| **Frontend** | React 18, Vite, Tailwind CSS v3, React Router v6 |
| **Database** | MySQL 8 (Docker) |
| **Auth** | Firebase Authentication (Google OAuth) |
| **Icons** | React Icons (Heroicons) |
| **Toasts** | React Hot Toast |

---

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- Docker & Docker Compose
- Firebase project with Google Sign-in enabled

### 1. Clone the Repository
```bash
git clone https://github.com/PritamSanagapalli/On-Boarding-Platform.git
cd On-Boarding-Platform
```

### 2. Start MySQL Database
```bash
docker-compose up -d
```

### 3. Configure Firebase
- Place your `firebase-service-account.json` in `backend/src/main/resources/`
- Create `frontend/.env` with your Firebase config:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Run Backend
```bash
cd backend
mvn spring-boot:run
```
Backend starts on **http://localhost:8080**

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on **http://localhost:5173**

---

## 📁 Project Structure

```
├── backend/
│   ├── src/main/java/com/onboarding/
│   │   ├── config/          # Security, Firebase, CORS configs
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── exception/       # Global error handling
│   │   ├── filter/          # Firebase token auth filter
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Spring Data repositories
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Badge, Modal, LoadingSpinner
│   │   │   ├── dashboard/   # Admin & Employee dashboards
│   │   │   ├── documents/   # Document list with file upload
│   │   │   ├── layout/      # Sidebar, Navbar, Layout
│   │   │   └── tasks/       # Task list with CRUD
│   │   ├── config/          # Firebase config
│   │   ├── context/         # Auth context provider
│   │   ├── pages/           # Route pages
│   │   └── services/        # Axios API service
│   └── tailwind.config.js
└── docker-compose.yml
```

---

## 👤 Default Roles

| Role | Capabilities |
|------|-------------|
| **ADMIN** | Create/edit/delete tasks, request documents, view all employees |
| **EMPLOYEE** | View tasks, upload documents, track progress |

> New users are created with `EMPLOYEE` role by default. To promote to admin, update the `role` column in the `users` table.

---

## 📄 License

This project is for academic/educational purposes.
