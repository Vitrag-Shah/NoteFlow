const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  noteValidation,
} = require('../controllers/note.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.post('/', noteValidation, createNote);
router.put('/:id', noteValidation, updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
