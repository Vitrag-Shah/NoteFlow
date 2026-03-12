# 📝 NoteFlow — REST API Documentation

Welcome to the official API documentation for **NoteFlow**, a high-performance Notes Management application built with Node.js, Express, and Prisma. This document provides all the necessary information for developers to integrate with the NoteFlow backend.

---

## 🚀 Project Overview

NoteFlow is a secure, scalable platform designed to help users manage their thoughts and tasks efficiently. It features a robust authentication system, user management, and full CRUD capabilities for personal notes with rich-text support.

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-Validator

---

## 🌐 Base URL

All API requests should be made to the following base URL:

```bash
http://localhost:5000
```

> [!NOTE]
> Ensure the server is running on port 5000 before making requests.

---

## 🔐 Authentication

NoteFlow uses **JWT (JSON Web Tokens)** for secure API access.

### 🔑 Authorization Header
For all protected routes, you must include the token in the request header:

| Key | Value |
| :--- | :--- |
| **Authorization** | `Bearer <your_jwt_token>` |

---

## 🛤️ API Endpoints

### 1️⃣ Authentication (`/auth`)
Public endpoints for user registration and access.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new user account | No |
| `POST` | `/auth/login` | Authenticate and get token | No |
| `GET` | `/auth/me` | Get current user profile | **Yes** |

---

### 2️⃣ Personal Notes (`/notes`)
Manage your personal notes. These are scoped to the authenticated user.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/notes` | Fetch all personal notes | **Yes** |
| `GET` | `/notes/:id` | Get a specific note by ID | **Yes** |
| `POST` | `/notes` | Create a new note | **Yes** |
| `PUT` | `/notes/:id` | Update an existing note | **Yes** |
| `DELETE` | `/notes/:id` | Delete a note permanently | **Yes** |

---

### 3️⃣ User Management (`/users`)
Administrative and profile endpoints.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | List all users (supports pagination) | **Yes** |
| `GET` | `/users/:id` | Get details of a specific user | **Yes** |
| `POST` | `/users` | Create a new user (admin) | **Yes** |
| `PUT` | `/users/:id` | Update user details | **Yes** |
| `DELETE` | `/users/:id` | Remove a user account | **Yes** |

---

## 📋 Request/Response Examples

### 🔹 Register User
**Route:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@example.in",
  "password": "Password123"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.in",
      "role": "user",
      "createdAt": "2026-03-12T09:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

---

### 🔹 Login
**Route:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "priya.patel@email.in",
  "password": "SecurePassword!45"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "name": "Priya Patel",
      "email": "priya.patel@email.in",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

---

### 🔹 Create Note
**Route:** `POST /notes`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Meeting notes from Bengaluru client call",
  "content": "Discussed the Q3 roadmap for the infrastructure upgrade. Follow up next Tuesday."
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "id": 105,
    "title": "Meeting notes from Bengaluru client call",
    "content": "Discussed the Q3 roadmap for the infrastructure upgrade. Follow up next Tuesday.",
    "userId": 2,
    "createdAt": "2026-03-12T10:15:00.000Z",
    "updatedAt": "2026-03-12T10:15:00.000Z"
  }
}
```

---

### 🔹 Get All Notes
**Route:** `GET /notes`  
**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Notes fetched successfully",
  "data": [
    {
      "id": 105,
      "title": "Meeting notes from Bengaluru client call",
      "content": "Discussed the Q3 roadmap...",
      "updatedAt": "2026-03-12T10:15:00.000Z"
    },
    {
      "id": 102,
      "title": "Prepare for UPSC interview",
      "content": "Read current affairs and ethics case studies.",
      "updatedAt": "2026-03-11T16:20:00.000Z"
    }
  ]
}
```

---

### 🔹 List All Users (with Search/Pagination)
**Route:** `GET /users?page=1&limit=5&search=Shar`  
**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.in",
      "role": "admin",
      "createdAt": "2026-03-12T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}
```

---

## ⚠️ Error Handling

The API returns structured error responses with standardized status codes.

**Standard Error Format:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

| Status Code | Description |
| :--- | :--- |
| `200` | **OK**: Request succeeded. |
| `201` | **Created**: Resource created successfully. |
| `400` | **Bad Request**: Missing fields or validation error. |
| `401` | **Unauthorized**: Invalid or missing JWT token. |
| `403` | **Forbidden**: Request not allowed for your role. |
| `404` | **Not Found**: Endpoint or resource does not exist. |
| `409` | **Conflict**: Resource (like email) already exists. |
| `500` | **Server Error**: Internal code issue. |

---

## 📊 Data Models (Prisma)

### User Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Int` | Primary Key (Autoincrement) |
| `name` | `String` | Full name of the user |
| `email` | `String` | Unique email address |
| `password` | `String` | Hashed password (Bcrypt) |
| `role` | `String` | 'user' (default) or 'admin' |

### Note Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Int` | Primary Key (Autoincrement) |
| `title` | `String` | Max 100 characters |
| `content` | `String` | Rich-text or plain text content |
| `userId` | `Int` | Foreign Key (Owner of the note) |

---

## 🧪 Testing with Postman

1.  **Environment**: Create a Postman environment with `base_url = http://localhost:5000`.
2.  **Auth Flow**:
    - Use the Register/Login endpoint to get a token.
    - Copy the `token` from the response.
    - In your other requests, go to the **Auth** tab, select **Bearer Token**, and paste your token.
3.  **Variables**: Use variables for `:id` in the URL paths (e.g., `{{base_url}}/notes/105`).

---

