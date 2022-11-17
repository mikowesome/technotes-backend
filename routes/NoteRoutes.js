const express = require('express')
const { getAllNotes, createNewNote, updateNote, deleteNote } = require('../controllers/NoteControllers')
const router = express.Router()

router.route('/')
    .get(getAllNotes)
    .post(createNewNote)
    .put(updateNote)
    .delete(deleteNote)

module.exports = router