const express = require('express');
const router = express.Router();
const { register, login, getMe, registerValidation, loginValidation } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// POST /auth/register
router.post('/register', registerValidation, register);

// POST /auth/login
router.post('/login', loginValidation, login);

// GET /auth/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
