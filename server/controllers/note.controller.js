const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// ─── Validation Rules ──────────────────────────────────────────────────────
const noteValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('content').trim().notEmpty().withMessage('Content is required'),
  validate,
];

// ─── Controllers ───────────────────────────────────────────────────────────

const getAllNotes = async (req, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });
    return successResponse(res, notes, 'Notes fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const note = await prisma.note.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
    });
    if (!note) return errorResponse(res, 'Note not found', 404);
    return successResponse(res, note);
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const note = await prisma.note.create({
      data: { title, content, userId: req.user.id },
    });
    return successResponse(res, note, 'Note created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const noteId = Number(req.params.id);

    const existing = await prisma.note.findFirst({
      where: { id: noteId, userId: req.user.id },
    });
    if (!existing) return errorResponse(res, 'Note not found', 404);

    const updated = await prisma.note.update({
      where: { id: noteId },
      data: { title, content },
    });
    return successResponse(res, updated, 'Note updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const noteId = Number(req.params.id);
    const existing = await prisma.note.findFirst({
      where: { id: noteId, userId: req.user.id },
    });
    if (!existing) return errorResponse(res, 'Note not found', 404);

    await prisma.note.delete({ where: { id: noteId } });
    return successResponse(res, null, 'Note deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  noteValidation,
};
