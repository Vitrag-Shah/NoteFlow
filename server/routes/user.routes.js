const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  createUserValidation,
  updateUserValidation,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes below are protected
router.use(protect);

// GET /users        — list all users (supports ?page=1&limit=10&search=)
router.get('/', getAllUsers);

// GET /users/:id    — get one user
router.get('/:id', getUserById);

// POST /users       — create user
router.post('/', createUserValidation, createUser);

// PUT /users/:id    — update user
router.put('/:id', updateUserValidation, updateUser);

// DELETE /users/:id — delete user
router.delete('/:id', deleteUser);

module.exports = router;
