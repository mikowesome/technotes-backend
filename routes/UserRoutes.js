const express = require('express')
const { getAllUsers, createNewUser, updateUser, deleteUser } = require('../controllers/UserControllers')
const router = express.Router()

router.route('/')
    .get(getAllUsers)
    .post(createNewUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router