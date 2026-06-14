# KaroGrade 🎓
### Automated MCQ Grading and Assessment System

KaroGrade is a complete full-stack web application designed for schools, colleges, and universities. It allows educators (Admins) to configure, publish, and manage robust multiple-choice examinations while granting students a secure portal to complete tests with automated auto-grading, corrections feedback, and a strictly enforced one-attempt restriction policy.

---

## 🚀 Core Features

### 1. Robust User Roles
*   **ADMIN (Teacher):** Authorized to manage, edit, and publish examinations containing custom multiple-choice questions (with Options A-D), specify correct selections, attach feedback/explanations, and view all student submission sheets.
*   **STUDENT:** Restricted to registering, viewing available exams in their course catalog, and taking exams within a distraction-free, timed environment.

### 2. Precise One-Attempt Lock Policy
To support maximum academic integrity, students are permanently locked out of an exam once submitted:
*   **Backend Enforced:** A compound unique database index constraint on `studentId + examId` guarantees no student can double-submit, bypassing any browser modifications.
*   **Frontend Responsive:** Completed exams are immediately labeled as "Completed" with buttons disabled.

### 3. Smart Auto-Grading & Correction Pedagogics
*   Submissions are instantaneously evaluated against correct answers on the backend.
*   Students gain access to an interactive correction report mapping:
    *   Dynamic circular score percentages.
    *   Incorrect vs. correct selections labeled on a color-coded option board.
    *   Thorough educator annotations explaining the textbook concepts behind each correct answer.

### 4. Immunity Against Client-Side Leaks
*   *Cheater Defense:* While taking an exam, the API route `GET /api/student/exams/:id` automatically **strips out** correct answers and explanations. Grading is calculated exclusively server-side, preventing students from inspecting raw JSON payloads via DevTools to find answers.

---

## 🛠️ Complete Project Structure

The codebase is organized in a unified, high-performance TypeScript single-repo layout. This guarantees 105% dev preview compatibility in Google AI Studio while preserving a strict decoupled MVC backend structure and Vite React workspace:

```
karograde/
├── src/                      # --- CLIENT (FRONTEND VITE) ---
│   ├── components/           # Extensible shared widgets
│   ├── context/              # Authentication context layer (AuthContext.tsx)
│   ├── pages/                # Individual fully-loaded pages
│   │   ├── Landing.tsx       # Landing introduction page
│   │   ├── Login.tsx         # User authentication login
│   │   ├── Signup.tsx        # Role-based user creation
│   │   ├── AdminDashboard.tsx# Core Teacher control dashboard
│   │   ├── StudentDashboard.tsx # Student dashboard & stats
│   │   ├── CreateExam.tsx    # Exam / Question designer form
│   │   ├── TakeExam.tsx      # Timed immersive testing stage
│   │   └── ResultsPage.tsx   # Grading slip and correction sheets
│   ├── services/             # Dynamic Axios configurations
│   │   └── api.ts            # Dynamic Axios client with JWT support
│   ├── App.tsx               # Primary Route Guard controllers
│   ├── index.css             # Tailwind styling and custom Google Fonts
│   └── main.tsx              # React mounting root
│
├── server/                   # --- SERVER (BACKEND MVC) ---
│   ├── config/               # Database and connector setup
│   │   └── db.ts             # Auto-fallback database controller
│   ├── controllers/          # Business logic handlers
│   │   ├── authController.ts   # Signup / Login controls
│   │   ├── adminController.ts  # Exam/Question management
│   │   └── studentController.ts# Taking and grading tests
│   ├── middleware/           # System level filters
│   │   └── auth.ts           # Token authentication and role filters
│   ├── models/               # MongoDB / Mongoose ODM representations
│   │   ├── User.ts
│   │   ├── Exam.ts
│   │   └── Submission.ts
│   └── routes/               # API Router endpoints
│       ├── authRoutes.ts
│       ├── adminRoutes.ts
│       └── studentRoutes.ts
│
├── server.ts                 # Full-stack Node setup & Vite integration
├── tsconfig.json             # TypeScript compiler rules
├── vite.config.ts            # Vite packager configurations
└── package.json              # Package manifest and build automation
```

---

## 🌐 API Specifications Document

### Health Check (Mandatory)
*   `GET /api/health` -> Returns `"KaroGrade API is running"`

### Authentication
*   `POST /api/auth/signup` -> Registers new user (`name`, `email`, `password`, `role`)
*   `POST /api/auth/login` -> Authenticates user, issues JWT

### Admin (Teacher) Controls (Requires JWT + ADMIN role)
*   `POST /api/admin/exams` -> Create an examination program
*   `GET /api/admin/exams` -> View all examination details
*   `PUT /api/admin/exams/:id` -> Update exam settings
*   `DELETE /api/admin/exams/:id` -> Remove an exam
*   `POST /api/admin/questions` -> Append questions to exams
*   `PUT /api/admin/questions/:id` -> Edit question details
*   `DELETE /api/admin/questions/:id` -> Delete questions
*   `GET /api/admin/results` -> Retrieve all student performance sheets

### Student Controls (Requires JWT + STUDENT role)
*   `GET /api/student/exams` -> View eligible exams list
*   `GET /api/student/exams/:id` -> Details of an exam (Locked & stripped of answers)
*   `POST /api/student/submit` -> Submit graded answers (Grade auto-calculated, 1-attempt check is enforced)
*   `GET /api/student/results` -> View personal historic list of grading sheets

---

## ⚓ Deployment & Local Development Setup

### 1. Requirements Configurations (.env)

Modify or create local `.env` values mapping your target endpoints:

```env
# SERVER KEYS
PORT=3000
JWT_SECRET="YOUR_SECRET_JWT_SIGNING_KEY"
MONGO_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/karograde"

# FOR PRODUCTION DEPLOYMENTS (VITE CONTEXT)
VITE_API_URL="https://your-backend-render-endpoint.com"
```

### 2. Booting Local Environment
Install project packages and launch the dev client-server sequence:
```bash
# 1. Install packages
npm install

# 2. Run dev mode (Runs Vite client and Express endpoints nested on port 3000)
npm run dev
```

### 3. Production Compilation Procedures
The app compiles to a high-speed production target:
```bash
# Compile front-end assets to /dist and bundle server.ts CJS executable
npm run build

# Start the compiled self-contained production cluster
npm run start
```

---

## ☁️ Cloud Deployments Guidelines

### Backend (Render or Railway)
1. Add a Node project.
2. Configure **Environment Variables** matching PORT, JWT_SECRET, and MONGO_URI.
3. Use the startup sequence `npm run build` and `npm run start`.
4. Due to the in-memory fallback helper configured inside `server/config/db.ts`, KaroGrade has built-in **Immunity to database cold-starts** — it will gracefully operate and wait for MongoDB connections without crashing the server.

### Frontend Client-side (Vercel or Netlify)
1. Link your repository.
2. Set the build directory to target `dist` compiled assets.
3. Configure `VITE_API_URL` pointing to your deployed Backend URL.
