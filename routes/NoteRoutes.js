const express = require('express')
const { getAllNotes, createNewNote, updateNote, deleteNote } = require('../controllers/NoteControllers')
const verifyJWT = require('../middleware/verifyJWT')
const router = express.Router()

router.use(verifyJWT)

router.route('/')
    .get(getAllNotes)
    .post(createNewNote)
    .put(updateNote)
    .delete(deleteNote)

module.exports = router