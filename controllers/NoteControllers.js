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
    
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await UserModel.findById(note.user).lean().exec()
        return {...note, username: user.username}
    }))

    res.status(200).json(notesWithUser)
})

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    // Confirm data
    if (!user || !title || !text) {
        return res.status(400).json({message: 'All fields are required.'})
    }

    // Check for duplicate title
    const duplicate = await NoteModel.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    const noteObject = { user, title, text }

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
    const { id, title, text, user, completed } = req.body

    // Confirm data
    if (!id || !title || !text || !user || typeof completed !== 'boolean') {
        return res.status(400).json({message: 'All fields are required'})
    }

    // Confirm note exists
    const note = await NoteModel.findById(id).exec()

    if (!note) {
        return res.status(404).json({message: 'Note not found'})
    }

    // Check for duplicate title
    const duplicate = await NoteModel.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.title = title
    note.text = text
    note.user = user
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

    const note = await NoteModel.findById(id).exec()

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
