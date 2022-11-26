const NoteModel = require("../models/NoteModel");
const UserModel = require("../models/UserModel");
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await UserModel.find().select('-password').lean()
    if (!users?.length) {
        return res.status(404).json({ message: 'No users found' })
    }
    res.status(200).json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body

    // Confirm data
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate
    const duplicate = await UserModel.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if (duplicate) {
        return res.status(409).json( {message: 'Username is already taken. Please enter a different username'} )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const userObject = (!Array.isArray(roles) || !roles.length) 
                        ? { username, password: hashedPassword }
                        : { username, password: hashedPassword, roles} 

    // Create and store new user
    const newUser = await UserModel.create(userObject)

    if (newUser) {
        res.status(201).json({message: `New user ${username} created`})
    } else {
        res.status(400).json({message: 'Invalid user data received'})
    }
})

// @desc Update user
// @route PUT /users
// @access Private

const updateUser = asyncHandler(async (req, res) => {
    const { id, username, password, roles, active } = req.body

    // Confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({message: 'All fields are required'})
    }

    const user = await UserModel.findById(id).exec()

    if (!user) {
        return res.status(400).json({message: 'User not found'})
    }

    // Check for duplicate
    const duplicate = await UserModel.findOne({username}).collation({ locale: 'en', strength: 2 }).lean().exec()
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message: 'Username is already taken. Please enter a different username'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.status(200).json({message: `${updatedUser.username} updated`})
})
// @desc Delete user
// @route DELETE /users
// @access Private

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body
    
    if (!id) {
        return res.status(400).json({message: 'User ID required'})
    }

    const note = await NoteModel.findOne({user: id}).lean().exec()

    if (note) {
        return res.status(400).json({message: 'User has assigned notes'})
    }

    const user = await UserModel.findById(id).exec()

    if (!user) {
        return res.status(400).json({message: 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.status(200).json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}