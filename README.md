# NoteFlow — Premium Notes Manager

A full-stack, production-ready Notes Management application with rich-text capabilities, secure authentication, and a stunning dark UI.

## 📝 Features

-   **Rich-Text Editor**: Powered by React-Quill for bolding, lists, links, and more.
-   **User-Specific Notes**: Every user has their own private workspace.
-   **Full CRUD**: Create, view, edit, and delete notes instantly.
-   **Toast Notifications**: Professional success/failure feedback using `react-hot-toast`.
-   **JWT Auth**: Secure login/register with bcrypt password hashing.
-   **Responsive Design**: Premium dark-mode aesthetics that work on mobile and desktop.

---

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Axios, React Router, React Quill, React Hot Toast.
-   **Backend**: Node.js, Express, Prisma ORM, JWT, Bcrypt.
-   **Database**: PostgreSQL (Neon).
-   **Deployment**: Vercel (Frontend) & Render (Backend).

---

## ⚙️ Local Setup

### 1. Backend
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```

---

## 🚀 Deployment

Complete instructions are available in [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Links
- [API Documentation](./API_DOCUMENTATION.md)
- [Postman Collection](./postman_collection.json)
