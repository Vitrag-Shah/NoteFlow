const bcrypt = require('bcryptjs');
const { body, param } = require('express-validator');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { validate } = require('../middleware/validate.middleware');

// ─── Validation Rules ──────────────────────────────────────────────────────

const createUserValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
  validate,
];

const updateUserValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
  validate,
];

// ─── Controllers ───────────────────────────────────────────────────────────

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isBanned: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * @desc    Get all users (with optional pagination & search)
 * @route   GET /users
 * @access  Protected
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(res, users, total, page, limit);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /users/:id
 * @access  Protected
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: USER_SELECT,
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user
 * @route   POST /users
 * @access  Protected
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'user' },
      select: USER_SELECT,
    });

    return successResponse(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user by ID
 * @route   PUT /users/:id
 * @access  Protected
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return errorResponse(res, 'User not found', 404);
    }

    // If email changing, check uniqueness
    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return errorResponse(res, 'Email is already in use by another account', 409);
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: USER_SELECT,
    });

    return successResponse(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user by ID
 * @route   DELETE /users/:id
 * @access  Protected
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return errorResponse(res, 'User not found', 404);
    }

    if (existing.email === 'n@gmail.com') {
      return errorResponse(res, 'This user is protected and cannot be banned.', 403);
    }

    // Instead of complete deletion, we ban them
    await prisma.user.update({
      where: { id: Number(id) },
      data: { isBanned: true }
    });

    // Emit socket event to notify the banned user specifically in their room
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${id}`).emit('user_banned', { userId: Number(id) });
    }

    return successResponse(res, null, 'User banned successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  createUserValidation,
  updateUserValidation,
};
