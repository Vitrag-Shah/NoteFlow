# API Documentation — NoteFlow (Notes Manager)

**Base URL**: `https://your-backend-url.render.com` (Production) / `http://localhost:5000` (Local)

All protected routes require an `Authorization: Bearer <token>` header.

---

## 🔐 Authentication

### POST `/auth/register`
Create a new user account.
- **Body**: `{ "name": "...", "email": "...", "password": "..." }`
- **Response**: `201 Created` with User data and JWT Token.

### POST `/auth/login`
Sign in to an existing account.
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `200 OK` with User data and JWT Token.

### GET `/auth/me` (Protected)
Get current authenticated user's profile.

---

## 📝 Notes Management (Protected)

### GET `/notes`
Fetch all notes belong to the authenticated user.
- **Response**: `200 OK` with list of notes.

### GET `/notes/:id`
Fetch a specific note by ID.
- **Response**: `200 OK` or `404 Not Found`.

### POST `/notes`
Create a new rich-text note.
- **Body**: `{ "title": "...", "content": "<p>My rich text...</p>" }`
- **Response**: `201 Created`.

### PUT `/notes/:id`
Update an existing note.
- **Body**: `{ "title": "...", "content": "..." }`
- **Response**: `200 OK`.

### DELETE `/notes/:id`
Permanently delete a note.
- **Response**: `200 OK`.

---

## ⚠️ Error Responses

- **401 Unauthorized**: Missing/invalid token or login failed (shows toast on frontend).
- **422 Unprocessable Entity**: Validation failed (e.g., missing title).
- **409 Conflict**: Registration with an existing email.
- **404 Not Found**: Resource does not exist.
