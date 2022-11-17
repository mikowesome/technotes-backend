const NoteModel = require('../models/NoteModel')
const UserModel = require('../models/UserModel')
const asyncHandler = require('express-async-handler')

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await NoteModel.find().lean()
    if (!notes?.length) {
        return res.status(404).json({message: 'No notes found'})
    }
    res.status(200).json(notes)
})

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { userID, title, body } = req.body

    // Confirm data
    if (!userID || !title || !body) {
        return res.status(400).json({message: 'All fields are required.'})
    }

    // Check if user exist
    const user = await UserModel.findById(userID).lean().exec()

    if (!user) {
        return res.status(404).json({message: 'Cannot create note. User does not exist.'})
    }

    const noteObject = {user: userID , title, body}

    // Create and store new note
    const newNote = await NoteModel.create(noteObject)

    if (newNote) {
        res.status(200).json({message: 'New note created'})
    } else {
        res.status(400).json({message: 'Invalid note data received'})
    }
})

// @desc Update note
// @route PUT /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const { id, title, body, userID, completed } = req.body

    // Confirm data
    if (!id || !title || !body || !userID || typeof completed !== 'boolean') {
        return res.status(400).json({message: 'All fields are required'})
    }

    // Check if user exist
    const user = await UserModel.findById(userID).lean().exec()

    if (!user) {
        return res.status(404).json({message: 'Cannot update note. User does not exist.'})
    }

    const note = await NoteModel.findById(id).exec()

    if (!note) {
        return res.status(404).json({message: 'Note not found'})
    }

    note.title = title
    note.body = body
    note.user = userID
    note.completed = completed

    const updatedNote = await note.save()

    res.status(200).json({message: `${updatedNote.title} successfully updated`})
})

// @desc Delete note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({message: 'Note ID required'})
    }

    const note = await NoteModel.findById(id)

    if (!note) {
        return res.status(404).json({message: 'Note not found'})
    }

    const result = await note.deleteOne()

    const reply = `Note with title ${result.title} and ID ${result.id} deleted`

    res.status(200).json({message: reply})
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}
